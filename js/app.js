// =========================================================================
// CLIMASMART CHILE - LÓGICA 100% FUNCIONAL (SIMULADOR, DIAGNÓSTICO,
// CALCULADORAS, AGENDA ONLINE, API + LOCALSTORAGE Y PRESUPUESTO IMPRIMIBLE)
// =========================================================================

const STORAGE_KEY_RESERVAS = 'climasmart_reservas_v1';
const STORAGE_KEY_WA = 'climasmart_whatsapp_phone';
const DEFAULT_WA_PHONE = '56912345678';

function getWhatsAppNumber() {
  return localStorage.getItem(STORAGE_KEY_WA) || DEFAULT_WA_PHONE;
}

function formatCLP(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(valor);
}

// Notificación Toast
let toastTimer = null;
function mostrarToast(mensaje) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3400);
}

// Menú Móvil
function toggleMobileMenu() {
  const nav = document.getElementById('navLinks');
  if (nav) nav.classList.toggle('active');
}

function closeMobileMenu() {
  const nav = document.getElementById('navLinks');
  if (nav) nav.classList.remove('active');
}

// =========================================================================
// 1. SIMULADOR DE CELULAR SMART WI-FI EN PORTADA
// =========================================================================
const MODOS_CLIMA = ['Frío ❄️', 'Calor ☀️', 'Antihumedad 💧'];
let modoIndex = 0;

let acState = {
  power: true,
  temp: 21,
  mode: MODOS_CLIMA[0],
  saving: true
};

const COMANDOS_VOZ_EJEMPLO = [
  { texto: '🎙️ "Alexa, pon el aire a 21 grados en Modo Frío"', temp: 21, modoIdx: 0, saving: true },
  { texto: '🎙️ "Ok Google, activa Calefacción a 24 grados"', temp: 24, modoIdx: 1, saving: true },
  { texto: '🎙️ "Alexa, activa Modo Ahorro Nocturno a 22 grados"', temp: 22, modoIdx: 0, saving: true },
  { texto: '🎙️ "Ok Google, quita la humedad de la pieza"', temp: 20, modoIdx: 2, saving: true }
];
let voiceCmdIndex = 0;

function updatePhoneUI() {
  const screen = document.getElementById('acScreen');
  const tempEl = document.getElementById('acTemp');
  const modeEl = document.getElementById('acMode');
  const statusEl = document.getElementById('acStatus');
  const powerBtn = document.getElementById('btnPower');
  const savingBtn = document.getElementById('btnSaving');
  const costHourEl = document.getElementById('acCostHour');
  const monthlySavingsEl = document.getElementById('acMonthlySavings');
  const roomTempEl = document.getElementById('phoneRoomTemp');

  if (!screen) return;

  screen.classList.remove('off', 'warm-mode', 'dry-mode');

  if (!acState.power) {
    screen.classList.add('off');
    tempEl.textContent = '-- °C';
    modeEl.textContent = 'Equipo Apagado desde el Celular';
    statusEl.textContent = '🔒 Apagado remoto seguro • Sin gasto fantasma';
    powerBtn.classList.remove('active');
    powerBtn.textContent = 'Encender';
    costHourEl.textContent = '$0 CLP/h';
    monthlySavingsEl.textContent = 'Ahorrando 100%';
    return;
  }

  if (acState.mode.includes('Calor')) {
    screen.classList.add('warm-mode');
  } else if (acState.mode.includes('Antihumedad')) {
    screen.classList.add('dry-mode');
  }

  // Calcular consumo estimado en CLP/hora según temperatura y modo
  let baseCost = 135;
  if (acState.mode.includes('Frío')) {
    // Mientras más frío (ej: 16°C), más gasta; entre 21-24°C es óptimo
    baseCost = 140 + (24 - acState.temp) * 12;
  } else if (acState.mode.includes('Calor')) {
    baseCost = 135 + (acState.temp - 20) * 11;
  } else {
    baseCost = 85;
  }

  baseCost = Math.max(70, baseCost);
  const finalCostHour = acState.saving ? Math.round(baseCost * 0.7) : Math.round(baseCost);
  const ahorroMensual = acState.saving ? Math.round(baseCost * 0.3 * 8 * 30) : 4500;

  tempEl.textContent = `${acState.temp} °C`;
  modeEl.textContent = `Modo: ${acState.mode}`;
  statusEl.textContent = acState.saving
    ? '⚡ Ahorro Nocturno Activo (-30% Luz)'
    : '📶 Conectado por Wi-Fi • Velocidad Normal';

  powerBtn.classList.add('active');
  powerBtn.textContent = 'Apagar';

  if (savingBtn) {
    savingBtn.classList.toggle('active-feature', acState.saving);
  }

  costHourEl.textContent = `$${finalCostHour} CLP/h`;
  monthlySavingsEl.textContent = `-${formatCLP(ahorroMensual)}/mes`;

  if (roomTempEl) {
    const hum = acState.mode.includes('Antihumedad') ? 40 : 48;
    roomTempEl.textContent = `🏠 Pieza: ${acState.temp}°C • ${hum}% Hum`;
  }
}

