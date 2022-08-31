'use strict'

// Cargar Modulos de Node para crear Servidor
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//documentacion SWAGGER:
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerSpec = {
    definition : {
        openapi : "3.0.0",
        info: {
            title : "Node MongoDB API",
            version : "1.0"
        },
        servers : [
            {
                url: "http://localhost:3900"
            }
        ]
    },
    apis: [`${path.join(__dirname, "./routes/*.js")}`]
}

// Ejecutar Express (http)
var app = express();

// Cargar ficheros/rutas
let user_routes = require('./routes/User');
let auth_router = require('./routes/Auth');
/*let documenttype_routes = require('./routes/DocumentType');
let role_routes = require('./routes/Role');
let document_routes = require('./routes/Document');
*/

// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Añadir prefijos a rutas
app.use('/api/v1/user', user_routes);
app.use('/api/v1/auth', auth_router);
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));

// Exportar Modulo (fichero actual)
module.exports = app;