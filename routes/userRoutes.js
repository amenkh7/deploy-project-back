const express = require("express");

const {
  userRegister,
  userLogin,
  verifyUser,
  userQRCode,
} = require("../controllers/register&login");
const {
  getAllUsers,
  updateUser,
  addUser,
  searchUser,
  deleteUser,
  updatePassword,
  updateRole,
  uploadMiddleware,
  imageUpload,
  getCurrentUser,
  getbyid,
  getUserById,
} = require("../controllers/user&admin");
const {
  forgetPassword,
  resetPassword,
  genOTP,
  verifyOTP,
} = require("../controllers/resetPassword");
const { authenticate } = require("../middleware/AuthenticationMiddleware ");
const { checkAdminRole } = require("../middleware/roleMiddleware.js");

const router = express.Router();

router.post("/users/register", userRegister, uploadMiddleware, imageUpload);
router.post("/users/login", userLogin);
router.post("/users/verify", verifyUser);
router.get("/users", getAllUsers);
router.get("/users/:id", authenticate, getCurrentUser);
router.get("/users/get/:id", getUserById);
router.put("/users/update_user/:identifier", updateUser);
router.put("/users/update_password", updatePassword);
router.put("/users/update_role", updateRole);
router.post("/users/add_user", addUser);
router.get("/users/search", searchUser);
router.delete("/users/delete/:id", deleteUser);
router.post("/users/forgetPassword", forgetPassword);
router.post("/users/resetpassword/:token", resetPassword);
router.post("/users/OTP", genOTP);
router.post("/users/verify_otp", verifyOTP);
router.post("/users/uploadImage/:id", uploadMiddleware, imageUpload);
router.post("/users/QRCode/:id", userQRCode);
module.exports = router;
