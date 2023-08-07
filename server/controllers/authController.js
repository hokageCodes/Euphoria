const User = require('../models/User.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Helper function to generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Controller for user signup
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Check if the email is already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create the user in the database
      const user = new User({
        name,
        email,
        password: hashedPassword,
      });
  
      await user.save();
  
      // Generate and return the JWT token
      const token = generateToken({ userId: user._id });
      res.json({ token });
    } catch (error) {
      console.error('Error in signup:', error);
      res.status(500).json({ error: 'Server error' });
    }
};
  

// Controller for user login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate and return the JWT token
    const token = generateToken({ userId: user._id });
    res.json({ token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Controller for forgot password
// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const token = crypto.randomBytes(20).toString('hex');
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//     await user.save();

//     const transporter = nodemailer.createTransport({
//       service: 'Gmail', // or any other email service you use
//       auth: {
//         user: 'ogundebusayo16@gmail.com', // Your email address
//         pass: "busayo'sgmail2023"
//       },
//     });

//     const mailOptions = {
//       from: user,
//       to: user.email,
//       subject: 'Password Reset Link',
//       html: `<p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
//         <p>Please click on the following link, or paste this into your browser to complete the process:</p>
//         <p>${process.env.FRONTEND_URL}/reset-password/${token}</p>
//         <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending reset password email:', error);
//         return res.status(500).json({ error: 'Error sending reset password email' });
//       }
//       console.log('Reset password email sent:', info.response);
//       res.json({ message: 'Reset password email sent successfully' });
//     });
//   } catch (error) {
//     console.error('Error in forgotPassword:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// Controller for reset password
// exports.resetPassword = async (req, res) => {
//   // Your reset password implementation here
// };
