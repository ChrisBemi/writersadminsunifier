const User = require("../models/Users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const BlacklistedToken = require("../models/BlacklistedToken");

const nodemailer = require("nodemailer");

const { serialize } = require('cookie');

const signup = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    password,
    educationLevel,
    qualifications,
  } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(200).json({
        success: false,
        email: "The email already exists",
      });
    }

    const existingPhone = await User.findOne({ phoneNo });
    if (existingPhone) {
      return res.status(200).json({
        success: false,
        phone: "The phone no already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminEmails = [
      "ritahchanger@gmail.com",
      "bedanc.chege@gmail.com",
      "peterdennis573@gmail.com",
      "bemieditors@gmail.com"
    ]

    const role = adminEmails.includes(email) ? "admin" : "writer"

    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNo,
      educationLevel,
      qualifications,
      role,
      password: hashedPassword,
    });

    await newUser.save();

    res
      .status(200)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  const { password, email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect password" });
    }

    const payload = {
      id: user._id, // Assuming MongoDB ObjectId
      email: user.email,
      // Include any other necessary user information
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Serialize token into a string for the cookie header
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, 
      path: "/"
    };
    res.cookie("token", token, cookieOptions);


    res.status(200).json({ success: true, user: payload,token:token  });

  } catch (error) {
    console.error("Login error:", error);
    res.status(200).json({ success: false, error: "Server error" });
  }
};



const logout = (req, res) => {
  const { cookies } = req;
  const jwtToken = cookies.token;

  if (!jwtToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Expires the cookie immediately
      path: '/',
    };

    const serialized = serialize('token', null, cookieOptions);
    res.setHeader('Set-Cookie', serialized);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

const checkAuthStatus = async (req, res) => {
  const { cookies } = req;
  const token = cookies.token;

  if (!token) {
    return res.status(200).json({ status:401, isLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ isLoggedIn: false });
    }

    res.status(200).json({ isLoggedIn: true, user_id: user._id });

  } catch (error) {
    console.error('Error checking authentication status:', error);
    res.status(500).json({ isLoggedIn: false });
  }
};



const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .send({ status: 404, success: false, email: "User not found" });
    }

    // Encode the email address for URL
    const encodedEmail = encodeURIComponent(email);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3m",
    });

    // If user exists, proceed with sending the password reset email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: '"BEMI EDITORS LIMITED" <peterdennis573@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      text: "Request to change my password from the bookstore application",
      html: `
        <html>
          <head>
            <style>
              /* CSS styles */
              body {
                font-family: Arial, sans-serif;
                font-size: 16px;
              }
              .container {
                margin: 20px;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #333;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 10px;
              }
              a {
                display: inline-block;
                background-color: #4CAF50;
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
              }
              a:hover {
                background-color: #45a049;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Password Reset Request</h1>
              <p>Please follow the link to reset your password.</p>
              <p>And you have 5 minutes to reset it</p>
              <p><a href='${process.env.FRONTED_URL}/change-password/${token}'>Reset Password</a></p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Password reset email sent:", info.response);
    res.status(200).send({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(200).json({
      success: false,
      status: 400,
      message: "Token and new password are required",
    });
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Extract user ID from the token
    const userId = decoded.id;

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Respond with success message
    return res.status(200).json({
      success: true,
      status: 200,
      message: "User password updated",
      userId: userId,
    });
  } catch (error) {
    console.error("Error updating password:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(200).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(200).json({
        success: false,
        message: "Change password time expired!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  changePassword,
  checkAuthStatus,
};
