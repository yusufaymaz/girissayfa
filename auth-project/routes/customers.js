const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


router.get("/", authenticateToken, (req, res) => {
  db.query("SELECT * FROM customers", (err, result) => {
    if (err) {
      console.error("DB Hatası (Listeleme):", err);
      return res.status(500).json({ message: "Veritabanı hatası" });
    }
    res.json(result);
  });
});


router.post("/", authenticateToken, roleMiddleware("admin"), (req, res) => {
  const { name, email, phone } = req.body;

  console.log("Yeni müşteri ekleme isteği geldi:", { name, email, phone });
  console.log("İstek yapan kullanıcı:", req.user);

  if (!name || !email) {
    console.warn("Eksik bilgi:", req.body);
    return res.status(400).json({ message: "Name ve email zorunlu" });
  }

  db.query(
    "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)",
    [name, email, phone],
    (err, result) => {
      if (err) {
        console.error("DB Hatası (Ekleme):", err);
        return res.status(500).json({ message: "Veritabanı hatası" });
      }
      console.log("Müşteri eklendi ID:", result.insertId);
      res.json({ message: "Müşteri eklendi", id: result.insertId });
    }
  );
});


router.delete("/:id", authenticateToken, roleMiddleware("admin"), (req, res) => {
  const customerId = req.params.id;

 
  console.log("Silme isteyen kullanıcı:", req.user, "Silinecek ID:", customerId);

  db.query("DELETE FROM customers WHERE id = ?", [customerId], (err, result) => {
    if (err) {
      console.error("DB Hatası (Silme):", err);
      return res.status(500).json({ message: "Veritabanı hatası" });
    }
    if (result.affectedRows === 0) {
      console.warn("Silinmek istenen müşteri bulunamadı:", customerId);
      return res.status(404).json({ message: "Müşteri bulunamadı" });
    }
    console.log("Silme sonucu:", result);
    res.json({ message: "Müşteri silindi" });
  });
});

module.exports = router;
