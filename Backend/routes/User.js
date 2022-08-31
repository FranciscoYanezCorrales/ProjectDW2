'use strict'

var express = require('express');
var UserController = require('../controllers/User');
var router = express.Router();

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir : './upload/articles'});


//rutas de prueba
router.get('/test-de-controlador', UserController.test);
/** 
 * @swagger
 * components:
 *  responses:
 *      UnauthorizedError:
 *          description: Access token is missing or invalid
 */


/**
 * @swagger
 * components:
 *  securitySchemes:
 *      BearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  security:
 *      - bearerAuth: []
 *  schemas:
 *      User:
 *          type: object
 *          properties:
 *              rut:
 *                  type: string
 *                  description: the user name
 *              password:
 *                  type: string
 *                  description: the user password
 *              nro_serie:
 *                  type: string
 *                  description: Nro de serie cedula
 *              birthday:
 *                  type: string
 *                  description: YYYY-MM-DD
 *          required:
 *              - birthday   
 *              - rut        
 *              - password
 *              - nro_serie
 *          example:
 *              rut         : 9876543-2
 *              password    : "#$Cr$ct3%"
 *              nro_serie   : "521865366"
 *              birthday    : 1997-10-01
 */

/**
 * @swagger
 * /api/v1/user/create:
 *  post:
 *      summary: create a new user
 *      tags: [User]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          200:
 *              description: Object.
 *          401:
 *              $ref: '#/components/responses/UnauthorizedError'
 */



//rutas Productivas
router.post('/create', UserController.createUser);

//templates:
/*
router.get('/get-articles/:last?', UserController.getArticles);
router.get('/get-article/:id', UserController.getArticle);
router.put('/update-article/:id', UserController.updateArticle);
router.delete('/delete-article/:id', UserController.deleteArticle);
router.post('/upload-image/:id', md_upload, UserController.upload);
router.get('/get-image/:image', UserController.getImageArticle);
router.get('/search/:search', UserController.searchArticle);
*/

module.exports = router;