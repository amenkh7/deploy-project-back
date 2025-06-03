const userModel = require("../models/user");
const bcrypt = require("bcrypt");

// Ajouter un livre aux favoris
exports.addFavoriteController = (req, res) => {
  const { bookId } = req.params;
  const { user } = req; // Utilisateur déjà disponible dans la requête grâce au middleware authenticate

  userModel
    .addToFavorites(user._id, bookId)
    .then((user) => res.json({ favorites: user.favorites }))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Marquer un livre comme lu
exports.addReadedController = (req, res) => {
  const { bookId } = req.params;
  const { user } = req;

  userModel
    .markAsReaded(user._id, bookId)
    .then((user) => res.json({ readed: user.readed }))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Récupérer les favoris d'un utilisateur

exports.getFavoritesController = async (req, res) => {
  try {
    const { user } = req;

    const userWithFavorites = await userModel
      .findById(user._id)
      .populate("favorites");

    if (!userWithFavorites) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ favorites: userWithFavorites.favorites }); // Détails complets des livres
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer les livres lus d'un utilisateur

exports.getReadedController = async (req, res) => {
  try {
    const { user } = req;

    const userWithReaded = await userModel
      .findById(user._id)
      .populate("readed");

    if (!userWithReaded) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ readed: userWithReaded.readed }); // Renvoie les infos complètes des livres lus
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un livre des favoris
exports.removeFavoriteController = async (req, res) => {
  const { bookId } = req.params;
  const { user } = req; // Injecté par le middleware `authenticate`

  try {
    const userData = await userModel.findById(user._id);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    userData.favorites = userData.favorites.filter(
      (favId) => favId.toString() !== bookId
    );

    await userData.save();

    res.status(200).json({
      message: "Book removed from favorites",
      favorites: userData.favorites,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un livre de la liste des livres lus
exports.removeReadedController = async (req, res) => {
  const { bookId } = req.params;
  const { user } = req; // Injecté par le middleware `authenticate`

  try {
    const userData = await userModel.findById(user._id);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retirer le bookId de la liste des livres lus
    userData.readed = userData.readed.filter(
      (readId) => readId.toString() !== bookId
    );

    await userData.save();

    res.status(200).json({
      message: "Book removed from readed list",
      readed: userData.readed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