function togglePower() {
  acState.power = !acState.power;
  updatePhoneUI();
}

function changeTemp(delta) {
  if (!acState.power) {
    acState.power = true;
  }
  acState.temp = Math.min(30, Math.max(16, acState.temp + delta));
  updatePhoneUI();
}

function toggleMode() {
  if (!acState.power) acState.power = true;
  modoIndex = (modoIndex + 1) % MODOS_CLIMA.length;
  acState.mode = MODOS_CLIMA[modoIndex];
  updatePhoneUI();
}

function toggleSaving() {
  if (!acState.power) acState.power = true;
  acState.saving = !acState.saving;
  updatePhoneUI();
  mostrarToast(acState.saving ? '⚡ Ahorro Nocturno activado (-30% en boleta de luz)' : 'Modo potencia estándar activado');
}

function simulateVoiceCommand() {
  const cmd = COMANDOS_VOZ_EJEMPLO[voiceCmdIndex];
  voiceCmdIndex = (voiceCmdIndex + 1) % COMANDOS_VOZ_EJEMPLO.length;

  acState.power = true;
  acState.temp = cmd.temp;
  modoIndex = cmd.modoIdx;
  acState.mode = MODOS_CLIMA[modoIndex];
  acState.saving = cmd.saving;
  updatePhoneUI();

  const feedbackEl = document.getElementById('voiceFeedback');
  if (feedbackEl) {
    feedbackEl.style.display = 'block';
    feedbackEl.textContent = `${cmd.texto} ✅`;
  }
  mostrarToast(cmd.texto);
}

// =========================================================================
// 2. SEMÁFORO DE SALUD DEL AIRE ACONDICIONADO (DIAGNÓSTICO INTERACTIVO)
// =========================================================================
function evaluarSemaforo() {
  const tiempo = parseInt(document.getElementById('diagTiempo')?.value || '1', 10);
  const sintoma = parseInt(document.getElementById('diagSintoma')?.value || '1', 10);
  const smart = document.getElementById('diagSmart')?.value || 'no';
  const panel = document.getElementById('diagResultado');
  if (!panel) return;

  const puntaje = tiempo + sintoma;
  const planSmartSugerido = smart === 'no' ? 'pro' : 'ninguno';

  if (puntaje >= 3 || sintoma === 2) {
    panel.style.background = '#fef2f2';
    panel.style.borderColor = '#f87171';
    panel.innerHTML = `
      <div style="font-size:0.82rem; font-weight:800; color:#dc2626; letter-spacing:0.5px;">🔴 ESTADO ROJO: ATENCIÓN URGENTE</div>
      <h3 style="color:#991b1b; margin:6px 0;">Riesgo de Hongos en Turbina y +30% Gasto de Luz</h3>
      <p style="font-size:0.92rem; color:#7f1d1d; margin-bottom:12px;">
        Tu equipo tiene acumulación interna de polvo y humedad en el rodillo ventilador. Esto reduce su potencia, genera alergias y sube tu cuenta de electricidad.
      </p>
      <div style="background:white; padding:10px 12px; border-radius:10px; font-size:0.88rem; margin-bottom:12px; border:1px solid #fecaca;">
        <strong>Receta recomendada:</strong> ${smart === 'no' ? '🚀 Pack Renueva + Smart Clima Pro ($89.990)' : '🚿 Mantención Profunda Spa del Aire ($59.990)'}
      </div>
      <button type="button" class="btn-primary" style="width:100%; justify-content:center;"
        onclick="seleccionarPlan('mantencion', '${planSmartSugerido}', 'Diagnóstico Semáforo Rojo')">
        ⚡ Cargar Solución Recomendada en el Cotizador
      </button>
    `;
  } else if (puntaje >= 1) {
    panel.style.background = '#fefce8';
    panel.style.borderColor = '#facc15';
    panel.innerHTML = `
      <div style="font-size:0.82rem; font-weight:800; color:#a16207; letter-spacing:0.5px;">🟡 ESTADO AMARILLO: MANTENCIÓN PREVENTIVA</div>
      <h3 style="color:#854d0e; margin:6px 0;">Pérdida Moderada de Eficiencia (-15% Rendimiento)</h3>
      <p style="font-size:0.92rem; color:#713f12; margin-bottom:12px;">
        Es el momento ideal para realizar el Hidro-lavado con Carpa Impermeable antes del cambio fuerte de temporada para evitar goteos y sobrecarga del motor.
      </p>
      <div style="background:white; padding:10px 12px; border-radius:10px; font-size:0.88rem; margin-bottom:12px; border:1px solid #fef08a;">
        <strong>Receta recomendada:</strong> ${smart === 'no' ? '🚀 Pack Spa del Aire + Smart Wi-Fi ($89.990)' : '🚿 Mantención Spa del Aire ($59.990)'}
      </div>
      <button type="button" class="btn-primary" style="width:100%; justify-content:center;"
        onclick="seleccionarPlan('mantencion', '${planSmartSugerido}', 'Diagnóstico Semáforo Amarillo')">
        ⚡ Cotizar este Servicio Ahora
      </button>
    `;
  } else {
    panel.style.background = '#f0fdf4';
    panel.style.borderColor = '#4ade80';
    panel.innerHTML = `
      <div style="font-size:0.82rem; font-weight:800; color:#15803d; letter-spacing:0.5px;">🟢 ESTADO VERDE: EQUIPO LIMPIO</div>
      <h3 style="color:#166534; margin:6px 0;">¡Tu Aire está en Buen Estado Higiénico!</h3>
      <p style="font-size:0.92rem; color:#14532d; margin-bottom:12px;">
        ${smart === 'no'
          ? 'Como tu equipo ya está limpio pero usa control tradicional, solo te falta conectarlo al Wi-Fi de tu celular en 20 minutos para ahorrar hasta 30% de luz.'
          : 'Tu aire está limpio y conectado. Te recomendamos agendar tu próximo Spa del Aire en 6 meses más.'}
      </p>
      <button type="button" class="btn-primary" style="width:100%; justify-content:center;"
        onclick="seleccionarPlan('${smart === 'no' ? 'solo_smart' : 'mantencion'}', 'pro', 'Modernización Smart Clima Pro')">
        📱 ${smart === 'no' ? 'Volver Smart Wi-Fi mi Aire ($44.990)' : 'Ver Presupuesto Preventivo'}
      </button>
    `;
  }
}

