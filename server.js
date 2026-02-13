const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DE LA CONEXIÓN (Usa variables de entorno de Render)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306 // Puerto estándar para Clever Cloud
});

// 2. CONECTAR Y CREAR TABLA AUTOMÁTICAMENTE
db.connect(err => {
    if (err) {
        console.error('Error crítico al conectar a MySQL en la nube:', err);
        return;
    }
    console.log('¡Conectado exitosamente a la base de datos de Clever Cloud!');

    // Script para crear la tabla si no existe (Plan B)
    const sqlCreate = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(50) NOT NULL,
            password VARCHAR(50) NOT NULL
        );`;
    
    db.query(sqlCreate, (err) => {
        if (err) {
            console.log("Error al verificar/crear tabla:", err);
        } else {
            console.log("Estructura de base de datos verificada y lista para usar.");
        }
    });
});

// 3. RUTA PARA REGISTRAR (Público)
app.post('/api/registrar', (req, { usuario, password }) => {
    const sql = "INSERT INTO usuarios (nombre, password) VALUES (?, ?)";
    db.query(sql, [usuario, password], (err) => {
        if (err) return req.status(500).send(err);
        req.send({ message: "Usuario guardado en MySQL Cloud" });
    });
});

// 4. RUTA PARA OBTENER TODOS (Dashboard Admin)
app.get('/api/usuarios', (req, res) => {
    db.query("SELECT * FROM usuarios", (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
});

// 5. RUTA PARA ELIMINAR
app.delete('/api/usuarios/:id', (req, res) => {
    db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Eliminado" });
    });
});

// 6. RUTA PARA ACTUALIZAR
app.put('/api/usuarios/:id', (req, res) => {
    const { nombre, password } = req.body;
    db.query("UPDATE usuarios SET nombre = ?, password = ? WHERE id = ?", 
    [nombre, password, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Actualizado" });
    });
});

// 7. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en línea en puerto ${PORT}`);
});