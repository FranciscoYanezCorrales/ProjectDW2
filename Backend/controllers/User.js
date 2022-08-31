'use strict'

const RegistroCivil = require('../third-party/RegistroCivil');
var fs = require('fs'); //FileSystem
var path = require('path');
var User = require('../models/User');
var validator = require('validator');
const ServelServices = require('../third-party/ServelServices');
const { ConnectionStates } = require('mongoose');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'DW2022';
const expiresTime = 24 * 60 * 60;

let controller = {

    test: (req, res) => {
        return res.status(200).send({
            message : 'Soy la accion test de mi controlador de articulos'
        });
    },
    createUser: async (req, res) => {
        //Crear Usuario
        //recoger Params:
        let Params = req.body;
        
        try{
            //Validar Datos:
            let val_birthday    = !validator.isEmpty(Params.birthday);
            let val_serie       = !validator.isEmpty(Params.nro_serie);
            let val_rut         = !validator.isEmpty(Params.rut);
            let val_password = !validator.isEmpty(Params.password);
            
            if(val_birthday && val_rut && val_password && val_serie){
                
                //Valida cedula:
                let validacion_cedula = new RegistroCivil();
                let consulta_cedula = await validacion_cedula.showData(Params.rut, Params.nro_serie);
                if(consulta_cedula.status == false){
                    console.log(consulta_cedula.status)
                    return res.status(400).send(consulta_cedula);
                }
                
                if(consulta_cedula.result.Err !== 0 || consulta_cedula.result.Verificacion == 'N'){
                    return res.status(400).send({
                        status  : 'NOK',
                        message : 'Cedula no valida'
                    });
                }
                
                //Instanciar Python Servel para obtener el nombre:
                let servel_instance = new ServelServices('.\\third-party\\servel_services\\', '.\\third-party\\servel_services\\Scripts\\');
                let consulta_servel = servel_instance.getData(Params.rut);
                console.log(consulta_servel);
                
                //Crear del Schema/modelo:
                let new_user = new User();
                
                new_user.name        = consulta_servel.nombre;
                new_user.birthday    = Params.birthday;
                new_user.rut         = Params.rut;
                new_user.institution = Params.rut;
                //encriptacion:
                var salt             = bcrypt.genSaltSync(10);
                var hashPassword     = bcrypt.hashSync(Params.password, salt);
                new_user.password    = hashPassword;

                //Guardar Articulo:
                new_user.save((err, userCreated) => {
                    if(err || !userCreated){
                        if(err.code == 11000){
                            return res.status(403).send({
                                status  : 'NOK',
                                message : 'El usuario ' + Params.rut + ' ya se encuentra registrado.'
                            }); 
                        }
                        
                        return res.status(403).send({
                            status  : 'NOK',
                            message : 'El usuario no se ha guardado.'
                        });
                    }
                    //devolver respuesta:
                    return res.status(200).send({
                        status  : 'OK',
                        article : userCreated
                    });

                });
            }else{
                return res.status(400).send({
                    status  : 'NOK',
                    message : 'Validacion incorrecta'
                });
            }
        }catch(err){
            console.log(err);
            return res.status(400).send({
                status  : 'NOK',
                message : 'Faltan Campos'
            });
        }

    },
    login: (req, res) => {
        let Params = req.body;
        let val_rut = !validator.isEmpty(Params.rut);
        let val_password = !validator.isEmpty(Params.password);
        if(val_rut && val_password){
            const credentials = {
                rut: Params.rut
            }
            User.findOne(credentials).exec((err, user) =>{
                
                if (err){
                    return res.status(500).send({
                        status : 'NOK',
                        message : 'Error en Motor BD'
                    });
                }

                if (!user){
                    return res.status(403).send({
                        status : 'NOK',
                        message : 'Credenciales incorrectas'
                    });
                }
                
                //Validamos password:
                let hash = user.password;
                let isValidPass = bcrypt.compareSync(Params.password, hash); 
                if(isValidPass){
                    //pass correct:
                    const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, {expiresIn: expiresTime})
                    return res.status(200).send({
                        status  : 'OK',
                        accessToken : accessToken
                    });
                }else{
                    return res.status(409).send({
                        status  : 'OK',
                        message : 'Credenciales incorrectas'
                    });
                }
            });
        }else{
            return res.status(400).send({
                status  : 'NOK',
                message : 'Faltan campos'
            });
        }
    },

    getArticles: (req, res) => {

        var query = User.find({});

        var last = req.params.last;
        console.log(last);
        if(last || last != undefined ){
            query.limit(2);
        }
        // buscar:
        query.sort('-_id').exec((err, articles) =>{
            if (err){
                return res.status(500).send({
                    status  : 'NOK',
                    message : 'Error al consultar coleccion'
                }); 
            }

            if(!articles){
                return res.status(404).send({
                    status  : 'NOK',
                    message : 'No hay Articulos'
                });
            }

            return res.status(200).send({
                status : 'OK',
                articles
            });
        });
        
    },

    getArticle: (req, res) => {

        //recoger id:
        var id = req.params.id
        //comprobar que existe:
        if(id || id != undefined ){
            //buscar el articulo:
            User.findById(id,(err, articulo)=>{
                // Devolverlo en un json:
                if (err){
                    return res.status(500).send({
                        status : 'NOK',
                        message : 'Error en Motor'
                    });
                }
                if (!articulo){
                    return res.status(404).send({
                        status : 'NOK',
                        message : 'Articulo no encontrado'
                    });
                }
                return res.status(200).send({
                    status : 'OK',
                    articulo
                });
            });
        }else{
            return res.status(400).send({
                status : 'NOK',
                message : 'falta id de articulo'
            });
        }
        
    },

    updateArticle: (req, res) => {
        // Recoger id
        var articleId = req.params.id;

        // Recoger los datos que llegan por put:
        var params = req.body;

        // Validar datos:
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            if (validate_content && validate_title){
                User.findByIdAndUpdate({_id : articleId}, params, {new:true}, (err, articleUpdated)=> {
                    if (err){
                        return res.status(500).send({
                            status : 'NOK',
                            message : 'Error al Actualizar'
                        });
                    }

                    if(!articleUpdated){
                        return res.status(400).send({
                            status : 'NOK',
                            message : 'No existe el Articulo'
                        });
                    }
                    
                    return res.status(200).send({
                        status : 'OK',
                        articleUpdated
                    });

                })
            }else{
                return res.status(400).send({
                    status : 'NOK',
                    message : 'Tiene campos Vacios'
                });
            }
        }catch(err){
            return res.status(400).send({
                status : 'NOK',
                message : 'falta campos de articulo'
            });
        }
    },
    deleteArticle: (req, res) => {
        var articleId = req.params.id;
        try{
            User.findOneAndDelete({_id : articleId}, (err, articleRemoved)=> {
                if(err){
                    return res.status(500).send({
                        status : 'NOK',
                        message : 'Error al borrar'
                    });
                }

                if(!articleRemoved){
                    return res.status(400).send({
                        status : 'NOK',
                        message : 'No existe el Articulo'
                    });
                }

                return res.status(200).send({
                    status : 'OK',
                    articleRemoved
                });

            });
        }catch(err){
            return res.status(400).send({
                status : 'NOK',
                message : 'falta campos de articulo'
            });
        }
    },
    upload: (req, res) => {
        var articleId = req.params.id;
        // Recoger el fichero de la peticion
        var file_name = 'Imagen no subida';
        //console.log(req.files.file0);
        if (!req.files.file0){
            return res.status(400).send({
                status : 'NOK',
                message : file_name
            });
        }

        //conseguir nombre y extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var file_extension = file_name.split('\.')[1];

        //comprobar extension (solo images):
        const ext_allowed = ['png', 'jpg', 'jpeg', 'gif'];
        if (!ext_allowed.includes(file_extension)){
            //borrar archivo subido
            fs.unlink(file_path, (err)=>{
                
                return res.status(400).send({
                    status : 'NOK',
                    message : 'Imagen no valida'
                });
            });

        }else{
            //Buscar Articulo, asignar imagen, y actualizar:
            User.findOneAndUpdate({_id : articleId}, {image : file_name}, {new:true}, (err, articleUpdated)=>{
                if (err){
                    return res.status(500).send({
                        status : 'NOK',
                        message : 'Error al Actualizar'
                    });
                }

                if(!articleUpdated){
                    return res.status(400).send({
                        status : 'NOK',
                        message : 'No existe el Articulo'
                    });
                }
                
                return res.status(200).send({
                    status : 'OK',
                    articleUpdated
                });
            });
        }
    },
    getImageArticle: (req, res) => {

        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        if(fs.existsSync(path_file)){
            return res.sendFile(path.resolve(path_file));
        }else{
            return res.status(400).send({
                status : 'NOK',
                message : 'Imagen no existe'
            });
        }
    },

    searchArticle: (req, res) => {
        var searchString = req.params.search;

        User.find({ "$or" : 
            [
                { "title" : { "$regex" : searchString, "$options": "i" }},
                { "content" : { "$regex" : searchString, "$options": "i" }}
            ]
        }).sort([['date', 'descending']])
        .exec((err, articulos)=>{
            if(err){
                return res.status(500).send({
                    status : 'NOK',
                    message : 'Error al borrar'
                });
            }

            if(!articulos || articulos.length <= 0){
                return res.status(400).send({
                    status : 'NOK',
                    message : 'No se encontraron articulos con: '+ searchString
                });
            }

            return res.status(200).send({
                status : 'OK',
                articulos
            });
        });
    }
    
        
}; //end controller

module.exports = controller;