const express = require("express");
const multer = require("multer");
const path = require("path");
const audioController = require("../controllers/audioController");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Destination du fichier
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Génère un nom unique pour le fichier
  },
});

// Filtrage des types de fichiers autorisés (seulement des audios)
const fileFilter = (req, file, cb) => {
  // Accepte uniquement les fichiers audio avec les extensions .mp3 et .wav
  const allowedTypes = ["audio/mpeg", "audio/wav"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Fichier accepté
  } else {
    cb(new Error("Type de fichier non autorisé"), false); // Erreur si fichier non autorisé
  }
};

// Instantiation de multer avec filtrage et limite de taille (10MB max pour l'audio)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite la taille du fichier à 10MB
});

// Route POST pour upload audio
router.post(
  "/upload-audio",
  upload.single("audio"),
  audioController.createAudio
);

// Afficher tous les audios
router.get("/", audioController.getAll);

// Afficher un audio par ID
router.get("/:id", audioController.getById);

// Supprimer un audio par ID
router.delete("/:id", audioController.deleteById);

module.exports = router;