// =========================================================================
// 3. SELECCIÓN DIRECTA DE PLANES Y SERVICIOS HACIA EL COTIZADOR
// =========================================================================
function seleccionarPlan(servicio, smart, nombreEtiqueta) {
  const selectServicio = document.getElementById('cotServicio');
  const selectSmart = document.getElementById('cotSmart');
  const badge = document.getElementById('cotBadgeSeleccion');
  const box = document.getElementById('cotizadorBox');

  if (selectServicio) selectServicio.value = servicio;
  if (selectSmart) selectSmart.value = smart;
  if (badge && nombreEtiqueta) {
    badge.textContent = `✓ Seleccionado: ${nombreEtiqueta}`;
  }

  actualizarCotizacion();

  if (box) {
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    box.classList.add('highlight-pulse');
    setTimeout(() => box.classList.remove('highlight-pulse'), 2200);
  }

  mostrarToast(`✅ "${nombreEtiqueta}" cargado en el cotizador`);
}

// =========================================================================
// 4. CALCULADORA DE BTU + SIMULADOR DE AHORRO MENSUAL
// =========================================================================
function syncM2(val) {
  const num = Math.min(100, Math.max(5, parseInt(val, 10) || 18));
  const rangeEl = document.getElementById('rangeM2');
  const inputEl = document.getElementById('inputM2');
  const labelEl = document.getElementById('labelM2');

  if (rangeEl) rangeEl.value = Math.min(80, num);
  if (inputEl && Number(inputEl.value) !== num) inputEl.value = num;
  if (labelEl) labelEl.textContent = `${num} m²`;

  calcularBTU();
}

