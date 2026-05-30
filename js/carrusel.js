// ============================================
// CARRUSELES Y PÁGINA PRINCIPAL
// ============================================

// Variable global para almacenar datos de salones
let salonesData = [];

// Cargar todos los salones desde la BD
async function cargarSalones() {
    const { data: salones, error } = await supabase
        .from('salones')
        .select('*')
        .order('id');
    
    if (error) {
        console.error('Error al cargar salones:', error);
        return;
    }
    
    salonesData = salones;
    const container = document.getElementById('salones-container');
    container.innerHTML = '';
    
    for (const salon of salones) {
        // Crear tarjeta con efecto glass
        const salonCard = document.createElement('div');
        salonCard.className = 'salon-card-glass';
        
        // Imágenes de ejemplo (reemplazar con URLs reales)
        const imagenes = [
            `assets/salones/salon${salon.id}-1.jpg`,
            `assets/salones/salon${salon.id}-2.jpg`,
            `assets/salones/salon${salon.id}-3.jpg`
        ];
        
        salonCard.innerHTML = `
            <div class="carrusel-container">
                <div class="carrusel" id="carrusel-${salon.id}">
                    ${imagenes.map(img => `
                        <div class="carrusel-slide">
                            <img src="${img}" alt="${salon.nombre}" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(salon.nombre)}'">
                        </div>
                    `).join('')}
                </div>
                <button class="carrusel-prev" onclick="cambiarSlide(${salon.id}, -1)">❮</button>
                <button class="carrusel-next" onclick="cambiarSlide(${salon.id}, 1)">❯</button>
                <div class="carrusel-dots" id="dots-${salon.id}"></div>
                
                <!-- Botón Glass para reservar -->
                <button class="btn-reservar-glass" onclick="irAReservar(${salon.id})">
                    ✨ Reservar Ahora
                </button>
            </div>
            <div class="salon-info">
                <h3>${salon.nombre}</h3>
                <p class="descripcion-corta">${salon.descripcion || 'Espacio único para tu evento'}</p>
                <div class="descripcion-completa" id="desc-full-${salon.id}">
                    ${salon.descripcion_larga || salon.descripcion || ''}
                </div>
                <p class="capacidad">🎯 Capacidad: ${salon.capacidad} personas</p>
                <p class="precio">💰 Q${salon.precio_por_hora}/hora</p>
                <button class="btn-ver-mas" onclick="toggleDescripcion(${salon.id})">
                    Ver más detalles →
                </button>
            </div>
        `;
        
        container.appendChild(salonCard);
        
        // Inicializar carrusel
        inicializarCarrusel(salon.id, imagenes.length);
    }
}

// Alternar descripción completa
function toggleDescripcion(salonId) {
    const descElem = document.getElementById(`desc-full-${salonId}`);
    const btn = event.target;
    
    if (descElem.style.display === 'none' || !descElem.style.display) {
        descElem.style.display = 'block';
        btn.textContent = 'Ver menos detalles ←';
    } else {
        descElem.style.display = 'none';
        btn.textContent = 'Ver más detalles →';
    }
}

// Inicializar carrusel
function inicializarCarrusel(salonId, totalSlides) {
    let slideActual = 0;
    const carrusel = document.getElementById(`carrusel-${salonId}`);
    const dotsContainer = document.getElementById(`dots-${salonId}`);
    
    // Crear dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.onclick = () => irASlide(salonId, i);
        dotsContainer.appendChild(dot);
    }
    
    // Variables globales para los controles
    window[`slideActual_${salonId}`] = slideActual;
    
    window.cambiarSlide = function(id, direccion) {
        let actual = window[`slideActual_${id}`] || 0;
        const nuevo = actual + direccion;
        if (nuevo >= 0 && nuevo < totalSlides) {
            window[`slideActual_${id}`] = nuevo;
            actualizarCarrusel(id, nuevo);
        }
    };
    
    window.irASlide = function(id, index) {
        window[`slideActual_${id}`] = index;
        actualizarCarrusel(id, index);
    };
    
    function actualizarCarrusel(id, index) {
        const carr = document.getElementById(`carrusel-${id}`);
        if (carr) {
            const offset = -index * 100;
            carr.style.transform = `translateX(${offset}%)`;
            
            // Actualizar dots
            const dots = document.getElementById(`dots-${id}`).children;
            for (let i = 0; i < dots.length; i++) {
                dots[i].classList.toggle('active', i === index);
            }
        }
    }
    
    actualizarCarrusel(salonId, 0);
}

// Ir a página de reserva del salón
function irAReservar(salonId) {
    window.location.href = `salon.html?id=${salonId}`;
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarSalones();
});