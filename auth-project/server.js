const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const customersRoutes = require("./routes/customers"); 

const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/customers", customersRoutes); 
app.listen(3001, () => {
  console.log("Server 3001 portunda çalışıyor");
});