function calcularBTU() {
  const m2 = parseFloat(document.getElementById('inputM2')?.value) || 18;
  const sol = document.getElementById('selectSol')?.value || 'normal';
  const piso = document.getElementById('selectEspacio')?.value || 'dormitorio';
  const horas = parseInt(document.getElementById('selectHorasUso')?.value || '8', 10);

  let factor = 600;
  if (sol === 'mucho') factor = 750;
  if (piso === 'living_cocina') factor += 100;

  const btuCalculado = m2 * factor;
  let equipoRecomendado = '9.000 BTU';
  let precioInstalacion = '$135.000';
  let codigoServicio = 'instalacion_9_12';
  let consumoHoraBase = 125;
  let explicacion = 'Ideal para dormitorios o escritorios de hasta 18 m². Silencioso y de bajo consumo.';

  if (btuCalculado > 10500 && btuCalculado <= 14500) {
    equipoRecomendado = '12.000 BTU';
    precioInstalacion = '$135.000';
    codigoServicio = 'instalacion_9_12';
    consumoHoraBase = 155;
    explicacion = 'El tamaño favorito en Chile para dormitorios principales o livings medianos (hasta 25 m²).';
  } else if (btuCalculado > 14500 && btuCalculado <= 20000) {
    equipoRecomendado = '18.000 BTU';
    precioInstalacion = '$175.000';
    codigoServicio = 'instalacion_18_24';
    consumoHoraBase = 220;
    explicacion = 'Potencia perfecta para livings amplios, comedores o departamentos con cocina americana.';
  } else if (btuCalculado > 20000) {
    equipoRecomendado = '24.000 BTU';
    precioInstalacion = '$175.000';
    codigoServicio = 'instalacion_18_24';
    consumoHoraBase = 285;
    explicacion = 'Alta capacidad para espacios grandes, plantas abiertas, oficinas o locales comerciales.';
  }

  const ahorroMensualSmart = Math.round(consumoHoraBase * horas * 30 * 0.28);

  const resEl = document.getElementById('resBTU');
  if (!resEl) return;

  resEl.innerHTML = `
    <div style="font-size:1.22rem; font-weight:800; color:#0d47a1;">
      Recomendación exacta: Aire de ${equipoRecomendado}
    </div>
    <p style="margin:6px 0; font-size:0.92rem; color:#334155;">${explicacion}</p>
    <div style="font-weight:700; color:#0f766e; font-size:0.95rem; margin-bottom:4px;">
      🛠️ Instalación Certificada Cero Polvo: ${precioInstalacion} CLP
    </div>
    <div style="font-size:0.86rem; color:#15803d; background:#dcfce7; padding:6px 10px; border-radius:8px; margin:8px 0 10px;">
      💡 Con nuestro <strong>Kit Smart Wi-Fi + Vacío Digital</strong> ahorrarás aprox. <strong>${formatCLP(ahorroMensualSmart)} al mes</strong> en luz (${horas}h/día).
    </div>
    <button type="button" class="btn-primary" style="width:100%; justify-content:center; padding:0.65rem 1rem; font-size:0.9rem;"
      onclick="seleccionarPlan('${codigoServicio}', 'pro', 'Instalación ${equipoRecomendado} + Smart Pro')">
      ➕ Pasar esta Instalación (${equipoRecomendado}) al Cotizador
    </button>
  `;
}

// =========================================================================
// 5. COTIZADOR ONLINE + AGENDA DE VISITA + API / LOCALSTORAGE
// =========================================================================
function cambiarCantidadCotizador(delta) {
  const input = document.getElementById('cotCantidad');
  if (!input) return;
  const actual = parseInt(input.value, 10) || 1;
  input.value = Math.min(15, Math.max(1, actual + delta));
  actualizarCotizacion();
}

