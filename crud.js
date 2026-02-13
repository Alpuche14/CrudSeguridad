const API_URL = "https://crudseguridad.onrender.com/api";

const secReg = document.getElementById('section-register');
const secLog = document.getElementById('section-login');
const secAdm = document.getElementById('section-admin');

// Navegación
document.getElementById('go-login').addEventListener('click', (e) => {
    e.preventDefault();
    secReg.classList.add('hidden');
    secLog.classList.remove('hidden');
});

// Registro
document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;

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
        alert("Error de conexión");
    }
});

// Login Admin (Corregido para evitar el error null)
const logForm = document.getElementById('log-form');
if (logForm) {
    logForm.addEventListener('submit', async (e) => {
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
                secLog.classList.add('hidden');
                secAdm.classList.remove('hidden');
                cargarTabla();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Error en login");
        }
    });
}

async function cargarTabla() {
    const res = await fetch(`${API_URL}/usuarios`);
    const users = await res.json();
    const table = document.getElementById('user-table');
    table.innerHTML = users.map(u => `<tr><td>${u.id}</td><td>${u.usuario}</td></tr>`).join('');
}
