const Audio = require("../models/audio");
const fs = require("fs");
const path = require("path");
// Créer un nouvel audio
const createAudio = async (req, res) => {
  try {
    const newAudio = new Audio({
      audio: req.file.path,
      userId: req.body.userId,
    });

    await newAudio.save();
    res.status(201).json({ message: "Audio enregistré", audio: newAudio });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'enregistrement", error });
  }
};

// Afficher tous les audios
const getAll = async (req, res) => {
  try {
    const audios = await Audio.find();
    res.status(200).json(audios);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
// Obtenir un audio par ID
const getById = async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) {
      return res.status(404).json({ message: "Audio non trouvé" });
    }
    res.status(200).json(audio);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
// Supprimer un audio par ID
const deleteById = async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) {
      return res.status(404).json({ message: "Audio non trouvé" });
    }

    // Supprimer le fichier du disque
    fs.unlink(path.join(__dirname, "..", audio.audio), (err) => {
      if (err) {
        console.error("Erreur lors de la suppression du fichier:", err);
      }
    });

    // Supprimer de la base de données
    await Audio.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Audio supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
module.exports = {
  createAudio,
  getAll,
  getById,
  deleteById,
};
