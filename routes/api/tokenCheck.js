const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/verifyJWT');

router.get('/', verifyJWT, (req, res) => {
  // If verifyJWT passes, token is valid
  res.json({ valid: true });
});

module.exports = router;