function obtenerDatosCotizacionActual() {
  const servicio = document.getElementById('cotServicio')?.value || 'mantencion';
  const cantidad = Math.max(1, parseInt(document.getElementById('cotCantidad')?.value, 10) || 1);
  let planSmart = document.getElementById('cotSmart')?.value || 'pro';
  const marca = document.getElementById('cotMarca')?.value || 'Anwo / Kendal / Midea';
  const nombre = document.getElementById('cotNombre')?.value.trim() || '';
  const telefono = document.getElementById('cotTelefono')?.value.trim() || '';
  const comuna = document.getElementById('cotComuna')?.value.trim() || '';
  const direccion = document.getElementById('cotDireccion')?.value.trim() || '';
  const fechaVisita = document.getElementById('cotFecha')?.value || '';
  const horario = document.getElementById('cotHorario')?.value || 'Mañana (09:00 a 13:00)';
  const metodoPago = document.getElementById('cotPago')?.value || 'Transferencia al finalizar';

  let subtotalServicio = 0;
  let nombreServicio = '';
  let ahorroTotal = 0;

  if (servicio === 'mantencion') {
    nombreServicio = "Mantención Profunda 'Spa del Aire' (Hidro-lavado)";
    subtotalServicio = cantidad === 1 ? 59990 : cantidad * 44990;
    if (cantidad >= 2) {
      ahorroTotal += cantidad * 15000;
    }
  } else if (servicio === 'instalacion_9_12') {
    nombreServicio = 'Instalación Certificada 9.000 - 12.000 BTU (Cero Polvo)';
    subtotalServicio = cantidad * 135000;
  } else if (servicio === 'instalacion_18_24') {
    nombreServicio = 'Instalación Certificada 18.000 - 24.000 BTU';
    subtotalServicio = cantidad * 175000;
  } else if (servicio === 'solo_smart') {
    nombreServicio = 'Modernización de Aire Antiguo a Smart Wi-Fi';
    subtotalServicio = 0;
  }

  // Si eligió "solo_smart" y puso "ninguno", cambiamos automáticamente a "pro"
  if (servicio === 'solo_smart' && planSmart === 'ninguno') {
    planSmart = 'pro';
    const selectSmart = document.getElementById('cotSmart');
    if (selectSmart) selectSmart.value = 'pro';
  }

  let costoSmartUnitario = 0;
  let nombreSmart = 'Sin Kit Smart adicional';
  const tieneDescuentoPack = servicio !== 'solo_smart';

  if (planSmart === 'basico') {
    costoSmartUnitario = tieneDescuentoPack ? 19990 : 29990;
    if (tieneDescuentoPack) ahorroTotal += 10000 * cantidad;
    nombreSmart = 'Kit Smart Básico (Control por Celular)';
  } else if (planSmart === 'pro') {
    costoSmartUnitario = tieneDescuentoPack ? 30000 : 44990;
    if (tieneDescuentoPack) ahorroTotal += 14990 * cantidad;
    nombreSmart = 'Kit Smart Clima Pro (Pantalla LED T°/Humedad + Alexa/Google)';
  } else if (planSmart === 'ahorro') {
    costoSmartUnitario = tieneDescuentoPack ? 54990 : 69990;
    if (tieneDescuentoPack) ahorroTotal += 15000 * cantidad;
    nombreSmart = 'Kit Smart Ahorro Máximo (Termostato + Medidor Luz CLP + Sensor Ventana)';
  }

  const subtotalSmart = costoSmartUnitario * cantidad;
  const totalCLP = subtotalServicio + subtotalSmart;
  const totalFormateado = formatCLP(totalCLP);

  return {
    servicioCodigo: servicio,
    servicio: nombreServicio,
    cantidad,
    marca,
    planSmartCodigo: planSmart,
    kitSmart: nombreSmart,
    nombre: nombre || 'Cliente Web',
    telefono: telefono || 'Por confirmar',
    comuna: comuna || 'Región Metropolitana / Chile',
    direccion: direccion || 'Por confirmar en contacto',
    fechaVisita: fechaVisita || 'Próxima disponible',
    horario,
    metodoPago,
    ahorroTotal,
    totalCLP,
    totalFormateado
  };
}

function armarUrlWhatsApp(datos, codigoReserva = '') {
  const waPhone = getWhatsAppNumber();
  const lineas = [
    `¡Hola ClimaSmart Chile! 👋 Quiero agendar mi servicio cotizado en la web:`,
    codigoReserva ? `• *Código de Reserva:* #${codigoReserva}` : '',
    `• *Servicio:* ${datos.servicio}`,
    `• *Equipos:* ${datos.cantidad} unidad(es) (${datos.marca})`,
    `• *Kit Smart Wi-Fi:* ${datos.kitSmart}`,
    `• *Cliente:* ${datos.nombre} (${datos.telefono})`,
    `• *Comuna / Dirección:* ${datos.comuna}${datos.direccion !== 'Por confirmar en contacto' ? ' - ' + datos.direccion : ''}`,
    `• *Fecha y Horario preferido:* ${datos.fechaVisita} (${datos.horario})`,
    `• *Medio de Pago:* ${datos.metodoPago}`,
    `• *VALOR TOTAL CERRADO:* ${datos.totalFormateado}`,
    ``,
    `¿Me confirman la hora de visita por favor?`
  ].filter(Boolean);

  return `https://wa.me/${waPhone}?text=${encodeURIComponent(lineas.join('\n'))}`;
}

