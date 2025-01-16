const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'p3-BJMM#Trito-sesionpersepersistente',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    if (req.session) {
        if (!req.session.createdAt) {
            req.session.createdAt = new Date();
        }
        req.session.lastAccess = new Date();
    }
    next();
});

app.get('/login/:User', (req, res) => {
    req.session.User = req.params.User;
    res.send("Usuario guardado");
});

app.get('/session', (req, res) => {
    if (req.session) {
        const User = req.session.User;
        const sessionId = req.session.id;
        const createdAt = req.session.createdAt;
        const lastAccess = req.session.lastAccess;
        const sessionDuration = (new Date() - new Date(createdAt)) / 1000;

        console.log(`La duración de la sesión es de ${sessionDuration} segundos.`);
        
        res.send(`
            <h1>Detalles de la sesión</h1>
            <p><strong>Usuario:</strong> ${User}</p>
            <p><strong>ID de sesión:</strong> ${sessionId}</p>
            <p><strong>Fecha de creación de la sesión:</strong> ${createdAt}</p>
            <p><strong>Último acceso:</strong> ${lastAccess}</p>
            <p><strong>Duración de la sesión (en segundos):</strong> ${sessionDuration}</p>
        `);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error al cerrar sesión.');
        }
        res.send('<h1>Sesión cerrada exitosamente.</h1>');
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
