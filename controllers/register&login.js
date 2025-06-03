const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

let otpStorage = {};
//user register
exports.userRegister = async (req, res) => {
  try {
    const { email, password, fullName, mobile, confirmPassword, address } =
      req.body;

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !fullName ||
      !mobile ||
      !address
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, and be at least 8 characters long.",
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).json({ error: "Mobile number already exists." });
    }

    const newUser = new User({
      email,
      password,
      fullName,
      mobile,
      address,
    });

    const savedUser = await newUser.save();
    const normalizedEmail = email.toLowerCase();
    const generatedOTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    otpStorage[normalizedEmail] = { otp: generatedOTP, timestamp: Date.now() };
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
      subject: "Account verification",
      text: `Your verification code is: ${generatedOTP}`,
    };

    transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "Email with verification code sent", user: savedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//user login
exports.userLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email/mobile and password" });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^(\+216)?[0-9]{8}$/;

    let query = {};
    if (emailPattern.test(identifier)) {
      query.email = identifier;
    } else if (mobilePattern.test(identifier)) {
      query.mobile = identifier;
    } else {
      return res
        .status(400)
        .json({ error: "Invalid email or mobile number format." });
    }
    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (user.isVerified !== true) {
      return res
        .status(400)
        .json({ error: "Please verify your account before logging in." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { verifyCode, email } = req.body;
    const normalizedEmail = email.toLowerCase();

    const storedOTPData = otpStorage[normalizedEmail];
    if (!storedOTPData || storedOTPData.otp !== verifyCode) {
      return res.status(400).json({ message: "Wrong verification code." });
    }

    await User.findOneAndUpdate(
      { email: normalizedEmail },
      { isVerified: true }
    );
    delete otpStorage[normalizedEmail];
    return res.status(200).json({ message: "Account verified" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
//QR code with user info

exports.userQRCode = async (req, res) => {
  try {
    const ID = req.params.id;
    const user = await User.findById(ID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userInfo = {
      id: user._id,
      name: user.fullName,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
    };
    res.setHeader("Content-Type", "image/png");
    QRCode.toFileStream(res, JSON.stringify(userInfo));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
