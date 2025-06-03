// Middleware to check if the user is an admin
const User = require("../models/user")

const checkAdminRole = (req, res, next) => {
  const user = req.user;  // Assuming the user is attached to the request in a previous middleware (verifyToken)
  console.log('User role:', User.role);  // Debugging log

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  
  next(); // Allow the request to continue to the next middleware or route handler
};

module.exports = { checkAdminRole };
