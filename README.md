# ❄️ ClimaSmart Chile — Sitio Web Interactivo

Sitio web 100% funcional para **ClimaSmart Chile**: Instalación Certificada Cero Polvo, Mantención Profunda "Spa del Aire" (Hidro-lavado con carpa impermeable) y Modernización de Aires Acondicionados Antiguos a Smart Wi-Fi + Alexa/Google.

🌐 **Demo en vivo (GitHub Pages):** https://bastianfg.github.io/Pagina_Web_ClimaSmart_Chile/

## 🚀 Cómo ejecutar con NPM

1. Abre una terminal en la carpeta del proyecto.
2. Inicia el servidor local + API de reservas:
   ```bash
   npm start
   ```
   *(Disponible en `http://localhost:3000`)*
3. O ejecútalo abriendo automáticamente el navegador:
   ```bash
   npm run dev
   ```

## ✨ Funcionalidades 100% Operativas

- **📱 Simulador Interactivo de App Smart Wi-Fi**: Prueba en vivo encendido/apagado, control de temperatura (16°C–30°C), modos (Frío, Calor, Antihumedad), Ahorro Nocturno (-30% luz), medidor de consumo en `$ CLP/h` y comandos de voz simulados de Alexa / Google.
- **🚦 Diagnóstico Interactivo "Semáforo de Salud"**: Evalúa el estado higiénico y energético del equipo en 15 segundos (Verde, Amarillo o Rojo) y carga la solución recomendada en el cotizador.
- **📏 Calculadora Simple de BTU + Ahorro Mensual**: Calcula la capacidad ideal (`9.000`, `12.000`, `18.000` o `24.000 BTU`) según metros cuadrados, orientación solar y tipo de espacio, conectada directamente con el cotizador.
- **💬 Cotizador Online + Agenda de Visita + Presupuesto PDF**:
  - Selección directa desde todas las tarjetas de planes y packs.
  - Registro de reservas con código único (`#CS-XXXXXX`) guardado tanto en la API local (`/api/reservas`) como en `localStorage`.
  - Generador de comprobante y presupuesto formal imprimible / descargable en PDF.
  - Envío directo con mensaje estructurado a WhatsApp.
- **⚙️ Configurador de WhatsApp Integrado**: Permite actualizar el número de WhatsApp receptor directamente desde el pie de página del sitio web.
