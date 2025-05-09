const express = require('express');
const router = express.Router();
const path = require('path');


router.get(/^\/$|\/index(.html)?/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// Serve the home page
router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
});

// Serve the home page
router.get('/home2', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home2.html'));
});

// Serve the home page
router.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'changeUser.html'));
});

module.exports = router;