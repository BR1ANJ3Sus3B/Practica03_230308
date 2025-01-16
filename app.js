const express = require('express');
const session = require('express-session');


const app = express();


//Configuración de la sesión
app.use(session({
    secret: 'mi-clave-secreta', //Secreto para firmar la cookie de sesión
    resave:false,  //No resguardar la sesión si no ha sido modificada
    saveUninitialized:false,  //Guardar la sesión aunque no haya sido inicializada
    cookie:{secure:false}  //Usar secure:true solo si usas HTTPS
}));

//Midelware para mostrar detalles de la sesion
app.use((req,res, next)=>{
    if(req.session){
        if(!req.session.createdAt){
            req.session.createdAt=new Date(); //Asignamos la fecha de la creación de la sesión
        }
        req.session.lastAccess=new Date(); //Asignamos la última vez que se accedió a la sesión
    }
    next();
});


//Ruta para mostrar la información de la sesión
app.get('/session',(req,res)=>{
    if(req.session){
        const sessionId = req.session.id;
        const createdAt = req.session.createdAt;
        const lastAccess = req.session.lastAccess;
        const sessionDuration = (new Date() - createdAt)/1000; //Duración de la sesión en segundos
        
        res.send(`
            <h1>Detalles de la sesion</h1>
            <p><strong>ID de sesión:</strong>${sessionId}</p>
            <p><strong>Fecha de creación de la sesión:</strong>${createdAt}</p>
            <p><strong>último acceso:</strong>${lastAccess}</p>
            <p><strong>Duración de la sesión (en segundos):</strong>${sessionDuration}</p>
            `);
    }else{
        
    }
})



//Ruta para cerrar la sesión
app.get('/logout',(req,res)=>{
    res.session.destroy((err)=>{
        if(err){
            return res.send('Error al cerrar sesion.');
        }
        res.send('<h1>Sesión cerrada exitosamente.</h1>');
    });
});

//Iniciar el servidor en el puerto 3000
app.listen(3000,()=>{
    console.log('Servidor corriendo en el puerto 3000');
});