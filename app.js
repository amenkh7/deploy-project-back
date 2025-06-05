const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const routerBook = require("./routes/book.route");
const routemybooks = require("./routes/mybooks.route");
const flash = require("connect-flash");
const multer = require("multer");
const { fromPath } = require("pdf2pic");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const Store = require("connect-mongo");
const mongoose = require("mongoose");
const Book = require("./models/book.models");
const audioRoutes = require("./routes/audioRoute");
const user1Routes = require("./routes/user1Routes");
const feviriseRoute = require("./routes/feviriseRoute");
dotenv.config();

const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT;

connectDB();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ✅ Corrected MONGO_URI usage
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: Store.create({
      mongoUrl: process.env.MONGO_URI, // ✅ Corrected here too
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
  console.log("Filename received:", req.params.filename);

  try {
    console.log("Searching for book in database...");
    const book = await Book.findOne({ livre: `images/${req.params.filename}` });
    console.log("Book found:", book);

    if (!book) {
      console.log("Livre non trouvé dans la base de données.");
      return res.status(404).send("Livre non trouvé");
    }

    book.downloads += 1;
    const updatedBook = await book.save();
    console.log("Downloads updated:", updatedBook.downloads);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Type de fichier non valide"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

router.post("/uploadImage/:userId", upload.single("image"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send({ error: "Utilisateur non trouvé" });
    }

    user.profileImage = req.file.path;
    await user.save();

    res.status(200).send({ message: "Image téléchargée avec succès", user });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Échec du téléchargement de l'image" });
  }
});
app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "Backend is alive" });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));

app.use("/api", userRoutes);
app.use("/api/audio", audioRoutes);
app.use("/user", user1Routes);
app.use("/user", feviriseRoute);
