const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');

const app = express();

// Configuración de la sesión
app.use(session({
    secret: 'P3-BJMM#Tigrito-sessionesperpectivas',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

// Encabezado y contenido principal
const layout = (content) => `
    <body style="font-family: Arial, sans-serif; background-color:rgb(16, 220, 231); color: #333; margin: 0;">
        <header style="background-color: #333; color: white; padding: 10px 20px; text-align: center;">
            <h1>Gestión de Sesiones</h1>
        </header>
        <main style="padding: 20px; text-align: center;">
            ${content}
        </main>
    </body>
`;

// Middleware para registrar sesión
app.use((req, res, next) => {
    if (req.session) {
        // Si no existe la propiedad 'createAt', la inicializamos con la fecha actual
        if (!req.session.createAt) {
            req.session.createAt = new Date().toISOString();
        }
        // Actualizamos la propiedad 'lastAccess' con la fecha del último acceso
        req.session.lastAccess = new Date().toISOString();
    }
    next();
});

// Ruta: Información de la sesión
app.get('/session', (req, res) => {
    // Verificamos si hay una sesión activa
    if (req.session && req.session.isLoggedIn) {
        const sessionId = req.session.id;
        const createAt = new Date(req.session.createAt);
        const lastAccess = new Date(req.session.lastAccess);
        const sessionDuration = Math.floor((new Date() - createAt) / 1000); // Duración en segundos

        res.send(layout(`
            <h2>Detalles de la Sesión</h2>
            <p><strong>ID de la Sesión:</strong> ${sessionId}</p>
            <p><strong>Creación:</strong> ${createAt}</p>
            <p><strong>Último Acceso:</strong> ${lastAccess}</p>
            <p><strong>Duración:</strong> ${sessionDuration} segundos</p>
            <a href="/status">Estado de la Sesión</a><br><br>
            <a href="/logout" style="color: red;">Cerrar Sesión</a>
        `));
    } else {
        res.send(layout(`<h2>No hay sesión activa</h2>`)); // Mensaje si no hay sesión activa
    }
});

// Ruta: Cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            // Error al cerrar sesión
            res.send(layout(`<h2 style="color: red;">Error al cerrar sesión</h2>`));
        } else {
            // Mensaje de éxito al cerrar sesión
            res.send(layout(`<h2 style="color: green;">Sesión cerrada exitosamente</h2>`));
        }
    });
});

// Ruta: Iniciar sesión
app.get('/login/:user/:psswd', (req, res) => {
    const usr = req.params.user;
    const pswd = req.params.psswd;

    // Verificamos si no hay sesión activa
    if (!req.session.isLoggedIn) {
        req.session.usr = usr;
        req.session.pswd = pswd;
        req.session.isLoggedIn = true;
        req.session.createAt = new Date().toISOString();

        res.send(layout(`
            <h2>Bienvenido(a), ${usr}</h2>
            <p>Has iniciado sesión exitosamente</p>
            <a href="/session">Ver Sesión Activa</a>
        `));
    } else {
        res.send(layout(`
            <h2>Hola, ${usr}</h2>
            <p>Ya has iniciado sesión anteriormente</p>
            <a href="/session">Ver Sesión Activa</a>
        `));
    }
});

// Ruta: Estado de sesión
app.get('/status', (req, res) => {
    // Verificamos si la sesión está activa
    if (req.session.isLoggedIn) {
        const now = new Date();
        const started = new Date(req.session.createAt);
        const lastUpdate = new Date(req.session.lastAccess);

        // Calculamos el tiempo que ha pasado desde el inicio de la sesión
        const sessionAgeMs = now - started;
        const hours = Math.floor(sessionAgeMs / (1000 * 60 * 60)); // Horas
        const minutes = Math.floor((sessionAgeMs % (1000 * 60 * 60)) / (1000 * 60)); // Minutos
        const seconds = Math.floor((sessionAgeMs % (1000 * 60)) / 1000); // Segundos

        // Formateamos las fechas en la zona horaria de Ciudad de México
        const createAt_CDMX = moment(started).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        const lastAccess_CDMX = moment(lastUpdate).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

        res.json({
            mensaje: 'Estado de la sesión',
            sessionId: req.sessionID,
            inicio: createAt_CDMX,
            ultimoAcceso: lastAccess_CDMX,
            antiguedad: `${hours} horas, ${minutes} minutos y ${seconds} segundos`, // Duración de la sesión
        });
    } else {
        res.send(layout(`<h2>No hay sesión activa</h2>`)); // Mensaje si no hay sesión activa
    }
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
