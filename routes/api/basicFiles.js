// basicFiles.js
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/bfController');

router.get('/', controller.getAllFiles);

// You can add more routes like:
// router.post('/save', controller.saveFile);
// router.delete('/:fileId', controller.deleteFile);

module.exports = router;
