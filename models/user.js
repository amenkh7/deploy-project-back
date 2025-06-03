const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      validate: [validator.isEmail, "Invalid Email"],
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "visitor"],
    },
    address: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "/uploads/default-profile.png",
    },
    isVerified: { type: Boolean, default: false },

    // ✅ Ajout ici
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    readed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Set default role and verification status
userSchema.pre("save", function (next) {
  if (this.isNew) {
    this.role = "user";
    this.isVerified = false; // correction : ne pas mettre "false" (string)
  }
  next();
});
// Methods to handle favorites and readed books
userSchema.statics.addToFavorites = function (userId, bookId) {
  return this.findById(userId).then((user) => {
    if (!user) throw new Error("User not found");
    if (!user.favorites.includes(bookId)) {
      user.favorites.push(bookId);
      return user.save();
    }
    return user;
  });
};

userSchema.statics.markAsReaded = function (userId, bookId) {
  return this.findById(userId).then((user) => {
    if (!user) throw new Error("User not found");
    if (!user.readed.includes(bookId)) {
      user.readed.push(bookId);
      return user.save();
    }
    return user;
  });
};

userSchema.statics.getFavorites = function (userId) {
  return this.findById(userId).then((user) => {
    if (!user) throw new Error("User not found");
    return user.favorites;
  });
};

userSchema.statics.getReaded = function (userId) {
  return this.findById(userId).then((user) => {
    if (!user) throw new Error("User not found");
    return user.readed;
  });
};
module.exports = mongoose.model("User", userSchema);
