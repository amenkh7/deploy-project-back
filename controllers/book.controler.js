const BookModel = require("../models/book.models");
const mongoose = require("mongoose");
const path = require("path");
const { fromPath } = require("pdf2pic"); // Pour convertir le PDF en image

// Contrôleur pour obtenir tous les livres
exports.getAllBooksController = (req, res, next) => {
  BookModel.getAllBooks()
    .then((books) => {
      res.json({ books: books });
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération des livres:", err);
      res
        .status(500)
        .json({ error: "Erreur serveur lors de la récupération des livres" });
    });
};

// Contrôleur pour obtenir les détails d'un livre
exports.getOneBookDetailsController = (req, res, next) => {
  let id = req.params.id;
  BookModel.getOneBookDetails(id)
    .then((book) => {
      res.json({ book: book });
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération du livre:", err);
      res
        .status(500)
        .json({ error: "Erreur serveur lors de la récupération du livre" });
    });
};

// Contrôleur pour afficher les informations d'ajout de livre (anciennement le formulaire)
exports.getAddBooksController = (req, res, next) => {
  res.json({
    Smessage: req.flash("sucseccMessage")[0],
    Emessage: req.flash("ErrosMessage")[0],
  });
};

// Contrôleur pour ajouter un livre
exports.PostAddBooksController = (req, res) => {
  const coverPath = `images/${req.files["cover"][0].filename}`; // Chemin de la couverture
  const livrePath = `images/${req.files["livre"][0].filename}`; // Chemin du livre

  const { category, generation } = req.body;
  const yearInput = req.body.year;
  const year = parseInt(yearInput);

  if (isNaN(year)) {
    return res.status(400).json({ error: "Invalid or missing year" });
  }

  BookModel.postDataBookModel(
    req.body.title,
    req.body.description,
    req.body.author,

    livrePath, // Chemin du livre
    coverPath, // Chemin de la couverture
    category,
    generation,
    year
  )
    .then((msg) => {
      res.json({ message: msg });
    })
    .catch((err) => {
      console.error("Erreur lors de l'ajout du livre :", err);
      res.status(500).json({ error: err.message });
    });
};
