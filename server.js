const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Sirve crud.html automáticamente

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error BD:', err.message);
        return;
    }
    console.log('✅ Conectado a Clever Cloud');
});

// REGISTRO
app.post('/api/registrar', (req, res) => {
    const { usuario, password } = req.body;
    const query = 'INSERT INTO usuarios (usuario, password) VALUES (?, ?)';
    db.query(query, [usuario, password], (err) => {
        if (err) return res.status(500).json({ message: "Error al guardar" });
        res.json({ message: "¡Usuario registrado!" });
    });
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';
    db.query(query, [usuario, password], (err, results) => {
        if (err) return res.status(500).json({ message: "Error" });
        if (results.length > 0) {
            res.json({ success: true, message: "Bienvenido" });
        } else {
            res.status(401).json({ success: false, message: "Datos incorrectos" });
        }
    });
});

// LISTA DE USUARIOS
app.get('/api/usuarios', (req, res) => {
    db.query('SELECT id, usuario FROM usuarios', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
