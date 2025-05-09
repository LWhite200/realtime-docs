// routes/api/viewUserData.js
const express = require('express');
const router = express.Router();

// GET /userData
router.get('/', (req, res) => {
    if (!req.user || !req.roles) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const username = req.user;  // Set by verifyJWT
    const roles = req.roles;    // Set by verifyJWT

    res.json({
        message: `Logged in as ${username} with roles: ${roles.join(', ')}`,
    });
});

module.exports = router;
