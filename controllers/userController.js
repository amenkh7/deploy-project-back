// controllers/userController.js
const mongoose = require("mongoose");
const User = require("../models/user");
const path = require("path");

// Met à jour l'image de profil d'un utilisateur
exports.updateProfileImage = (req, res, next) => {
  const userId = req.params.id;

  // Vérifier si l'utilisateur existe
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "ID utilisateur invalide." });
  }

  // Vérifier si le fichier est bien uploadé
  if (!req.file) {
    return res.status(400).json({ error: "Aucune image envoyée." });
  }

  const profileImagePath = `/uploads/${req.file.filename}`;

  // Mise à jour de l'image de profil dans la base de données
  User.findByIdAndUpdate(
    userId,
    { profileImage: profileImagePath },
    { new: true }
  )
    .then((user) => {
      res.json({
        message: "Image de profil mise à jour avec succès.",
        user: user,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
