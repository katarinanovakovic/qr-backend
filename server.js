const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require ("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Povezivanje s MongoDB
const mongoURI = "mongodb+srv://katarinanovakovic:12052001kn@cluster0.hzso3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; //  Connection String iz Mongo Atlasa
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Definiraj korisnički model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["student", "professor"] },
});

const User = mongoose.model("User", userSchema);

// API za login
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body; // Preuzimanje role iz requesta

  // Ispisivanje svih korisnika u bazi
  const allUsers = await User.find();
  console.log("Svi korisnici u bazi:", allUsers); // Ovdje ispisujemo sve korisnike

  // Provjera postoji li korisnik s tim emailom i rolom
  const user = await User.findOne({ email, role }); // Dodali smo i provjeru role

  if (!user) {
    return res.status(400).json({ message: 'User not found or role mismatch' }); // Poruka ako korisnik nije pronađen ili je rola pogrešna
  }

  // Uspoređivanje lozinki
  if (user.password !== password) {
    return res.status(400).json({ message: "Invalid password" });
  }

  // Generiranje tokena
  const token = jwt.sign({ userId: user._id, role: user.role }, "your_jwt_secret", { expiresIn: "1h" });

  // Vraćanje odgovora sa tokenom i rolom
  res.json({ token, role: user.role });
});

// Pokreni server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
