const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- CONEXIÓN A BASE DE DATOS ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error de conexión:', err.message);
        return;
    }
    console.log('✅ Conectado exitosamente a Clever Cloud');
});

// --- RUTA: REGISTRAR ---
app.post('/api/registrar', (req, res) => {
    const { usuario, password } = req.body;
    if (!usuario || !password) return res.status(400).json({ message: "Faltan datos" });

    const query = 'INSERT INTO usuarios (usuario, password) VALUES (?, ?)';
    db.query(query, [usuario, password], (err, result) => {
        if (err) {
            console.error("❌ Error en INSERT:", err);
            return res.status(500).json({ message: "Error al guardar en la base de datos" });
        }
        res.json({ message: "¡Usuario registrado con éxito!" });
    });
});

// --- RUTA: LOGIN (Para entrar como Admin) ---
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';
    
    db.query(query, [usuario, password], (err, results) => {
        if (err) return res.status(500).json({ message: "Error en el servidor" });
        
        if (results.length > 0) {
            res.json({ message: "¡Bienvenido Admin!", success: true });
        } else {
            res.status(401).json({ message: "Usuario o contraseña incorrectos", success: false });
        }
    });
});

// --- RUTA: VER USUARIOS ---
app.get('/api/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en puerto ${PORT}`);
});
