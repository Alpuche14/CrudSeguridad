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

// --- 🔑 LISTA BLANCA (IMPORTANTE: Pon tus usuarios aquí) ---
// Revisa que el nombre esté escrito EXACTAMENTE igual que en la base de datos
const ADMINS_PERMITIDOS = ['victor14', 'victor10']; 

app.post('/api/registrar', (req, res) => {
    const { usuario, password } = req.body;
    const query = 'INSERT INTO usuarios (usuario, password) VALUES (?, ?)';
    db.query(query, [usuario, password], (err) => {
        if (err) return res.status(500).json({ message: "Error al guardar" });
        res.json({ message: "¡Usuario registrado!" });
    });
});

app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    
    console.log(`Intentando entrar con: ${usuario}`); // Esto saldrá en los logs de Render

    // 1. Verificación de Lista Blanca
    if (!ADMINS_PERMITIDOS.includes(usuario)) {
        console.log(`🚫 Bloqueado: ${usuario} no está en la lista blanca.`);
        return res.status(403).json({ 
            success: false, 
            message: "Acceso denegado: Usuario no autorizado como administrador." 
        });
    }

    // 2. Verificación de Credenciales
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';
    db.query(query, [usuario, password], (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la consulta" });
        
        if (results.length > 0) {
            console.log(`✅ Acceso concedido para: ${usuario}`);
            res.json({ success: true, message: "¡Bienvenido Admin!" });
        } else {
            console.log(`❌ Contraseña incorrecta para: ${usuario}`);
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
app.listen(PORT, () => console.log(`🚀 Servidor listo`));



