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

//Views
app.use(express.static('public'));
app.use('/assets', express.static(__dirname + 'public/assets'));
app.set('views', "./public/views");
app.set('view engine', 'ejs');
//index
app.get('',(req,res)=>{
    res.render('index')
})

// Cargar ficheros/rutas
let document_routes = require('./routes/Document');
let user_routes = require('./routes/User');
/*let documenttype_routes = require('./routes/DocumentType');
let user_routes = require('./routes/User');
let role_routes = require('./routes/Role');
*/
// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));
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
app.use('/api/v1/document', document_routes);
app.use('/api/v1/user', user_routes);

// Exportar Modulo (fichero actual)
module.exports = app;