/*
    This is for the management of files, images, data.
*/

const fs = require('fs');
const path = require('path');

// Updated path
const filesDir = path.join(__dirname, '../model/assetTest');
const fileIndexPath = path.join(__dirname, '../model/assetTest.json');

// Ensure files directory exists
// Enhanced directory creation
if (!fs.existsSync(filesDir)) {
    try {
        fs.mkdirSync(filesDir, { recursive: true });
        console.log(`Successfully created directory: ${filesDir}`);
    } catch (err) {
        console.error(`FATAL: Could not create directory ${filesDir}:`, err);
        process.exit(1); // Exit if we can't create the directory
    }
}

// Read file index JSON
const getFileIndex = () => {
    try {
        const data = fs.readFileSync(fileIndexPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
};

const setFileIndex = (data) => {
    fs.writeFileSync(fileIndexPath, JSON.stringify(data, null, 2));
};

const saveOrUpdateFile = (req, res) => {
    console.log('Incoming request to save file');
    console.log('Request body:', req.body);

    const username = req.user;
    if (!username) {
        return res.status(400).json({ error: 'Missing user context' });
    }

    const userDir = path.join(filesDir, username);

    // Ensure user directory exists
    if (!fs.existsSync(userDir)) {
        try {
            fs.mkdirSync(userDir, { recursive: true });
            console.log(`Created user directory: ${userDir}`);
        } catch (err) {
            console.error(`Could not create user directory ${userDir}:`, err);
            return res.status(500).json({ error: 'Failed to create user directory' });
        }
    }

    try {
        const { fileName, fileData } = req.body;

        if (!fileName || !fileData) {
            return res.status(400).json({
                error: 'fileName and fileData are required',
                received: req.body
            });
        }

        const filePath = path.join(userDir, `${fileName}.json`);
        console.log('Saving to:', filePath);

        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
        console.log('File saved successfully');

        // Update index
        const fileIndex = getFileIndex();
        const indexKey = `${username}/${fileName}`;
        const existingIndex = fileIndex.findIndex(f => f.fileName === indexKey);

        if (existingIndex === -1) {
            fileIndex.push({
                fileName: indexKey,
                savedAt: new Date().toISOString(),
                size: JSON.stringify(fileData).length
            });
        } else {
            fileIndex[existingIndex] = {
                ...fileIndex[existingIndex],
                savedAt: new Date().toISOString(),
                size: JSON.stringify(fileData).length
            };
        }

        setFileIndex(fileIndex);

        return res.json({
            success: true,
            message: 'File saved successfully',
            path: filePath
        });

    } catch (error) {
        console.error('Error saving file:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};


const getFile = (req, res) => {
    const username = req.user;
    const fileName = req.params.fileName;
    const userFilePath = path.join(filesDir, username, `${fileName}.json`);

    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    const content = fs.readFileSync(userFilePath, 'utf-8');
    res.json({ fileName, content: JSON.parse(content) });
};

const deleteFile = (req, res) => {
    const username = req.user;
    const { fileName } = req.body;

    if (!fileName) return res.status(400).json({ message: 'fileName is required' });

    const filePath = path.join(filesDir, username, `${fileName}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    fs.unlinkSync(filePath);

    const fileIndex = getFileIndex().filter(f => f.fileName !== `${username}/${fileName}`);
    setFileIndex(fileIndex);

    res.json({ message: 'File deleted successfully' });
};

const downloadFile = (req, res) => {
    const username = req.user;
    const { fileName } = req.params;

    if (!fileName) return res.status(400).json({ message: 'fileName is required' });

    const filePath = path.join(filesDir, username, `${fileName}.json`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Set headers to prompt download
    res.download(filePath, `${fileName}.json`, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error downloading file' });
            }
        }
    });
};


const getAllFiles = (req, res) => {
    const username = req.user;
    const files = getFileIndex()
        .filter(f => f.fileName.startsWith(`${username}/`))
        .map(f => f.fileName.replace(`${username}/`, ''));  // strip username prefix
    res.json(files);
};



module.exports = {
    getAllFiles,
    getFile,
    saveOrUpdateFile,
    downloadFile, 
    deleteFile
};
