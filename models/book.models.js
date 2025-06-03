const mongoose = require("mongoose");

// Connexion à la base de données MongoDB
let url = process.env.Mongo_URI;

const bookSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  livre: String, // fichier PDF
  cover: String, // image de couverture
  category: String, // ex: 'Fiction', 'Science', 'Biographie', etc.
  generation: String, // ex: 'Enfant', 'Adolescent', 'Adulte'
  year: String, // ex: '2023', '2024', etc.
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Vérifier si le modèle existe déjà avant de le définir
const Book = mongoose.model("Book", bookSchema);

bookSchema.statics.searchByTitle = (title) => {
  return new Promise((resolve, reject) => {
    Book.find({ title: { $regex: title, $options: "i" } }) // Recherche insensible à la casse
      .then((books) => resolve(books))
      .catch((err) => reject(err));
  });
};

// Connexion à MongoDB
mongoose
  .connect(url)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) =>
    console.error("Erreur de connexion à MongoDB :", err.message)
  );

// Exporter le modèle et les fonctions
module.exports = {
  Book,

  getThreeBooks: () => {
    return new Promise((resolve, reject) => {
      Book.find({})
        .limit(3)
        .then((books) => resolve(books))
        .catch((err) => reject(err));
    });
  },

  getOneBookDetails: (id) => {
    return new Promise((resolve, reject) => {
      Book.findById(id)
        .then((book) => resolve(book))
        .catch((err) => reject(err));
    });
  },

  getAllBooks: () => {
    return new Promise((resolve, reject) => {
      Book.find({})
        .then((books) => resolve(books))
        .catch((err) => reject(err));
    });
  },

  postDataBookModel: (
    title,
    description,
    author,
    livre,
    cover,
    category,
    generation,
    year
  ) => {
    return new Promise((resolve, reject) => {
      let book = new Book({
        title,
        description,
        author,
        livre, // fichier PDF
        cover, // image de couverture
        category,
        generation,
        year,

        createdAt: Date.now(),
      });
      book
        .save()
        .then(() => resolve("Livre ajouté avec succès !"))
        .catch((err) => reject(err));
    });
  },

  getMyBooks: (userId) => {
    return new Promise((resolve, reject) => {
      Book.find({ userId })
        .then((books) => resolve(books))
        .catch((err) => reject(err));
    });
  },

  deleteBook: (id) => {
    return new Promise((resolve, reject) => {
      Book.deleteOne({ _id: id })
        .then(() => resolve("Livre supprimé avec succès !"))
        .catch((err) => reject(err));
    });
  },

  getPageUpdateBookModel: (id) => {
    return new Promise((resolve, reject) => {
      Book.findById(id)
        .then((book) => resolve(book))
        .catch((err) => reject(err));
    });
  },

  postUpdateBookModel: (
    bookId,
    title,
    description,
    author,
    livre,
    cover,
    category,
    generation,
    year
  ) => {
    return new Promise((resolve, reject) => {
      Book.updateOne(
        { _id: bookId },
        { title, description, author, livre, cover, category, generation, year }
      )
        .then(() => resolve("Updated!"))
        .catch((err) => reject(err));
    });
  },

  searchByTitle: (title) => {
    return new Promise((resolve, reject) => {
      Book.find({ title: { $regex: title, $options: "i" } }) // Recherche insensible à la casse
        .then((books) => resolve(books))
        .catch((err) => reject(err));
    });
  },

  filterByCategory: (category) => {
    return new Promise((resolve, reject) => {
      Book.find({ category: { $regex: category, $options: "i" } })
        .then((books) => resolve(books))
        .catch((err) => reject(err));
    });
  },

  filterByGeneration: (generation) => {
    return new Promise((resolve, reject) => {
      Book.find({ generation: { $regex: generation, $options: "i" } })
        .then((books) => resolve(books))
        .catch((err) => reject(err));
    });
  },

  filterByYear: (year) => {
    return new Promise((resolve, reject) => {
      Book.find({ year: parseInt(year) })
        .then((books) => resolve(books))
        .catch((err) => reject(err));
    });
  },
};
