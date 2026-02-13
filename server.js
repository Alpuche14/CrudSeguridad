const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Configuración de la base de datos con SSL para Clever Cloud
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
    if (err) return console.error('❌ Error BD:', err.message);
    console.log('✅ Conectado a Clever Cloud y listo para usar roles');
});

// --- 📝 REGISTRO DE USUARIOS ---
app.post('/api/registrar', (req, res) => {
    const { usuario, password } = req.body;
    // Por defecto, los nuevos registrados tienen rol 'usuario'
    const query = 'INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, "usuario")';
    db.execute(query, [usuario, password], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error al guardar el usuario" });
        }
        res.json({ message: "¡Usuario registrado correctamente!" });
    });
});

// --- 🔑 LOGIN CON PROTECCIÓN Y ROLES ---
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    
    console.log(`Intentando entrar con: ${usuario}`);

    // Usamos db.execute (Sentencia Preparada) para neutralizar inyecciones SQL
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';
    
    db.execute(query, [usuario, password], (err, results) => {
        if (err) {
            console.error('Error en login:', err);
            return res.status(500).json({ success: false, message: "Error interno del servidor" });
        }
        
        if (results.length > 0) {
            const user = results[0];

            // Verificamos el rol directamente desde la base de datos
            if (user.rol === 'admin') {
                console.log(`✅ Acceso concedido como ADMIN: ${usuario}`);
                res.json({ 
                    success: true, 
                    message: "¡Bienvenido Administrador!",
                    user: { usuario: user.usuario, rol: user.rol }
                });
            } else {
                console.log(`⚠️ Usuario sin permisos: ${usuario}`);
                // Respondemos con 403 (Prohibido) para usuarios que no son admin
                res.status(403).json({ 
                    success: false, 
                    message: "Acceso denegado: Se requieren permisos de administrador." 
                });
            }
        } else {
            console.log(`❌ Credenciales incorrectas para: ${usuario}`);
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos." });
        }
    });
});

// --- 👥 OBTENER LISTA DE USUARIOS ---
app.get('/api/usuarios', (req, res) => {
    db.query('SELECT id, usuario, rol FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: "Error al obtener usuarios" });
        res.json(results);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
