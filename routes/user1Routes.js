// routes/user1Routes.js
const express = require("express");
const multer = require("multer");
const path = require("path"); // Importation du module path
const router = express.Router();
const userController = require("../controllers/userController");

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où les fichiers sont stockés
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom de fichier unique avec extension
  },
});
const upload = multer({ storage: storage });

// Route pour mettre à jour l'image de profil
router.post(
  "/update-profile-image/:id",
  upload.single("profileImage"),
  userController.updateProfileImage
);

module.exports = router;