function actualizarCotizacion() {
  const datos = obtenerDatosCotizacionActual();

  const totalEl = document.getElementById('cotTotalDisplay');
  const detalleEl = document.getElementById('cotDetalleDisplay');
  const descuentoEl = document.getElementById('cotDescuentoTag');
  const btnWA = document.getElementById('btnEnviarCotizacionWA');

  if (totalEl) totalEl.textContent = datos.totalFormateado;
  if (detalleEl) {
    detalleEl.innerHTML = `
      <strong>${datos.cantidad} equipo(s) ${datos.marca}</strong><br/>
      ✔️ ${datos.servicio}<br/>
      ✔️ ${datos.kitSmart}
    `;
  }

  if (descuentoEl) {
    if (datos.ahorroTotal > 0) {
      descuentoEl.style.display = 'inline-block';
      descuentoEl.textContent = `🔥 Ahorras ${formatCLP(datos.ahorroTotal)} en Pack`;
    } else {
      descuentoEl.style.display = 'none';
    }
  }

  if (btnWA) {
    btnWA.href = armarUrlWhatsApp(datos);
  }

  // Actualizar botón flotante de WhatsApp
  const btnFloat = document.getElementById('btnFloatingWA');
  if (btnFloat) {
    btnFloat.href = `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent('¡Hola ClimaSmart Chile! Quiero consultar por mantención, instalación o volver Smart mi aire acondicionado.')}`;
  }

  const footerPhone = document.getElementById('footerPhoneDisplay');
  if (footerPhone) {
    footerPhone.textContent = `+${getWhatsAppNumber()}`;
  }
}

// =========================================================================
// 6. GUARDAR RESERVA ONLINE (API BACKEND + LOCALSTORAGE)
// =========================================================================
function leerReservasLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_RESERVAS) || '[]');
  } catch (e) {
    return [];
  }
}

function guardarReservasLocal(lista) {
  localStorage.setItem(STORAGE_KEY_RESERVAS, JSON.stringify(lista));
  actualizarContadorReservas();
}

function actualizarContadorReservas() {
  const badge = document.getElementById('badgeReservasCount');
  if (!badge) return;
  const lista = leerReservasLocal();
  badge.textContent = lista.length;
}

async function sincronizarReservasServidor() {
  try {
    const res = await fetch('/api/reservas');
    if (!res.ok) return;
    const data = await res.json();
    if (data.ok && Array.isArray(data.reservas) && data.reservas.length > 0) {
      const locales = leerReservasLocal();
      const mapa = new Map();
      [...data.reservas, ...locales].forEach(item => mapa.set(item.id, item));
      guardarReservasLocal(Array.from(mapa.values()));
    }
  } catch (e) {
    // Modo estático (ej. GitHub Pages): funciona 100% con localStorage
  }
}

async function guardarReservaOnline() {
  const datos = obtenerDatosCotizacionActual();
  const idReserva = `CS-${Math.floor(100000 + Math.random() * 900000)}`;

  const nuevaReserva = {
    id: idReserva,
    fechaCreacion: new Date().toLocaleString('es-CL'),
    ...datos,
    estado: 'Reserva Confirmada Online'
  };

  // 1. Guardar en LocalStorage
  const lista = leerReservasLocal();
  lista.unshift(nuevaReserva);
  guardarReservasLocal(lista);

  // 2. Guardar también en el servidor Node.js si está activo
  try {
    await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaReserva)
    });
  } catch (e) {
    // Funciona sin servidor igualmente
  }

  mostrarToast(`🎉 Reserva #${idReserva} confirmada y guardada`);
  mostrarModalConfirmacionReserva(nuevaReserva);
}

function mostrarModalConfirmacionReserva(r) {
  const modal = document.getElementById('modalReservas');
  const titulo = document.getElementById('modalTitulo');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  const urlWA = armarUrlWhatsApp(r, r.id);

  titulo.textContent = `✅ ¡Reserva Confirmada! Código #${r.id}`;
  body.innerHTML = `
    <div style="background:#f0fdf4; border:2px solid #22c55e; border-radius:14px; padding:1.25rem; margin-bottom:1.2rem;">
      <div style="font-size:0.85rem; font-weight:800; color:#15803d;">COMPROBANTE OFICIAL CLIMASMART CHILE</div>
      <div style="font-size:1.6rem; font-weight:800; color:#0f172a; margin:4px 0;">${r.totalFormateado} <small style="font-size:0.85rem; font-weight:600; color:#475569;">(Precio fijo cerrado)</small></div>
      <p style="font-size:0.9rem; color:#166534;">Tu presupuesto y solicitud de visita han quedado registrados con garantía Cero Sorpresas.</p>
    </div>

    <div style="font-size:0.92rem; line-height:1.75; margin-bottom:1.2rem; background:#f8fafc; padding:1rem; border-radius:12px; border:1px solid #cbd5e1;">
      <div><strong>Código de Reserva:</strong> #${r.id}</div>
      <div><strong>Cliente:</strong> ${r.nombre} (${r.telefono})</div>
      <div><strong>Ubicación:</strong> ${r.comuna} — ${r.direccion}</div>
      <div><strong>Fecha y Bloque:</strong> ${r.fechaVisita} (${r.horario})</div>
      <div><strong>Servicio:</strong> ${r.servicio}</div>
      <div><strong>Equipos:</strong> ${r.cantidad} unidad(es) marca ${r.marca}</div>
      <div><strong>Kit Smart Wi-Fi:</strong> ${r.kitSmart}</div>
      <div><strong>Medio de Pago:</strong> ${r.metodoPago} (Se paga al finalizar el trabajo)</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
      <a href="${urlWA}" target="_blank" class="btn-primary" style="justify-content:center;">
        📲 Enviar Código por WhatsApp
      </a>
      <button type="button" class="btn-primary btn-book-online" onclick="imprimirComprobanteReserva('${r.id}')">
        🖨️ Imprimir / Guardar PDF
      </button>
    </div>
  `;

  modal.style.display = 'flex';
}

