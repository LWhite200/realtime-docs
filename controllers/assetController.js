/*
    File management system with creator/fileName format
*/
const fs = require('fs');
const path = require('path');

// Path to assets information
const assetsLocation = path.join(__dirname, '../model/assetTest');
const EachUserAssetMap = path.join(__dirname, '../model/assetTest.json');
const usersFilePath = path.join(__dirname, '../model/users.json');

// Initialize directories and files if they don't exist
if (!fs.existsSync(assetsLocation)) {
    fs.mkdirSync(assetsLocation, { recursive: true });
}
if (!fs.existsSync(EachUserAssetMap)) {
    fs.writeFileSync(EachUserAssetMap, JSON.stringify({}, null, 2));
}

const userExists = (username) => {
    if (!fs.existsSync(usersFilePath)) return false;
    try {
        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        return Array.isArray(users) && users.some(user => user.username === username);
    } catch (err) {
        console.error('Error reading users.json:', err);
        return false;
    }
};

// Helper functions
const getAssetMap = () => {
    try {
        const data = fs.readFileSync(EachUserAssetMap, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading asset map:', err);
        return {};
    }
};

const updateAssetMap = (data) => {
    fs.writeFileSync(EachUserAssetMap, JSON.stringify(data, null, 2));
};

const ensureUserDirectory = (username) => {
    const userDir = path.join(assetsLocation, username);
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }
    return userDir;
};

const fileExists = (creator, fileName) => {
    const filePath = path.join(assetsLocation, creator, `${fileName}.json`);
    return fs.existsSync(filePath);
};

// Main file operations
const saveOrUpdateFile = (req, res) => {
    const username = req.user;
    if (!username) {
        return res.status(400).json({ error: 'Missing user context' });
    }

    const { fileName, fileType, creatorName, dateCreated, lastEdited, lastEditor, fileData } = req.body;
    if (!fileName || !fileData) {
        return res.status(400).json({
            error: 'fileName and fileData are required',
            received: req.body
        });
    }


    try {
        // Check if fileName is in creator/fileName format
        let fType = fileType;
        let creator = username;
        let actualFileName = fileName;
        let isExistingFile = false;

        if (fileName.includes('/')) {
            [creator, actualFileName] = fileName.split('/');
            
            // Verify the file exists in the creator's directory
            const existingFilePath = path.join(assetsLocation, creator, `${actualFileName}.json`);
            isExistingFile = fs.existsSync(existingFilePath);
        }

        // Determine where to save the file (always in creator's directory if existing)
        const saveDir = isExistingFile ? creator : username;
        const userDir = ensureUserDirectory(saveDir);
        const filePath = path.join(userDir, `${actualFileName}.json`);
        
        // Save/update the file content
        // Also add more attributes here when the time comes
        // Yes here please do not forget
        fs.writeFileSync(filePath, JSON.stringify({
            fType,
            creatorName,
            dateCreated,
            lastEdited,
            lastEditor,
            fileContent: fileData
        }, null, 2));


        /*
        body: JSON.stringify({
            fileName: currentFileName, // object 1
            creatorName: editor, // Fix so actual creator uif the file is new
            dateCreated: new Date().toISOString(),  // !!! !!! !!! please fix so only when file is new
            lastEdited: new Date().toISOString(),
            lastEditor: editor,
            fileData: jsonData.content // object
        })
        */


        // Update the asset map
        const assetMap = getAssetMap();
        
        // Initialize user entry if needed
        if (!assetMap[username]) {
            assetMap[username] = {};
        }

        // Update or create file entry in current user's asset map
        if (!assetMap[username][actualFileName]) {
            assetMap[username][actualFileName] = {
                creator: isExistingFile ? creator : username,
                dateCreated: isExistingFile ? new Date().toISOString() : new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
        } else {
            assetMap[username][actualFileName].lastModified = new Date().toISOString();
        }

        // If this was an existing file, ensure creator's asset map is updated too
        if (isExistingFile && creator !== username) {
            if (!assetMap[creator]) {
                assetMap[creator] = {};
            }
            if (!assetMap[creator][actualFileName]) {
                assetMap[creator][actualFileName] = {
                    creator: creator,
                    dateCreated: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };
            } else {
                assetMap[creator][actualFileName].lastModified = new Date().toISOString();
            }
        }

        updateAssetMap(assetMap);

        return res.json({
            success: true,
            message: 'File saved successfully',
            path: filePath,
            isExistingFile: isExistingFile,
            savedInCreatorDirectory: isExistingFile
        });

    } catch (error) {
        console.error('Error saving file:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        });
    }
};

const getFile = (req, res) => {
    try {
        const { creator, fileName } = req.params;
        
        if (!creator || !fileName) {
            return res.status(400).json({ 
                error: 'Both creator and fileName are required',
                received: req.params
            });
        }

        const filePath = path.join(assetsLocation, creator, `${fileName}.json`);
        console.log('Looking for file at:', filePath); // Debug logging

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                message: 'File not found',
                path: filePath,
                exists: fs.existsSync(filePath)
            });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ 
            fileName: `${creator}/${fileName}`,
            content: JSON.parse(content)
        });

    } catch (error) {
        console.error('File access error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        });
    }
};

