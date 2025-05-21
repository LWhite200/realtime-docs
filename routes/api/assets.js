/*
    This is f
*/

const express = require('express');
const router = express.Router();
const assetController = require('../../controllers/assetController');

// Define routes for file operations
router.route('/')
    .get(assetController.getAllFiles)       // Get list of files
    .post(assetController.saveOrUpdateFile) // Save or update file
    .delete(assetController.deleteFile);    // Delete a file

router.route('/:fileName')
    .get(assetController.getFile);          // Get file contents by name

module.exports = router;
