// --- CONFIGURACIÓN DE LA URL (Agregada en la línea 1) ---
const API_URL = "https://crudseguridad.onrender.com/api";

// Referencias de Elementos
const secReg = document.getElementById('section-register');
const secLog = document.getElementById('section-login');
const secAdm = document.getElementById('section-admin');

// --- 1. VALIDACIÓN DE SEGURIDAD ---
function esValido(texto, campo) {
    const regex = /^[a-zA-Z0-9]{4,15}$/;
    if (!regex.test(texto)) {
        alert(`Error en ${campo}: Solo se permiten letras y números (de 4 a 15 caracteres).`);
        return false;
    }
    return true;
}

// --- 2. NAVEGACIÓN ENTRE VISTAS ---
document.getElementById('go-login').addEventListener('click', (e) => {
    e.preventDefault();
    secReg.classList.add('hidden');
    secLog.classList.remove('hidden');
});

// --- 3. LÓGICA DE REGISTRO (Corregida con API_URL) ---
document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;

    if (!esValido(usuario, 'Usuario') || !esValido(password, 'Password')) return;

    try {
        const res = await fetch(`${API_URL}/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        const data = await res.json();
        alert(data.message);
        e.target.reset();
    } catch (err) {
        alert("Error al conectar con el servidor.");
    }
});
