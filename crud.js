const API_URL = "https://crudseguridad.onrender.com/api";

const secReg = document.getElementById('section-register');
const secLog = document.getElementById('section-login');
const secAdm = document.getElementById('section-admin');

// --- 1. VALIDACIÓN ---
function esValido(texto, campo) {
    const regex = /^[a-zA-Z0-9]{4,15}$/;
    if (!regex.test(texto)) {
        alert(`Error en ${campo}: Solo letras y números (4-15 caracteres).`);
        return false;
    }
    return true;
}

// --- 2. NAVEGACIÓN ---
document.getElementById('go-login').addEventListener('click', (e) => {
    e.preventDefault();
    secReg.classList.add('hidden');
    secLog.classList.remove('hidden');
});

// --- 3. REGISTRO ---
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
        if (res.ok) e.target.reset();
    } catch (err) {
        alert("Error al conectar con el servidor.");
    }
});

// --- 4. LOGIN (ADMIN) ---
document.getElementById('log-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('log-user').value;
    const password = document.getElementById('log-pass').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        const data = await res.json();

        if (data.success) {
            alert(data.message);
            secLog.classList.add('hidden');
            secAdm.classList.remove('hidden');
            cargarUsuarios(); // Función para llenar la tabla
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Error en el login.");
    }
});

// --- 5. CARGAR TABLA ---
async function cargarUsuarios() {
    const res = await fetch(`${API_URL}/usuarios`);
    const usuarios = await res.json();
    const tabla = document.getElementById('user-table');
    tabla.innerHTML = ''; 

    usuarios.forEach(u => {
        tabla.innerHTML += `<tr><td>${u.id}</td><td>${u.usuario}</td></tr>`;
    });
}
