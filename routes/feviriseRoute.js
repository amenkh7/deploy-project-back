const express = require("express");
const router = express.Router();
const favoriseControler = require("../controllers/favoriseControler");
const { authenticate } = require("../middleware/AuthenticationMiddleware ");

// Route pour ajouter un livre aux favoris
router.post(
  "/favorites/:bookId",
  authenticate,
  favoriseControler.addFavoriteController
);

// Route pour marquer un livre comme lu
router.post(
  "/readed/:bookId",
  authenticate,
  favoriseControler.addReadedController
);

// Route pour récupérer les favoris
router.get(
  "/favorites",
  authenticate,
  favoriseControler.getFavoritesController
);

// Route pour récupérer les livres lus
router.get("/readed", authenticate, favoriseControler.getReadedController);

// Supprimer un livre des favoris
router.delete(
  "/favorites/:bookId",
  authenticate,
  favoriseControler.removeFavoriteController
);

// Supprimer un livre de la liste des livres readed
router.delete(
  "/readed/:bookId",
  authenticate,
  favoriseControler.removeReadedController
);
module.exports = router;
