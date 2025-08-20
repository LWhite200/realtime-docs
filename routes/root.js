const express = require('express');
const router = express.Router();
const path = require('path');

// any request that is for the index.html, the requests are not always uniform.
router.get(/^\/$|\/index(.html)?/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// Serve the home page
router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
});

// Serve the home page
router.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'registration.html'));
});

// Serve the home page
router.get('/home2', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home2.html'));
});

// Serve the home page
router.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'changeUser.html'));
});

// Serve the home page
router.get('/textZone', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'textZone.html'));
});

router.get('/BasicText', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'BasicText.html'));
});

router.get('/FlashCardText', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'FlashCardText.html'));
});
router.get('/flashcard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'flashcard.html'));
});

router.get('/MapText', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'MapText.html'));
});

router.get('/customFormats', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'WB.html'));
});





module.exports = router;
