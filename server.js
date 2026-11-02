const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const RESERVAS_FILE = path.join(DATA_DIR, 'reservas.json');

// Asegurar carpeta y archivo de datos para reservas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RESERVAS_FILE)) {
  fs.writeFileSync(RESERVAS_FILE, JSON.stringify([], null, 2), 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // API: Obtener reservas guardadas
  if (pathname === '/api/reservas' && req.method === 'GET') {
    try {
      const raw = fs.readFileSync(RESERVAS_FILE, 'utf8');
      const reservas = JSON.parse(raw || '[]');
      return sendJSON(res, 200, { ok: true, reservas });
    } catch (err) {
      return sendJSON(res, 500, { ok: false, error: 'Error al leer reservas' });
    }
  }

  // API: Crear nueva reserva / cotización
  if (pathname === '/api/reservas' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) req.socket.destroy();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const raw = fs.readFileSync(RESERVAS_FILE, 'utf8');
        const reservas = JSON.parse(raw || '[]');

        const nuevaReserva = {
          id: data.id || `CS-${Math.floor(100000 + Math.random() * 900000)}`,
          fechaCreacion: new Date().toISOString(),
          nombre: data.nombre || 'Cliente Web',
          telefono: data.telefono || '',
          comuna: data.comuna || '',
          direccion: data.direccion || '',
          fechaVisita: data.fechaVisita || '',
          horario: data.horario || '',
          servicio: data.servicio || '',
          cantidad: Number(data.cantidad) || 1,
          marca: data.marca || '',
          kitSmart: data.kitSmart || '',
          metodoPago: data.metodoPago || 'Por confirmar',
          totalCLP: Number(data.totalCLP) || 0,
          totalFormateado: data.totalFormateado || '',
          estado: 'Confirmada / Pendiente de Visita'
        };

        reservas.unshift(nuevaReserva);
        fs.writeFileSync(RESERVAS_FILE, JSON.stringify(reservas, null, 2), 'utf8');
        return sendJSON(res, 201, { ok: true, reserva: nuevaReserva });
      } catch (err) {
        return sendJSON(res, 400, { ok: false, error: 'Datos de reserva inválidos' });
      }
    });
    return;
  }

  // Archivos estáticos
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(ROOT_DIR, relativePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 - Acceso denegado');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Archivo no encontrado</h1><p><a href="/">Volver al inicio</a></p>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Error del servidor: ${err.code}`);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

function startServer(port) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Puerto ${port} en uso, probando puerto ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Error al iniciar el servidor:', err);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log('===========================================================');
    console.log('❄️  ClimaSmart Chile - Servidor Web + API Activo');
    console.log(`🌐 URL Local: ${url}`);
    console.log('🛑 Presiona Ctrl + C para detener el servidor');
    console.log('===========================================================');

    if (process.argv.includes('--open')) {
      const cmd = process.platform === 'win32' ? `start "" "${url}"` :
                  process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
      exec(cmd);
    }
  });
}

startServer(Number(PORT));
