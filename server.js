const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});

db.connect((err) => {
    if (err) return console.error('❌ Error BD:', err.message);
    console.log('✅ Conectado a Clever Cloud');
});

// --- 🔑 LISTA BLANCA DE ADMINISTRADORES ---
// Solo estos usuarios podrán entrar como admin
const ADMINS_PERMITIDOS = ['tu_usuario_1', 'tu_usuario_2', 'admin']; 

// REGISTRO (Cualquiera puede registrarse, pero no todos son admin)
app.post('/api/registrar', (req, res) => {
    const { usuario, password } = req.body;
    const query = 'INSERT INTO usuarios (usuario, password) VALUES (?, ?)';
    db.query(query, [usuario, password], (err) => {
        if (err) return res.status(500).json({ message: "Error al guardar" });
        res.json({ message: "¡Usuario registrado correctamente!" });
    });
});

// LOGIN CON FILTRO DE SEGURIDAD
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;

    // Bloqueo si no está en la lista de confianza
    if (!ADMINS_PERMITIDOS.includes(usuario)) {
        return res.status(403).json({ 
            success: false, 
            message: "Acceso denegado: No tienes permisos de administrador." 
        });
    }

    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';
    db.query(query, [usuario, password], (err, results) => {
        if (err) return res.status(500).json({ message: "Error" });
        if (results.length > 0) {
            res.json({ success: true, message: "Acceso concedido. ¡Bienvenido!" });
        } else {
            res.status(401).json({ success: false, message: "Contraseña incorrecta." });
        }
    });
});

app.get('/api/usuarios', (req, res) => {
    db.query('SELECT id, usuario FROM usuarios', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Corriendo en puerto ${PORT}`));
