// ============================================
// CALENDARIO Y SISTEMA DE RESERVAS
// ============================================

let salonActual = null;
let reservasExistentes = [];

// Obtener ID del salón desde la URL
function getSalonId() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

// Cargar detalles del salón
async function cargarDetalleSalon() {
    const salonId = getSalonId();
    
    const { data: salon, error } = await supabase
        .from('salones')
        .select('*')
        .eq('id', salonId)
        .single();
    
    if (error || !salon) {
        document.getElementById('salon-detalle').innerHTML = '<p class="error">Salón no encontrado</p>';
        return;
    }
    
    salonActual = salon;
    
    const detalle = document.getElementById('salon-detalle');
    detalle.innerHTML = `
        <div class="salon-header">
            <h1>${salon.nombre}</h1>
            <div class="salon-stats">
                <span>🎯 Capacidad: ${salon.capacidad} personas</span>
                <span>💰 Q${salon.precio_por_hora}/hora</span>
            </div>
            <div class="descripcion-larga">
                ${salon.descripcion_larga || salon.descripcion || 'Sin descripción disponible'}
            </div>
        </div>
    `;
    
    await cargarReservas();
    configurarCalendario();
}

// Cargar todas las reservas del salón
async function cargarReservas() {
    const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('salon_id', getSalonId())
        .eq('estado', 'confirmada')
        .order('fecha', { ascending: true });
    
    if (error) {
        console.error('Error al cargar reservas:', error);
        return;
    }
    
    reservasExistentes = data;
    mostrarHorariosOcupados();
}

