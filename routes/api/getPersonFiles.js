const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const userTextsPath = path.join(__dirname, '../../model/userTexts.json');

router.get('/', (req, res) => {
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
});

module.exports = router;
