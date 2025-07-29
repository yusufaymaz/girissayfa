const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authenticateToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "gizli_anahtar";


router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;


  if (!role) {
    return res.status(400).json({ message: "Role alanı zorunludur" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Kullanıcı zaten var" });
          }
          return res.status(500).json({ message: "Sunucu hatası" });
        }
        res.json({ message: "Kayıt başarılı" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Şifre hashlenirken hata oluştu" });
  }
});


router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
    if (err) return res.status(500).json({ message: "Sunucu hatası" });
    if (result.length === 0) return res.status(400).json({ message: "Kullanıcı bulunamadı" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Yanlış şifre" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Giriş başarılı", token, role: user.role });
  });
});


router.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query("SELECT id, username, role FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Veritabanı hatası" });
    if (result.length === 0) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    const user = result[0];
    res.json({
      message: `Hoşgeldin ${user.username}`,
      user: user
    });
  });
});


router.get("/admin", authenticateToken, roleMiddleware("admin"), (req, res) => {
  res.json({ message: `Merhaba admin ${req.user.id}, özel alana hoşgeldin.` });
});

module.exports = router;