const deleteFile = (req, res) => {
    const username = req.user;
    const { fileName } = req.body;

    if (!fileName) {
        return res.status(400).json({ message: 'fileName is required' });
    }

    // Split into creator and filename
    const [creator, actualFileName] = fileName.includes('/') 
        ? fileName.split('/') 
        : [username, fileName];

    // Verify the current user is the creator
    if (creator !== username) {
        return res.status(403).json({ 
            message: 'Only the creator can delete this file',
            details: {
                currentUser: username,
                fileCreator: creator
            }
        });
    }

    const filePath = path.join(assetsLocation, creator, `${actualFileName}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
            message: 'File not found',
            path: filePath
        });
    }

    try {
        // Delete the physical file
        fs.unlinkSync(filePath);

        // Update asset map - remove from all users
        const assetMap = getAssetMap();
        let needsUpdate = false;

        for (const user in assetMap) {
            if (assetMap[user][actualFileName]) {
                delete assetMap[user][actualFileName];
                needsUpdate = true;
                
                if (Object.keys(assetMap[user]).length === 0) {
                    delete assetMap[user];
                }
            }
        }

        if (needsUpdate) {
            updateAssetMap(assetMap);
        }

        return res.json({ 
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
};

const downloadFile = (req, res) => {
    try {
        const { creator, fileName } = req.params;
        
        if (!creator || !fileName) {
            return res.status(400).json({ 
                message: 'Both creator and fileName are required' 
            });
        }

        const filePath = path.join(assetsLocation, creator, `${fileName}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                message: 'File not found',
                path: filePath
            });
        }

        // Set the download filename to just the actual filename (without creator)
        res.download(filePath, `${fileName}.json`, (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ 
                        message: 'Error downloading file',
                        error: err.message
                    });
                }
            }
        });

    } catch (error) {
        console.error('Download processing error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
};

const getAllFiles = (req, res) => {
    const username = req.user;
    const assetMap = getAssetMap();

    // If user has no files in the asset map
    if (!assetMap[username]) {
        return res.json([]);
    }

    // Get all files from the current user's directory
    const files = [];
    const filesToRemove = [];
    
    for (const fileName in assetMap[username]) {
        const fileInfo = assetMap[username][fileName];
        
        // Check if original file still exists
        if (!fileExists(fileInfo.creator, fileName)) {
            filesToRemove.push(fileName);
            continue;
        }
        
        // Format: creator/fileName
        files.push(`${fileInfo.creator}/${fileName}`);
    }

    // Clean up orphaned files
    if (filesToRemove.length > 0) {
        const updatedAssetMap = getAssetMap();
        for (const fileName of filesToRemove) {
            delete updatedAssetMap[username][fileName];
        }
        
        // Clean up if user has no more files
        if (Object.keys(updatedAssetMap[username]).length === 0) {
            delete updatedAssetMap[username];
        }
        
        updateAssetMap(updatedAssetMap);
    }

    res.json(files);
};


// I finally get it to work but then forget to update the assetMap!!!
const renameFile = (req, res) => {
    const creator = req.user;
    const { oldName, newName } = req.body;

    if (!creator || !oldName || !newName) {
        return res.status(400).json({ message: 'Both old and new file names are required.' });
    }

    const oldPath = path.join(assetsLocation, creator, oldName + '.json');
    const newPath = path.join(assetsLocation, creator, newName + '.json');

    if (!fs.existsSync(oldPath)) {
        return res.status(404).json({ message: 'Original file does not exist.' });
    }

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to rename file.' });
        }

        // Update asset map
        const assetMap = getAssetMap();

        for (const user in assetMap) {
            if (assetMap[user][oldName] && assetMap[user][oldName].creator === creator) {
                assetMap[user][newName] = {
                    ...assetMap[user][oldName],
                    lastModified: new Date().toISOString()
                };
                delete assetMap[user][oldName];
            }
        }
        updateAssetMap(assetMap);
        return res.status(200).json({ message: 'File renamed successfully.' });
    });
};

const grantAccess = (req, res) => {
    const accessGiver = req.user;
    const { currentFileName, grantName } = req.body;

    if (!accessGiver || !currentFileName || !grantName) {
        return res.status(400).json({ message: 'Missing required parameters.' });
    }

    const assetMap = getAssetMap();

    // Check if the accessGiver actually has the file
    const fileMeta = assetMap[accessGiver]?.[currentFileName];
    if (!fileMeta) {
        return res.status(404).json({ message: 'File not found under your access.' });
    }

    // Confirm they are the creator of this file
    if (fileMeta.creator !== accessGiver) {
        return res.status(403).json({
            message: 'Only the creator can grant access.',
            creator: fileMeta.creator,
            currentUser: accessGiver
        });
    }

    // Check if grantName is a valid user from users.json
    const grantUserExists = userExists(grantName);
    if (!grantUserExists) {
        return res.status(404).json({ 
            message: `User "${grantName}" does not exist.` 
        });
    }


    // Grant access
    if (!assetMap[grantName]) {
        assetMap[grantName] = {};
    }

    assetMap[grantName][currentFileName] = {
        ...fileMeta,
        lastModified: new Date().toISOString()
    };

    updateAssetMap(assetMap);

    return res.status(200).json({
        message: `Access to "${currentFileName}" granted to ${grantName}.`
    });
};





module.exports = {
    getAllFiles,
    getFile,
    saveOrUpdateFile,
    downloadFile, 
    deleteFile,
    renameFile,
    grantAccess
};