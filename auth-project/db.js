const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",          
  password: "Cnkry@19971995.",   
  database: "authdb"      
});

db.connect((err) => {
  if (err) {
    console.error("MySQL bağlantı hatası:", err);
    return;
  }
  console.log("MySQL bağlantısı başarılı!");
});

module.exports = db;
