'use strict'

var User = require('../models/User');
var validator = require('validator');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'DW2022';
const expiresTime = 24 * 60 * 60;

//Endpoints
let controller = {
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
    }   
}; //end controller

module.exports = controller;