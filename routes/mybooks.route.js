const express = require("express");
const mybookscontroler = require("../controllers/mybooks.controler");
const router = express.Router();
const multer = require("multer");

router.get("/", mybookscontroler.getmybooksPage);
router.get("/delete/:id", mybookscontroler.deletebookcontroler);
router.get("/update/:id", mybookscontroler.getmybooksUpdate);
router.post(
  "/update/:bookId", // <-- bookId en paramÃ¨tre d'URL
  multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "assets/images"); // emplacement physique des fichiers
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
      },
    }),
  }).fields([
    { name: "cover", maxCount: 1 },
    { name: "livre", maxCount: 1 },
  ]),
  mybookscontroler.PostgetmybooksUpdate
);

module.exports = router;