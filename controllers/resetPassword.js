require('dotenv').config()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer')
const twilio=require('twilio')
const otpGenerator = require('otp-generator')
const accountSid=process.env.ACCOUNT_SID
const authToken=process.env.AUTH_TOKEN
const client = twilio(accountSid, authToken)
const OTPModel = require('../models/OTPModel')

//forget password

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Store email in session for further use
    req.session.resetEmail = email; // Make sure the session middleware is initialized

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.passwordEmail,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      text: `Click here to reset your password: http://localhost:3000/resetpassword/${token}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({ message: "Error sending reset email." });
      }
      res.status(200).json({ message: "Password reset email sent successfully." });
    });
  } catch (err) {
    console.error("Error in forgetPassword:", err);
    res.status(500).json({ message: err.message });
  }
};



//reset password

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const { newPassword } = req.body;

    // Find user by decoded userId from the token
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate new password with regex
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and be at least 8 characters long.",
      });
    }

    // Update the user's password
    user.password = newPassword;
    user.confirmPassword = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ message: err.message });
  }
};



// account recovery otp sms

exports.genOTP = async (req, res) => {
  try {
    const { mobile } = req.body
        if (!mobile) {
      return res.status(400).json({ error: "Mobile Number is required" })
    }
    const checkMobile = await User.findOne({ mobile })
    if (!checkMobile) {
      return res.status(404).json({ error: "Mobile number not found" })
    }
    const generatedOTP = otpGenerator.generate(6, { 
      lowerCaseAlphabets: false, 
      upperCaseAlphabets: false, 
      specialChars: false 
    })
    await OTPModel.create({
      mobile,
      otp: generatedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
    })
    await client.messages.create({
      body: `Your OTP is: ${generatedOTP}`,
      from: process.env.TWILIO_NUMBER,  
      to: mobile
    })
    res.status(200).json({ message: 'OTP sent successfully' })

  } catch (err) {
    res.status(500).json({ message: err.stack })
  }
}

exports.verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body

    if (!mobile || !otp) {
      return res.status(400).json({ error: "Mobile number and OTP are required" })
    }
    const storedOTP = await OTPModel.findOne({ mobile, otp })
    if (!storedOTP) {
      return res.status(400).json({ error: "Invalid OTP" })
    }
    if (storedOTP.expiresAt < new Date()) {
      await OTPModel.deleteOne({ mobile, otp })
      return res.status(400).json({ error: "OTP has expired" })
    }
    await OTPModel.deleteOne({ mobile, otp })
    res.status(200).json({ message: "OTP verified successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message  })
  }
}