function abrirModalReservas() {
  const modal = document.getElementById('modalReservas');
  const titulo = document.getElementById('modalTitulo');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  const lista = leerReservasLocal();
  titulo.textContent = `📋 Mis Reservas y Presupuestos Guardados (${lista.length})`;

  if (lista.length === 0) {
    body.innerHTML = `
      <div style="text-align:center; padding:2rem 1rem; color:var(--gray-text);">
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">📭</div>
        <p>Aún no tienes reservas guardadas.</p>
        <p style="font-size:0.88rem; margin-top:4px;">Usa el Cotizador Online y haz clic en <strong>"Confirmar Reserva Online"</strong>.</p>
      </div>
    `;
  } else {
    body.innerHTML = lista.map(r => {
      const waUrl = armarUrlWhatsApp(r, r.id);
      return `
        <div class="reserva-item-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:var(--primary); font-size:1rem;">#${r.id} — ${r.totalFormateado}</strong>
            <span style="font-size:0.78rem; background:#dcfce7; color:#166534; padding:2px 8px; border-radius:99px; font-weight:700;">${r.estado || 'Confirmada'}</span>
          </div>
          <div style="font-size:0.88rem; color:#334155;">
            <div><strong>Servicio:</strong> ${r.servicio} (${r.cantidad} eq. ${r.marca})</div>
            <div><strong>Smart Wi-Fi:</strong> ${r.kitSmart}</div>
            <div><strong>Cliente / Comuna:</strong> ${r.nombre} • ${r.comuna} • ${r.fechaVisita}</div>
          </div>
          <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
            <a href="${waUrl}" target="_blank" class="btn-primary" style="padding:0.45rem 0.9rem; font-size:0.82rem;">📲 WhatsApp</a>
            <button type="button" class="btn-print-quote" style="width:auto; padding:0.45rem 0.9rem; font-size:0.82rem;" onclick="imprimirComprobanteReserva('${r.id}')">🖨️ Imprimir PDF</button>
            <button type="button" class="btn-print-quote" style="width:auto; padding:0.45rem 0.9rem; font-size:0.82rem; color:#dc2626; border-color:#fca5a5;" onclick="eliminarReserva('${r.id}')">🗑️ Eliminar</button>
          </div>
        </div>
      `;
    }).join('');
  }

  modal.style.display = 'flex';
}

function eliminarReserva(id) {
  const filtradas = leerReservasLocal().filter(r => r.id !== id);
  guardarReservasLocal(filtradas);
  abrirModalReservas();
  mostrarToast('🗑️ Reserva eliminada');
}

function cerrarModalReservas() {
  const modal = document.getElementById('modalReservas');
  if (modal) modal.style.display = 'none';
}

function cerrarModalSiFondo(e) {
  if (e.target && e.target.id === 'modalReservas') {
    cerrarModalReservas();
  }
}

// =========================================================================
// 7. IMPRESIÓN / DESCARGA DE PRESUPUESTO FORMAL EN PDF
// =========================================================================
function imprimirCotizacionActual() {
  const datos = obtenerDatosCotizacionActual();
  generarVentanaImpresion({
    id: `COT-${Math.floor(10000 + Math.random() * 90000)}`,
    fechaCreacion: new Date().toLocaleString('es-CL'),
    ...datos
  });
}

function imprimirComprobanteReserva(id) {
  const encontrada = leerReservasLocal().find(r => r.id === id);
  if (encontrada) {
    generarVentanaImpresion(encontrada);
  }
}

