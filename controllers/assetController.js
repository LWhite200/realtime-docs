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

const getAllFiles = (req, res) => {
    const files = getFileIndex();
    res.json(files);
};

const getFile = (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(filesDir, `${fileName}.json`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ fileName, content: JSON.parse(content) });
};

const saveOrUpdateFile = (req, res) => {
    console.log('Incoming request to save file');
    console.log('Request body:', req.body);
    
    try {
        const { fileName, fileData } = req.body;

        if (!fileName || !fileData) {
            console.log('Validation failed - missing fileName or fileData');
            return res.status(400).json({ 
                error: 'fileName and fileData are required',
                received: req.body
            });
        }

        const filePath = path.join(filesDir, `${fileName}.json`);
        console.log('Saving to:', filePath);

        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
        console.log('File saved successfully');

        // Update index
        const fileIndex = getFileIndex();
        const existingIndex = fileIndex.findIndex(f => f.fileName === fileName);
        
        if (existingIndex === -1) {
            fileIndex.push({
                fileName,
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

const deleteFile = (req, res) => {
    const { fileName } = req.body;

    if (!fileName) return res.status(400).json({ message: 'fileName is required' });

    const filePath = path.join(filesDir, `${fileName}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    fs.unlinkSync(filePath);

    const fileIndex = getFileIndex().filter(f => f.fileName !== fileName);
    setFileIndex(fileIndex);

    res.json({ message: 'File deleted successfully' });
};

module.exports = {
    getAllFiles,
    getFile,
    saveOrUpdateFile,
    deleteFile
};
