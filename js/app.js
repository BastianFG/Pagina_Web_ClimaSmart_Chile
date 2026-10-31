// Lógica Interactiva 100% Operativa - ClimaSmart Chile

// 1. Simulador de Control Celular para Aire Antiguo en el Hero
let acState = {
  power: true,
  temp: 21,
  mode: 'Frío ❄️',
  saving: true
};

function updatePhoneUI() {
  const screen = document.getElementById('acScreen');
  const tempEl = document.getElementById('acTemp');
  const modeEl = document.getElementById('acMode');
  const statusEl = document.getElementById('acStatus');
  const powerBtn = document.getElementById('btnPower');

  if (!acState.power) {
    screen.classList.add('off');
    tempEl.textContent = '-- °C';
    modeEl.textContent = 'Equipo Apagado';
    statusEl.textContent = 'Consumo actual: $0 CLP/h';
    powerBtn.classList.remove('active');
    powerBtn.textContent = 'Encender';
  } else {
    screen.classList.remove('off');
    tempEl.textContent = acState.temp + ' °C';
    modeEl.textContent = 'Modo: ' + acState.mode;
    statusEl.textContent = acState.saving ? '⚡ Ahorro Nocturno Activo (-30% Luz)' : 'Conectado por Wi-Fi Casa';
    powerBtn.classList.add('active');
    powerBtn.textContent = 'Apagar';
  }
}

function togglePower() {
  acState.power = !acState.power;
  updatePhoneUI();
}

function changeTemp(delta) {
  if (!acState.power) return;
  acState.temp = Math.min(30, Math.max(16, acState.temp + delta));
  updatePhoneUI();
}

function toggleMode() {
  if (!acState.power) return;
  acState.mode = acState.mode.includes('Frío') ? 'Calor ☀️' : 'Frío ❄️';
  updatePhoneUI();
}

// 2. Calculadora de BTU en Palabras Simples
function calcularBTU() {
  const m2 = parseFloat(document.getElementById('inputM2').value) || 15;
  const sol = document.getElementById('selectSol').value;
  const piso = document.getElementById('selectEspacio').value;

  let factor = 600;
  if (sol === 'mucho') factor = 750;
  if (piso === 'living_cocina') factor += 100;

  const btuCalculado = m2 * factor;
  let equipoRecomendado = "9.000 BTU";
  let precioInstalacion = "$135.000";
  let explicacion = "Ideal para dormitorios o escritorios de hasta 18 m². Silencioso y de bajo consumo.";

  if (btuCalculado > 10500 && btuCalculado <= 14500) {
    equipoRecomendado = "12.000 BTU";
    precioInstalacion = "$135.000";
    explicacion = "El tamaño favorito en Chile para dormitorios grandes o livings medianos (hasta 25 m²).";
  } else if (btuCalculado > 14500 && btuCalculado <= 20000) {
    equipoRecomendado = "18.000 BTU";
    precioInstalacion = "$175.000";
    explicacion = "Potencia perfecta para livings amplios, comedores o departamentos con cocina integrada.";
  } else if (btuCalculado > 20000) {
    equipoRecomendado = "24.000 BTU";
    precioInstalacion = "$175.000";
    explicacion = "Alta capacidad para espacios grandes, oficinas o locales comerciales.";
  }

  document.getElementById('resBTU').innerHTML = `
    <div style="font-size:1.25rem; font-weight:800; color:#0d47a1;">Necesitas un equipo de: ${equipoRecomendado}</div>
    <p style="margin:6px 0; font-size:0.95rem;">${explicacion}</p>
    <div style="font-weight:700; color:#0f766e;">Valor Instalación Certificada Cero Polvo: ${precioInstalacion} CLP</div>
  `;
}

// 3. Cotizador Interactivo Instantáneo + Envío a WhatsApp
function actualizarCotizacion() {
  const servicio = document.getElementById('cotServicio').value;
  const cantidad = parseInt(document.getElementById('cotCantidad').value) || 1;
  const planSmart = document.getElementById('cotSmart').value;
  const comuna = document.getElementById('cotComuna').value.trim() || 'Mi Comuna';
  const marca = document.getElementById('cotMarca').value;

  let subtotalServicio = 0;
  let nombreServicio = "";

  if (servicio === 'mantencion') {
    nombreServicio = "Mantención Profunda 'Spa del Aire' (Hidro-lavado)";
    subtotalServicio = cantidad === 1 ? 59990 : cantidad * 44990;
  } else if (servicio === 'instalacion_9_12') {
    nombreServicio = "Instalación Certificada 9.000 - 12.000 BTU (Cero Polvo)";
    subtotalServicio = cantidad * 135000;
  } else if (servicio === 'instalacion_18_24') {
    nombreServicio = "Instalación Certificada 18.000 - 24.000 BTU";
    subtotalServicio = cantidad * 175000;
  } else if (servicio === 'solo_smart') {
    nombreServicio = "Modernización de Aire Antiguo a Smart Wi-Fi";
    subtotalServicio = 0;
  }

  let costoSmartUnitario = 0;
  let nombreSmart = "Sin Kit Smart adicional";
  const tieneDescuentoPack = servicio !== 'solo_smart';

  if (planSmart === 'basico') {
    costoSmartUnitario = tieneDescuentoPack ? 19990 : 29990;
    nombreSmart = "Kit Smart Básico (Control por Celular)";
  } else if (planSmart === 'pro') {
    costoSmartUnitario = tieneDescuentoPack ? 30000 : 44990;
    nombreSmart = "Kit Smart Clima Pro (Pantalla T°/Humedad + Alexa/Google)";
  } else if (planSmart === 'ahorro') {
    costoSmartUnitario = tieneDescuentoPack ? 54990 : 69990;
    nombreSmart = "Kit Smart Ahorro Máximo (Termostato + Medidor Luz CLP + Sensor Ventana)";
  }

  // Si eligió "solo_smart" y dejó "ninguno", forzamos el Pro por defecto
  if (servicio === 'solo_smart' && planSmart === 'ninguno') {
    costoSmartUnitario = 44990;
    nombreSmart = "Kit Smart Clima Pro (Pantalla T°/Humedad + Alexa/Google)";
  }

  const subtotalSmart = costoSmartUnitario * cantidad;
  const totalCLP = subtotalServicio + subtotalSmart;

  const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalCLP);

  document.getElementById('cotTotalDisplay').textContent = formatoCLP;
  document.getElementById('cotDetalleDisplay').textContent = `${cantidad} equipo(s) ${marca} | ${nombreServicio} + ${nombreSmart}`;

  // Armar link de WhatsApp
  const mensajeWA = `¡Hola ClimaSmart Chile! 👋 Hice mi cotización en la web:%0A` +
    `• *Servicio:* ${nombreServicio}%0A` +
    `• *Cantidad de equipos:* ${cantidad} (${marca})%0A` +
    `• *Apartado Smart Wi-Fi:* ${nombreSmart}%0A` +
    `• *Comuna:* ${comuna}%0A` +
    `• *Total Estimado Todo Incluido:* ${formatoCLP}%0A%0A` +
    `¿Tienen disponibilidad para agendar visita?`;

  const btnWA = document.getElementById('btnEnviarCotizacionWA');
  btnWA.href = `https://wa.me/56912345678?text=${mensajeWA}`;
}

window.addEventListener('DOMContentLoaded', () => {
  updatePhoneUI();
  calcularBTU();
  actualizarCotizacion();
});
