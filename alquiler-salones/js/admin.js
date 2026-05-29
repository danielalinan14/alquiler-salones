// ============================================
// PANEL DE ADMINISTRACIÓN
// ============================================

// Verificar que el usuario sea admin antes de cargar
async function verificarAdmin() {
    const esAdministrador = await esAdmin();
    
    if (!esAdministrador) {
        alert('No tienes permisos de administrador');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Cargar todas las reservas (para admin)
async function cargarReservasAdmin() {
    const { data: reservas, error } = await supabase
        .from('reservas')
        .select(`
            *,
            salones (nombre, capacidad),
            perfiles (nombre, email)
        `)
        .order('fecha', { ascending: false });
    
    if (error) {
        console.error('Error:', error);
        document.getElementById('reservas-admin').innerHTML = 
            '<p class="error">Error al cargar reservas</p>';
        return;
    }
    
    const container = document.getElementById('reservas-admin');
    
    if (!reservas.length) {
        container.innerHTML = '<p>No hay reservas registradas</p>';
        return;
    }
    
    container.innerHTML = reservas.map(reserva => `
        <div class="reserva-admin-card">
            <div class="reserva-header">
                <strong>${reserva.salones?.nombre || 'N/A'}</strong>
                <span class="estado ${reserva.estado}">${reserva.estado}</span>
            </div>
            <div class="reserva-body">
                <p><strong>Cliente:</strong> ${reserva.perfiles?.nombre || 'N/A'}</p>
                <p><strong>Email:</strong> ${reserva.perfiles?.email || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${reserva.fecha}</p>
                <p><strong>Horario:</strong> ${reserva.hora_inicio} - ${reserva.hora_fin}</p>
                <p><strong>Código pago:</strong> ${reserva.codigo_pago || 'Sin código'}</p>
                <p><strong>Reservado:</strong> ${new Date(reserva.created_at).toLocaleString()}</p>
            </div>
            <div class="reserva-actions">
                <button onclick="cancelarReservaAdmin(${reserva.id})" class="btn-cancelar">
                    ❌ Cancelar
                </button>
                <button onclick="modificarReservaAdmin(${reserva.id})" class="btn-modificar">
                    ✏️ Modificar
                </button>
            </div>
        </div>
    `).join('');
}

// Cancelar reserva desde admin
async function cancelarReservaAdmin(reservaId) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    
    const { error } = await supabase
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reservaId);
    
    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('✅ Reserva cancelada');
        cargarReservasAdmin();
    }
}

// Modificar reserva desde admin
async function modificarReservaAdmin(reservaId) {
    const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD):');
    if (!nuevaFecha) return;
    
    const nuevaHoraInicio = prompt('Nueva hora inicio (HH:MM):');
    if (!nuevaHoraInicio) return;
    
    const nuevaHoraFin = prompt('Nueva hora fin (HH:MM):');
    if (!nuevaHoraFin) return;
    
    const { error } = await supabase
        .from('reservas')
        .update({
            fecha: nuevaFecha,
            hora_inicio: nuevaHoraInicio,
            hora_fin: nuevaHoraFin
        })
        .eq('id', reservaId);
    
    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('✅ Reserva modificada');
        cargarReservasAdmin();
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    const esAdmin = await verificarAdmin();
    if (esAdmin) {
        cargarReservasAdmin();
    }
});