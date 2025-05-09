const ROLES_LIST = require('../config/roles_list');

const roleNameMap = Object.entries(ROLES_LIST).reduce((acc, [name, id]) => {
  acc[id] = name;
  return acc;
}, {});

const getUserViewData = (req, res) => {
  const user = req.user; // The username decoded from JWT
  const roles = req.roles; // The roles decoded from JWT

  res.json({
    username: user,
    roles: roles // You can return the raw role IDs here for now
  });
};

module.exports = getUserViewData;