// Mostrar lista de horarios ocupados
function mostrarHorariosOcupados() {
    const container = document.getElementById('horarios-ocupados');
    
    if (!reservasExistentes.length) {
        container.innerHTML = '<p>✅ No hay reservas para este salón</p>';
        return;
    }
    
    // Agrupar por fecha
    const reservasPorFecha = {};
    reservasExistentes.forEach(reserva => {
        if (!reservasPorFecha[reserva.fecha]) {
            reservasPorFecha[reserva.fecha] = [];
        }
        reservasPorFecha[reserva.fecha].push(reserva);
    });
    
    container.innerHTML = Object.entries(reservasPorFecha).map(([fecha, reservas]) => `
        <div class="fecha-reservas">
            <strong>📅 ${fecha}</strong>
            <ul>
                ${reservas.map(r => `<li>⏰ ${r.hora_inicio} - ${r.hora_fin}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

// Configurar Flatpickr (calendario visual)
function configurarCalendario() {
    // Verificar si Flatpickr está disponible
    if (typeof flatpickr === 'undefined') {
        console.error('Flatpickr no cargado');
        return;
    }
    
    flatpickr("#calendario", {
        locale: "es",
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: new Date().fp_incr(180), // 6 meses
        disable: diasCompletamenteOcupados(),
        onDayCreate: (dateObj, dateStr, dayElement) => {
            // Marcar días con reservas
            if (diasConReservas().includes(dateStr)) {
                dayElement.style.backgroundColor = 'rgba(255,107,107,0.3)';
            }
        },
        onChange: (selectedDates, dateStr) => {
            document.getElementById('fecha').value = dateStr;
            actualizarHorasDisponibles(dateStr);
        }
    });
}

// Días completamente ocupados (todas las horas)
function diasCompletamenteOcupados() {
    // Puedes implementar lógica más compleja
    return [];
}

// Días que tienen al menos una reserva
function diasConReservas() {
    return [...new Set(reservasExistentes.map(r => r.fecha))];
}

// Actualizar horas disponibles según fecha seleccionada
async function actualizarHorasDisponibles(fecha) {
    if (!fecha) return;
    
    // Obtener reservas de ese día
    const reservasDia = reservasExistentes.filter(r => r.fecha === fecha);
    const horasOcupadas = reservasDia.map(r => r.hora_inicio);
    
    const selectInicio = document.getElementById('hora-inicio');
    const selectFin = document.getElementById('hora-fin');
    
    // Habilitar todas las opciones primero
    for (let option of selectInicio.options) {
        if (option.value) {
            option.disabled = horasOcupadas.includes(option.value);
        }
    }
    
    // Resetear selección si estaba ocupada
    if (horasOcupadas.includes(selectInicio.value)) {
        selectInicio.value = '';
    }
}

// Mostrar/ocultar campo de código de pago
function toggleCodigoPago() {
    const tieneCodigo = document.getElementById('tiene-codigo').checked;
    const codigoField = document.getElementById('codigo-pago-field');
    
    if (tieneCodigo) {
        codigoField.classList.add('show');
    } else {
        codigoField.classList.remove('show');
        document.getElementById('codigo-pago').value = '';
    }
}

// Verificar conflicto de horarios (no se puede traslapar ni un minuto)
async function verificarConflicto(salonId, fecha, horaInicio, horaFin) {
    // Usar la función de PostgreSQL para verificar
    const { data, error } = await supabase
        .rpc('verificar_conflicto_horario', {
            p_salon_id: salonId,
            p_fecha: fecha,
            p_hora_inicio: horaInicio,
            p_hora_fin: horaFin
        });
    
    if (error) {
        console.error('Error al verificar conflicto:', error);
        // Fallback: verificar manualmente
        return reservasExistentes.some(r => 
            r.fecha === fecha &&
            ((r.hora_inicio < horaFin && r.hora_fin > horaInicio))
        );
    }
    
    return data;
}

// Confirmar reserva
async function confirmarReserva() {
    // Verificar usuario logueado
    const user = await getUsuarioActual();
    if (!user) {
        mostrarMensaje('reserva-mensaje', 'Debes iniciar sesión para reservar', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const fecha = document.getElementById('fecha').value;
    const horaInicio = document.getElementById('hora-inicio').value;
    const horaFin = document.getElementById('hora-fin').value;
    const tieneCodigo = document.getElementById('tiene-codigo').checked;
    let codigoPago = null;
    
    if (tieneCodigo) {
        codigoPago = document.getElementById('codigo-pago').value;
        if (!codigoPago || codigoPago.length !== 8) {
            mostrarMensaje('reserva-mensaje', 'Código de pago debe tener 8 dígitos', 'error');
            return;
        }
    }
    
    if (!fecha || !horaInicio || !horaFin) {
        mostrarMensaje('reserva-mensaje', 'Completa todos los campos', 'error');
        return;
    }
    
    // Verificar que hora_inicio < hora_fin
    if (horaInicio >= horaFin) {
        mostrarMensaje('reserva-mensaje', 'La hora de inicio debe ser menor a la hora de fin', 'error');
        return;
    }
    
    // Verificar conflicto de horarios
    const hayConflicto = await verificarConflicto(salonActual.id, fecha, horaInicio, horaFin);
    
    if (hayConflicto) {
        mostrarMensaje('reserva-mensaje', '❌ Este horario ya está reservado (no se puede traslapar ni un minuto)', 'error');
        return;
    }
    
    // Crear reserva
    const { error: reservaError } = await supabase
        .from('reservas')
        .insert({
            salon_id: salonActual.id,
            usuario_id: user.id,
            fecha: fecha,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            codigo_pago: codigoPago,
            estado: 'confirmada'
        });
    
    if (reservaError) {
        mostrarMensaje('reserva-mensaje', `Error: ${reservaError.message}`, 'error');
    } else {
        mostrarMensaje('reserva-mensaje', '✅ Reserva confirmada exitosamente!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    cargarDetalleSalon();
    
    // Configurar fecha mínima en input
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').min = hoy;
    
    // Event listener para código de pago
    const tieneCodigoRadio = document.getElementById('tiene-codigo');
    if (tieneCodigoRadio) {
        tieneCodigoRadio.addEventListener('change', toggleCodigoPago);
        document.getElementById('no-codigo').addEventListener('change', toggleCodigoPago);
    }
});