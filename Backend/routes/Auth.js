'use strict'

var express = require('express');
var AuthController = require('../controllers/Auth');
var router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *      Auth:
 *          type: object
 *          properties:
 *              rut:
 *                  type: string
 *                  description: the user Rut
 *              password:
 *                  type: string
 *                  description: the user password
 *          required: 
 *              - rut        
 *              - password
 *          example:
 *              rut         : 9876543-2
 *              password    : "#$Cr$ct3%"
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *  post:
 *      summary: Start Session
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/Auth'
 *      responses:
 *          200:
 *              description: { "status": "OK","accessToken": "eyJhbGciOiJIUzI1NiIsInR..."}
 */



//rutas Productivas
router.post('/login', AuthController.login);

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