function generarVentanaImpresion(r) {
  const win = window.open('', '_blank', 'width=820,height=720');
  if (!win) {
    mostrarToast('⚠️ Permite las ventanas emergentes para imprimir el presupuesto');
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="es-CL">
    <head>
      <meta charset="UTF-8" />
      <title>Presupuesto ClimaSmart Chile #${r.id}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #0f172a; padding: 36px; max-width: 740px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0d47a1; padding-bottom: 16px; margin-bottom: 24px; }
        .box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 18px; background: #f8fafc; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
        th { background: #0f172a; color: white; }
        .total { font-size: 24px; font-weight: bold; color: #0d47a1; text-align: right; margin-top: 16px; }
        .footer { margin-top: 32px; font-size: 12px; color: #475569; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 style="margin:0; color:#0d47a1;">❄️ ClimaSmart Chile</h1>
          <p style="margin:4px 0 0; font-size:13px; color:#475569;">Instalación Cero Polvo • Spa del Aire • Automatización Smart Wi-Fi</p>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:bold; font-size:16px;">CÓDIGO: #${r.id}</div>
          <div style="font-size:12px; color:#475569;">Fecha: ${r.fechaCreacion || new Date().toLocaleDateString('es-CL')}</div>
        </div>
      </div>

      <div class="box">
        <strong>Datos del Cliente y Visita:</strong><br/>
        • Cliente: ${r.nombre} | Teléfono: ${r.telefono}<br/>
        • Comuna / Dirección: ${r.comuna} — ${r.direccion}<br/>
        • Fecha y Horario preferido: ${r.fechaVisita} (${r.horario})<br/>
        • Medio de Pago: ${r.metodoPago}
      </div>

      <table>
        <thead>
          <tr>
            <th>Descripción del Servicio</th>
            <th>Equipos / Marca</th>
            <th>Garantía</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${r.servicio}</strong></td>
            <td>${r.cantidad} unidad(es) (${r.marca})</td>
            <td>6 Meses por escrito</td>
          </tr>
          <tr>
            <td><strong>Apartado Smart Wi-Fi:</strong> ${r.kitSmart}</td>
            <td>Incluido para ${r.cantidad} eq.</td>
            <td>Configuración en App + Voz</td>
          </tr>
        </tbody>
      </table>

      <div class="total">TOTAL CERRADO (IVA INCLUIDO): ${r.totalFormateado}</div>

      <div class="footer">
        ClimaSmart Chile • Pago 100% al finalizar el trabajo • Garantía Cero Goteo y Cero Polvo • WhatsApp: +${getWhatsAppNumber()}
      </div>
      <script>window.onload = () => { window.print(); };</script>
    </body>
    </html>
  `);
  win.document.close();
}

// =========================================================================
// 8. FAQ INTERACTIVO Y CONFIGURACIÓN DE WHATSAPP
// =========================================================================
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.remove('open');
    const icon = el.querySelector('.faq-icon');
    if (icon) icon.textContent = '+';
  });
  if (!isOpen) {
    item.classList.add('open');
    const icon = item.querySelector('.faq-icon');
    if (icon) icon.textContent = '−';
  }
}

function abrirModalConfigWA() {
  const modal = document.getElementById('modalConfigWA');
  const input = document.getElementById('inputConfigWA');
  if (input) input.value = getWhatsAppNumber();
  if (modal) modal.style.display = 'flex';
}

function cerrarModalConfigWA() {
  const modal = document.getElementById('modalConfigWA');
  if (modal) modal.style.display = 'none';
}

function cerrarModalConfigSiFondo(e) {
  if (e.target && e.target.id === 'modalConfigWA') {
    cerrarModalConfigWA();
  }
}

function guardarConfigWA() {
  const input = document.getElementById('inputConfigWA');
  if (!input) return;
  const limpio = input.value.replace(/\D/g, '');
  if (limpio.length < 9) {
    mostrarToast('⚠️ Ingresa un número válido (ej: 56987654321)');
    return;
  }
  localStorage.setItem(STORAGE_KEY_WA, limpio);
  actualizarCotizacion();
  cerrarModalConfigWA();
  mostrarToast(`✅ WhatsApp actualizado a +${limpio}`);
}

// =========================================================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// =========================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Fecha mínima sugerida = mañana
  const inputFecha = document.getElementById('cotFecha');
  if (inputFecha) {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const yyyy = manana.getFullYear();
    const mm = String(manana.getMonth() + 1).padStart(2, '0');
    const dd = String(manana.getDate()).padStart(2, '0');
    inputFecha.value = `${yyyy}-${mm}-${dd}`;
    inputFecha.min = `${yyyy}-${mm}-${dd}`;
  }

  updatePhoneUI();
  evaluarSemaforo();
  calcularBTU();
  actualizarCotizacion();
  actualizarContadorReservas();
  sincronizarReservasServidor();
});
