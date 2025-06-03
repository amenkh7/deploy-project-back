const bookController = require("../controllers/book.controler");
const router = require("express").Router();;
const multer = require("multer");
const {
  filterByYear,
  filterByCategory,
  filterByGeneration,
} = require("../models/book.models");
// Route pour la recherche de livres par titre
router.get("/", bookController.getAllBooksController);
router.get("/addbook", bookController.getAddBooksController);
router.post(
  "/addbook",
  multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "assets/images");
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
      },
    }),
  }).fields([{ name: "livre" }, { name: "cover" }]),
  bookController.PostAddBooksController
);

router.get("/filter/year/:year", async (req, res) => {
  try {
    const year = req.params.year;
    const books = await filterByYear(year);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/filter/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const books = await filterByCategory(category);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/filter/generation/:generation", async (req, res) => {
  try {
    const generation = req.params.generation;
    const books = await filterByGeneration(generation);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
