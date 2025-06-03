const express = require("express");
const User = require("../models/User"); // Ton modèle utilisateur
const upload = require("../middlewares/upload"); // Ton middleware d'upload
const path = require("path");
const fs = require("fs"); // Pour supprimer les anciennes images

const router = express.Router();

// Mettre à jour un utilisateur + image
router.put("/:id", upload.single("profileImage"), async (req, res) => {
  const { fullName, email, mobile, address } = req.body;
  const userId = req.params.id;

  // Vérifier si une nouvelle image a été téléchargée
  const profileImage = req.file ? req.file.filename : undefined;

  // Préparer les champs à mettre à jour
  const updatedFields = { fullName, email, mobile, address };

  if (profileImage) {
    updatedFields.profileImage = profileImage;

    // Supprimer l'ancienne image si elle existe
    try {
      const user = await User.findById(userId);
      if (user && user.profileImage) {
        const oldImagePath = path.join(
          __dirname,
          "../uploads",
          user.profileImage
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Supprimer l'ancienne image
        }
      }
    } catch (err) {
      console.error("Error deleting old profile image:", err);
    }
  }

  try {
    // Mettre à jour l'utilisateur dans la base de données
    const user = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user); // Retourner l'utilisateur mis à jour
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
