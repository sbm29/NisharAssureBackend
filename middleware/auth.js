
// const { verifyToken } = require('../utils/jwt');

// // Authentication middleware
// const protect = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Unauthorized: No token provided' });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = verifyToken(token);

//     if (!decoded) {
//       return res.status(401).json({ message: 'Unauthorized: Invalid token' });
//     }

//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Unauthorized: Token error' });
//   }
// };

// // Role-based authorization middleware
// const authorize = (roles = []) => {
//   if (typeof roles === 'string') {
//     roles = [roles];
//   }

//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized: No user found' });
//     }

//     if (roles.length > 0 && !roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
//     }

//     next();
//   };
// };

// module.exports = {
//   protect,
//   authorize
// };


const { verifyToken } = require("../utils/jwt");

// Authentication middleware
const protect = (req, res, next) => {
  try {
    // ✅ Get token from HttpOnly cookie instead of Authorization header
    const token = req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    req.user = decoded; // attach decoded payload (e.g. { id, role }) to request
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Unauthorized: Token error" });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
