
// /**
//  * Authentication Controller
//  *
//  * Handles user registration, login, and invitation acceptance.
//  * Provides API handlers for authentication-related functionality.
//  * Integrates with the User and UserInvite models and JWT utilities.
//  *
//  * Connection to Frontend:
//  * The frontend calls these functions through the auth routes to:
//  * - Register new users
//  * - Authenticate existing users (login)
//  * - Accept user invitations
//  */

// const User = require('../models/User');
// //const UserInvite = require('../models/UserInvite');
// const { generateToken } = require('../utils/jwt');
// const crypto = require('crypto');

// /**
//  * Register new user
//  * Creates a new user account with default test_engineer role
//  */
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if user already exists to prevent duplicates
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create new user with default role
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: 'test_engineer' // Default role for self-registration
//     });

//     // Generate JWT token for automatic authentication
//     const token = generateToken(user);

//     res.status(201).json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       },
//       token
//     });
//   } catch (error) {
//     console.error('Register error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// /**
//  * Login user
//  * Authenticates a user with email and password
//  */
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists in the database
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Verify password using method from User model
//     const isPasswordMatch = await user.comparePassword(password);
//     if (!isPasswordMatch) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Generate JWT token for authentication
//     const token = generateToken(user);

//     res.status(200).json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       },
//       token
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// exports.getMe = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });
//   } catch (error) {
//     console.error('Get Me error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const cookieOptions = require('../utils/cookieOptions');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: 'test_engineer' });

    const token = generateToken(user);

    // Set HttpOnly cookie
    res.cookie('auth_token', token, cookieOptions);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    // Set HttpOnly cookie
    res.cookie('auth_token', token, cookieOptions);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });

  } catch (error) {
    console.error("Get Me error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
