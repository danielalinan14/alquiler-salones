// ============================================
// DATOS DE SALONES (HARDCODEADOS - SIN BASE DE DATOS)
// ============================================

const salonesData = [
    {
        id: 1,
        nombre: "Salón Elegante Rústico Colonial",
        capacidad: 80,
        descripcion: "Arquitectura colonial con madera y vigas expuestas",
        descripcion_larga: "Salón de eventos elegante estilo rústico colonial. Arquitectura con techo alto de madera y vigas expuestas, lámparas colgantes cálidas, grandes ventanales con vista al jardín, piso de piedra o concreto pulido, decoración elegante para eventos sociales y bodas. Mesas redondas con manteles blancos, centros de mesa florales naturales y sillas elegantes. Ambiente cálido, acogedor y exclusivo.",
        precio_por_hora: 180,
        imagenes: [
            "assets/salones/salon1-1.jpg",
            "assets/salones/salon1-2.jpg",
            "assets/salones/salon1-3.jpg"
        ]
    },
    {
        id: 2,
        nombre: "Salón Moderno Minimalista",
        capacidad: 120,
        descripcion: "Diseño contemporáneo con paredes blancas y grandes ventanales",
        descripcion_larga: "Salón de eventos moderno y minimalista dentro de una finca en Guatemala. Diseño contemporáneo con paredes blancas, techo alto, ventanales grandes de vidrio, mucha iluminación natural, acabados elegantes y limpios. Piso brillante, decoración sofisticada para bodas, recepciones y eventos familiares. Mesas bien organizadas, arreglos florales modernos y ambiente amplio.",
        precio_por_hora: 250,
        imagenes: [
            "assets/salones/salon2-1.jpg",
            "assets/salones/salon2-2.jpg",
            "assets/salones/salon2-3.jpg"
        ]
    },
    {
        id: 3,
        nombre: "Salón Jardín Techado Elegante",
        capacidad: 60,
        descripcion: "Terraza techada con vista a jardines y naturaleza",
        descripcion_larga: "Salón de eventos abierto tipo terraza techada. Estructura elegante con techo alto de madera o metal decorativo, laterales abiertos con vista hacia jardines verdes, naturaleza alrededor, iluminación cálida con guirnaldas de luces, decoración elegante para bodas, cumpleaños y eventos especiales. Mesas decoradas y ambiente fresco natural.",
        precio_por_hora: 150,
        imagenes: [
            "assets/salones/salon3-1.jpg",
            "assets/salones/salon3-2.jpg",
            "assets/salones/salon3-3.jpg"
        ]
    }
];

// Variable para almacenar reservas locales (simuladas)
let reservasLocales = JSON.parse(localStorage.getItem('reservas')) || [];

// ============================================
// FUNCIONES DEL CARRUSEL
// ============================================

// Cargar todos los salones
async function cargarSalones() {
    const container = document.getElementById('salones-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const salon of salonesData) {
        // Crear tarjeta con efecto glass
        const salonCard = document.createElement('div');
        salonCard.className = 'salon-card-glass';
        
        salonCard.innerHTML = `
            <div class="carrusel-container" style="position: relative; overflow: hidden; height: 300px;">
                <div class="carrusel" id="carrusel-${salon.id}" style="display: flex; transition: transform 0.5s ease; height: 100%;">
                    ${salon.imagenes.map(img => `
                        <div class="carrusel-slide" style="min-width: 100%; height: 100%;">
                            <img src="${img}" alt="${salon.nombre}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    `).join('')}
                </div>
                <button class="carrusel-prev" onclick="cambiarSlide(${salon.id}, -1)">❮</button>
                <button class="carrusel-next" onclick="cambiarSlide(${salon.id}, 1)">❯</button>
                <div class="carrusel-dots" id="dots-${salon.id}" style="position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px;"></div>
                
                <button class="btn-reservar-glass" onclick="irAReservar(${salon.id})" style="position: absolute; bottom: 20px; right: 20px; background: rgba(28,114,147,0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 50px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s; z-index: 10;">
                    ✨ Reservar Ahora
                </button>
            </div>
            <div class="salon-info" style="padding: 20px;">
                <h3 style="font-size: 24px; margin-bottom: 10px;">${salon.nombre}</h3>
                <p class="descripcion-corta" style="color: #9eb3c2; margin-bottom: 15px; font-style: italic;">${salon.descripcion}</p>
                <div class="descripcion-completa" id="desc-full-${salon.id}" style="display: none; color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6; margin: 15px 0;">
                    ${salon.descripcion_larga}
                </div>
                <p class="capacidad" style="display: inline-block; margin: 5px 10px 5px 0; padding: 5px 12px; background: rgba(0,0,0,0.3); border-radius: 20px; font-size: 14px;">🎯 Capacidad: ${salon.capacidad} personas</p>
                <p class="precio" style="display: inline-block; margin: 5px 10px 5px 0; padding: 5px 12px; background: rgba(0,0,0,0.3); border-radius: 20px; font-size: 14px;">💰 Q${salon.precio_por_hora}/hora</p>
                <button class="btn-ver-mas" onclick="toggleDescripcion(${salon.id})" style="background: none; border: 1px solid #1c7293; color: #9eb3c2; padding: 8px 20px; border-radius: 25px; cursor: pointer; margin-top: 15px; width: 100%;">
                    Ver más detalles →
                </button>
            </div>
        `;
        
        container.appendChild(salonCard);
        
        // Inicializar carrusel
        inicializarCarrusel(salon.id, salon.imagenes.length);
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
    
    if (!carrusel || !dotsContainer) return;
    
    // Crear dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.style.cssText = 'width: 8px; height: 8px; background: rgba(255,255,255,0.5); border-radius: 50%; cursor: pointer; transition: all 0.3s;';
        if (i === 0) dot.style.background = 'white';
        dot.onclick = () => irASlide(salonId, i);
        dotsContainer.appendChild(dot);
    }
    
    // Variables globales para los controles
    window[`slideActual_${salonId}`] = 0;
    
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
            const dots = document.getElementById(`dots-${id}`);
            if (dots) {
                const dotsChildren = dots.children;
                for (let i = 0; i < dotsChildren.length; i++) {
                    dotsChildren[i].style.background = i === index ? 'white' : 'rgba(255,255,255,0.5)';
                    if (i === index) {
                        dotsChildren[i].style.width = '20px';
                        dotsChildren[i].style.borderRadius = '10px';
                    } else {
                        dotsChildren[i].style.width = '8px';
                        dotsChildren[i].style.borderRadius = '50%';
                    }
                }
            }
        }
    }
    
    actualizarCarrusel(salonId, 0);
}

// Ir a página de reserva del salón
function irAReservar(salonId) {
    window.location.href = `salon.html?id=${salonId}`;
}

// Obtener salón por ID
function getSalonById(id) {
    return salonesData.find(s => s.id === parseInt(id));
}

// Obtener todas las reservas
function getReservas() {
    return JSON.parse(localStorage.getItem('reservas')) || [];
}

// Guardar reserva
function guardarReserva(reserva) {
    const reservas = getReservas();
    reservas.push(reserva);
    localStorage.setItem('reservas', JSON.stringify(reservas));
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarSalones();
});
