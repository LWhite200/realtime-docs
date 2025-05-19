// BFcontroller.js
const fs = require('fs');
const path = require('path');

const userTextsPath = path.join(__dirname, '../model/userTexts.json');

exports.getAllFiles = (req, res) => {
    fs.readFile(userTextsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading userTexts.json:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        try {
            const files = JSON.parse(data); // array of { username, fileName }
            res.json(files);
        } catch (parseErr) {
            console.error('Error parsing userTexts.json:', parseErr);
            res.status(500).json({ message: 'Invalid data format' });
        }
    });
};

// Add more handlers here like saveFile, deleteFile, etc.
