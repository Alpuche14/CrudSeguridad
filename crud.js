const API_URL = "https://crudseguridad.onrender.com/api";
// Referencias de Elementos
const secReg = document.getElementById('section-register');
const secLog = document.getElementById('section-login');
const secAdm = document.getElementById('section-admin');

// --- 1. VALIDACIÓN DE SEGURIDAD (Letras y números únicamente) ---
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

// --- 3. LÓGICA DE REGISTRO (Público) ---
document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('reg-user').value.trim();
    const password = document.getElementById('reg-pass').value.trim();

    // Restricción espejo en ambos campos
    if (!esValido(usuario, "Usuario") || !esValido(password, "Contraseña")) return;

    try {
        await fetch('http://localhost:3000/api/registrar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ usuario, password })
        });
        alert("¡Registrado con éxito!");
        e.target.reset();
    } catch (error) {
        alert("Error al conectar con el servidor.");
    }
});

// --- 4. LOGIN DE ADMINISTRADOR ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if (user === "admin" && pass === "admin123") {
        await cargarTablaAdmin();
        secLog.classList.add('hidden');
        secAdm.classList.remove('hidden');
    } else {
        alert("Credenciales incorrectas.");
    }
});

// --- 5. CRUD: CARGAR, MODIFICAR Y ELIMINAR ---
async function cargarTablaAdmin() {
    try {
        const res = await fetch('http://localhost:3000/api/usuarios');
        const datos = await res.json();
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        datos.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td><input type="text" id="edit-name-${u.id}" value="${u.nombre}" class="edit-input"></td>
                    <td><input type="text" id="edit-pass-${u.id}" value="${u.password}" class="edit-input"></td>
                    <td>
                        <button onclick="modificar(${u.id})" class="btn-mod">Guardar</button>
                        <button onclick="eliminar(${u.id})" class="btn-del">Borrar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) { alert("Error al cargar datos."); }
}

window.eliminar = async (id) => {
    if (!confirm("¿Eliminar este registro de MySQL?")) return;
    await fetch(`http://localhost:3000/api/usuarios/${id}`, { method: 'DELETE' });
    cargarTablaAdmin();
};

window.modificar = async (id) => {
    const nombre = document.getElementById(`edit-name-${id}`).value.trim();
    const password = document.getElementById(`edit-pass-${id}`).value.trim();

    // También validamos seguridad al editar
    if (!esValido(nombre, "Nombre") || !esValido(password, "Contraseña")) return;

    await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nombre, password })
    });
    alert("Usuario actualizado en MySQL");
    cargarTablaAdmin();

};
