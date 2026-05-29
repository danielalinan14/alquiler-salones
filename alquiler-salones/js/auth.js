// ============================================
// AUTENTICACIÓN - LOGIN Y REGISTRO
// ============================================

// Cambiar entre pestañas de login y registro
function mostrarTab(tab) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tab}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// Iniciar sesión
async function iniciarSesion() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        mostrarMensaje('login-message', 'Completa todos los campos', 'error');
        return;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        mostrarMensaje('login-message', error.message, 'error');
    } else {
        mostrarMensaje('login-message', '✅ Ingresando...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Registrarse
async function registrarse() {
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const telefono = document.getElementById('reg-telefono').value;
    const password = document.getElementById('reg-password').value;
    
    if (!nombre || !email || !telefono || !password) {
        mostrarMensaje('registro-message', 'Todos los campos son obligatorios', 'error');
        return;
    }
    
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                nombre: nombre,
                telefono: telefono
            }
        }
    });
    
    if (authError) {
        mostrarMensaje('registro-message', authError.message, 'error');
        return;
    }
    
    mostrarMensaje('registro-message', 
        '✅ Registro exitoso! Revisa tu email para confirmar', 
        'success');
    
    setTimeout(() => {
        mostrarTab('login');
        document.getElementById('login-email').value = email;
    }, 2000);
}