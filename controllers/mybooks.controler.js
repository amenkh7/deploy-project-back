const mongoose = require("mongoose"); // Importation de mongoose
const bookModel = require("../models/book.models");

exports.getmybooksPage = (req, res, next) => {
  bookModel.getMyBooks(req.session.userId).then((books) => {
    console.log(books);
    console.log(req.session.userId);
    res.render("mybooks", { books: books, verifuser: req.session.userId });
  });
};

exports.deletebookcontroler = (req, res, next) => {
  id = req.params.id;
  bookModel
    .deleteBook(id)
    .then((result) => {
      res.json({ message: "supprime avec succès!!" });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getmybooksUpdate = (req, res, next) => {
  let id = req.params.id;
  bookModel.getPageUpdateBookModel(id).then((book) => {
    console.log(book);
    res.render("updateBook", {
      book: book,
      verifuser: req.session.userId,
      Smessage: req.flash("Successmessage")[0],
      Emessage: req.flash("Errormessage")[0],
    });
  });
};

exports.PostgetmybooksUpdate = (req, res, next) => {
  const bookId = req.params.bookId; // <-- bookId depuis les paramètres URL

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ error: "ID de livre invalide." });
  }

  // Construction des chemins avec le préfixe "images/"
  const coverPath =
    req.files && req.files.cover && req.files.cover.length > 0
      ? `images/${req.files.cover[0].filename}`
      : req.body.oldCover;

  const livrePath =
    req.files && req.files.livre && req.files.livre.length > 0
      ? `images/${req.files.livre[0].filename}`
      : req.body.oldLivre;

  const category = req.body.category;
  const generation = req.body.generation;
  const year = req.body.year;

  bookModel
    .postUpdateBookModel(
      bookId,
      req.body.title,
      req.body.description,
      req.body.author,
      livrePath,
      coverPath,
      category,
      generation,
      year
    )
    .then((msg) => {
      res.json({ message: msg, updated: true });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

const convertFirstPageToImage = async (pdfFilePath, outputImagePath) => {
  const options = {
    density: 100,
    saveFilename: "cover",
    savePath: outputImagePath,
    format: "png",
    width: 600,
    height: 800,
  };

  const storeAsImage = fromPath(pdfFilePath, options);
  return storeAsImage(1)
    .then((response) => {
      return response.path; // Retourne le chemin de l'image
    })
    .catch((error) => {
      console.error("Erreur lors de la conversion du PDF:", error);
    });
};
