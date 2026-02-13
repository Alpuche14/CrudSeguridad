const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- CONFIGURACIÓN DE MIDDLEWARES ---
app.use(cors());
app.use(express.json());
// Esta línea permite que Render muestre tu crud.html y crud.js
app.use(express.static(__dirname));

// --- CONEXIÓN A LA BASE DE DATOS (Usando variables de Render) ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('✅ ¡Conectado exitosamente a la base de datos de Clever Cloud!');
});

// --- RUTA PARA REGISTRAR USUARIOS ---
app.post('/api/registrar', (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
    }

    const query = 'INSERT INTO usuarios (usuario, password) VALUES (?, ?)';
    db.query(query, [usuario, password], (err, result) => {
        if (err) {
            console.error("❌ Error al insertar en la BD:", err);
            return res.status(500).json({ message: "Error al guardar en la base de datos" });
        }
        res.json({ message: "¡Usuario registrado con éxito!" });
    });
});

// --- RUTA PARA LISTAR USUARIOS (Para pruebas) ---
app.get('/api/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
