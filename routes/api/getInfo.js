const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list');

// JSON reverse lookup
const roleNamesById = Object.fromEntries(
  Object.entries(ROLES_LIST).map(([key, value]) => [value, key])
);

router.get('/', (req, res) => {
    const username = req.user; 
    const roles = req.roles;

    // Decodes the verified json from user
    // Return their names and their roles
    

    // maps the number for the role (in jwt) is turned into the word
    const roleNames = (Array.isArray(roles) ? roles : [roles])
        .map(roleId => roleNamesById[roleId] || `Unknown(${roleId})`);

    const roleString = roleNames.join(', ');
    res.send(`${username}: ${roleString}`);
});

module.exports = router;
