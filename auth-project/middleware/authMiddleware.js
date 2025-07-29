const jwt = require("jsonwebtoken");

const JWT_SECRET = "gizli_anahtar"; 

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ message: "Token bulunamadı, yetkisiz erişim!" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Geçersiz token!" });

    req.user = user; 
    next();
  });
}

module.exports = authenticateToken;
