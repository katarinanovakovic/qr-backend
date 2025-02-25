const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require ("cors");
const Subject = require('./models/Subject');



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
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["student", "professor", "referada"] },
  subjects: [{ type: String }], // Niz običnih stringova
  qrCode: { type: String, default: "" } // Osiguraj da qrCode postoji
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

// API za dohvat profesora
app.get("/professors", async (req, res) => {
  try {
    // Dohvati sve korisnike koji imaju rolu 'professor'
    const professors = await User.find({ role: "professor" });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching professors", error });
  }
});
console.log("")

// API za dohvat studenata
app.get("/students", async (req, res) => {
  try {
    // Dohvati sve korisnike koji imaju rolu 'student'
    const students = await User.find({ role: "student" });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
});

// API za dohvat predmeta
app.get("/subjects", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

// API za dodavanje profesora
app.post("/professors", async (req, res) => {
  try {
    const { name, email, password, subjects } = req.body;

    // Provjeri postoji li korisnik s tim emailom
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hashiraj lozinku
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Kreiraj novog profesora
    const newProfessor = new User({
      name,
      email,
      password,
      role: "professor",
      subjects: subjects || [],
      qrCode: ""
    });

    await newProfessor.save();
    res.status(201).json({ message: "Professor added successfully", professor: newProfessor });

  } catch (error) {
    res.status(500).json({ message: "Error adding professor", error });
  }
});

// API za dodavanje studenta
app.post("/students", async (req, res) => {
  try {
    const { name, email, password, subjects } = req.body;

    // Provjeri postoji li korisnik s tim emailom
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hashiraj lozinku
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Kreiraj novog studenta
    const newStudent = new User({
      name,
      email,
      password,
      role: "student",
      subjects: subjects || [],
      qrCode: ""
    });

    await newStudent.save();
    res.status(201).json({ message: "Student added successfully", student: newStudent });

  } catch (error) {
    res.status(500).json({ message: "Error adding student", error });
  }
});

// API za dodavanje predmeta
// API za dodavanje predmeta
app.post("/subjects", async (req, res) => {
  try {
    const { name, professor, students } = req.body;

    if (!name || !professor) {
      return res.status(400).json({ message: "Name and professor are required" });
    }

    // Provjeri postoji li već predmet s istim imenom
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({ message: "Subject with this name already exists" });
    }

    // Kreiraj novi predmet
    const newSubject = new Subject({
      name,
      professor,
      students: Array.isArray(students) ? students : [], // Osiguraj da je niz
    });

    await newSubject.save();
    res.status(201).json({ message: "Subject added successfully", subject: newSubject });

  } catch (error) {
    console.error("Error adding subject:", error);
    res.status(500).json({ message: "Error adding subject" });
  }
});


// Pokreni server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
