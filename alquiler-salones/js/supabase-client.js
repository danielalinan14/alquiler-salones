// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================

// !!! REEMPLAZA ESTOS VALORES CON LOS TUYOS DE SUPABASE !!!
const SUPABASE_URL = 'https://mdkhyahemimkpbajfsir.supabase.co';      // Ej: 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ka2h5YWhlbWlta3BiYWpmc2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwODExOTQsImV4cCI6MjA5NTY1NzE5NH0.9mTuKJKTPkBx7D7feajLJ-u2VGrezRWjXm26kvJQyho'; // Ej: 'eyJhbGciOiJIUzI1NiIs...'

// Inicializar cliente de Supabase
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// FUNCIONES DE AUTENTICACIÓN GLOBALES
// ============================================

// Verificar si hay sesión activa
async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    const paginasPublicas = ['/login.html'];
    const esPaginaPublica = paginasPublicas.includes(window.location.pathname);
    
    if (!session && !esPaginaPublica) {
        window.location.href = 'login.html';
    }
    return session;
}

// Cerrar sesión
async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}

// Obtener usuario actual
async function getUsuarioActual() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Verificar si el usuario es administrador
async function esAdmin() {
    const user = await getUsuarioActual();
    if (!user) return false;
    
    const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single();
    
    return perfil?.rol === 'admin';
}

// Mostrar/ocultar enlace de admin según rol
async function verificarRolAdmin() {
    const adminLink = document.getElementById('admin-link');
    if (adminLink && await esAdmin()) {
        adminLink.style.display = 'inline';
    }
}

// Cargar nombre del usuario en el icono
async function cargarInfoUsuario() {
    const user = await getUsuarioActual();
    const userIcon = document.getElementById('user-icon');
    const userName = document.getElementById('user-name');
    
    if (user && userIcon) {
        const email = user.email;
        const inicial = email.charAt(0).toUpperCase();
        userIcon.querySelector('span').textContent = inicial;
        
        if (userName) {
            const { data: perfil } = await supabase
                .from('perfiles')
                .select('nombre')
                .eq('id', user.id)
                .single();
            userName.textContent = perfil?.nombre || email.split('@')[0];
        }
    }
}

// Ejecutar al cargar cada página
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    verificarRolAdmin();
    cargarInfoUsuario();
});

// Función para mostrar mensajes
function mostrarMensaje(elementId, mensaje, tipo) {
    const div = document.getElementById(elementId);
    if (div) {
        div.className = `message ${tipo}`;
        div.innerHTML = mensaje;
        setTimeout(() => {
            div.innerHTML = '';
        }, 3000);
    }
}