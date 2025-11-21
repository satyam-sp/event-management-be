const db = require('../models');
const User = db.User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- 1. User Registration ---
exports.register = async (req, res) => {
  try {
    // 1. Check if user already exists (by email or username)
    const existingUser = await User.findOne({ 
      where: { [db.Sequelize.Op.or]: [{ email: req.body.email }, { username: req.body.username }] }
    });

    if (existingUser) {
      return res.status(409).send({ message: 'Username or Email already in use.' });
    }

    // 2. Create User (password hashing is handled automatically by the hook in models/user.js)
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      // Default role is 'user' unless explicitly set to 'admin' (for seeding/admin registration)
      role: req.body.role || 'user' ,
      isAdmin: false
    });

    // Remove password from response
    res.status(201).send({ 
        message: 'User registered successfully!', 
        user: { id: user.id, email: user.email, username: user.username, role: user.role, isAdmin: user.isAdmin }
    });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: error.message });
  }
};

// --- 2. User Login ---
exports.login = async (req, res) => {
  console.log(req.body)
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Compare the provided password with the stored hash
    const passwordIsValid = await  user.comparePassword(req.body.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid Password!' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      accessToken: token
    });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: error.message });
  }
};