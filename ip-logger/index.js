const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.static("public"));

// Ruta principal para registrar IPs
app.get("/track", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const fecha = new Date().toISOString();

  let geo = {};
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    geo = response.data;
  } catch {
    geo = { city: "Unknown", country: "Unknown" };
  }

  const log = {
    ip,
    city: geo.city,
    country: geo.country,
    fecha,
    userAgent,
  };

  fs.appendFileSync("logs.txt", JSON.stringify(log) + "\n");
  console.log(`[+] Registrado: ${ip} - ${geo.city}, ${geo.country}`);

  res.redirect("https://www.google.com");
});

// Ruta para visualizar los registros
app.get("/panel", (req, res) => {
  const data = fs.existsSync("logs.txt")
    ? fs.readFileSync("logs.txt", "utf8").trim().split("\n").map(JSON.parse)
    : [];
  res.send(`

  `);
});

app.listen(PORT, () => {
  console.log(`🔍 IP Logger activo en http://localhost:${PORT}/track`);
  console.log(`📊 Panel disponible en http://localhost:${PORT}/panel`);
});
