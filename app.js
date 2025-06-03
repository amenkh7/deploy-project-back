const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const routerBook = require("./routes/book.route");
const routemybooks = require("./routes/mybooks.route");
const flash = require("connect-flash");
const multer = require("multer"); // Pour gérer les uploads
const { fromPath } = require("pdf2pic"); // Pour convertir le PDF en image
const fs = require("fs"); // Gestion des fichiers
const cors = require("cors");
const path = require("path"); // Ajout du module path
const Store = require("connect-mongo"); // Si tu utilises MongoDB pour stocker la session
const mongoose = require("mongoose");
const Book = require("./models/book.models"); // Assure-toi que ton modèle Book est importé
const audioRoutes = require("./routes/audioRoute"); //audio
const user1Routes = require("./routes/user1Routes"); //image
const feviriseRoute = require("./routes/feviriseRoute");
dotenv.config();
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT;


connectDB();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connexion à MongoDB
mongoose
  .connect(process.env.Mongo_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configuration de la session avec MongoDB comme store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: Store.create({
      mongoUrl: process.env.Mongo_URI, // Passe la chaîne de connexion MongoDB ici
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    }),
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, "assets")));

app.use(flash());

// Routes
app.use("/books", routerBook);
app.use("/mybooks", routemybooks);

// Route pour le tableau de bord
app.get("/images/:filename", async (req, res) => {
  const filePath = path.join(__dirname, "assets/images", req.params.filename);
  console.log("Filename received:", req.params.filename); // Log du nom du fichier reçu

  try {
    // Log avant la recherche dans la base de données
    console.log("Searching for book in database...");
    const book = await Book.findOne({ livre: `images/${req.params.filename}` });
    console.log("Book found:", book); // Log du livre trouvé

    if (!book) {
      console.log("Livre non trouvé dans la base de données.");
      return res.status(404).send("Livre non trouvé");
    }

    // Incrémenter le compteur
    book.downloads += 1;
    const updatedBook = await book.save();
    console.log("Downloads updated:", updatedBook.downloads); // Affiche le nombre de téléchargements après la sauvegarde

    // Envoie le fichier
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error("File not found:", err);
        return res.status(404).send("File not found");
      }

      res.download(filePath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          return res.status(500).send("Could not download file");
        }
      });
    });
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).send("Erreur serveur");
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const router = express.Router();

// Configuration de Multer pour l'upload d'image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dossier de destination pour les fichiers uploadés
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Nom du fichier : on utilise le timestamp et l'extension d'origine
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filtrage des types de fichiers (ici on accepte seulement les images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Type de fichier non valide"), false);
  }
  cb(null, true);
};

// Instantiation de Multer avec les paramètres ci-dessus
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille : 5 MB
  fileFilter,
});

// Route pour uploader l'image de profil
router.post(
  "/uploadImage/:userId",
  upload.single("image"),
  async (req, res) => {
    try {
      // Recherche de l'utilisateur par son ID
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).send({ error: "Utilisateur non trouvé" });
      }

      // Mise à jour du chemin de l'image dans la base de données
      user.profileImage = req.file.path; // On stocke le chemin de l'image dans 'profileImage'
      await user.save(); // Sauvegarder l'utilisateur mis à jour

      // Réponse de succès
      res.status(200).send({ message: "Image téléchargée avec succès", user });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Échec du téléchargement de l'image" });
    }
  }
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));

app.use("/api", userRoutes);

app.use("/api/audio", audioRoutes);
app.use("/uploads", express.static("uploads")); // pour accéder aux fichiers
app.use("/user", user1Routes);
app.use("/user", feviriseRoute);
