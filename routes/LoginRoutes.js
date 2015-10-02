/*jslint node: true*/
"use strict";

var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');

//Routes
var Login = require('../services/Login');
Login = new Login();
//var Apps = require('./Apps');


module.exports = function (express) {

    var router = express.Router();
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded

    var cookieName = "psl_session";
    var cookieSecret = "secret";//TODO: Move to config file
    router.use(cookieParser(cookieSecret));

    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }

    router.get('/', nocache, function (req, res) {
        res.redirect('/auth');
    });

    router.get('/auth', nocache, function (req, res) {
        res.render('login');
    });

    router.post('/auth/login', nocache, function (req, res) {

        console.log("POST Login");

        var endpoint = req.body.endpoint;
        var username = req.body.username;
        var password = req.body.password;

        console.log(endpoint);
        console.log(username);
        console.log(password);

        Login.auth(endpoint,username,password).then(function (result) {
            console.log(result);
            var cookieValue = {
                "endpoint" : endpoint,
                "username" : username,
                "password" : password
            }
            res.cookie(cookieName, JSON.stringify(cookieValue), { expires: 0, httpOnly: true});
            res.redirect('/home');
        }).catch(function (reason) {
            console.log(reason);
            res.redirect('/auth/loginError');
        });

    });

    router.get('/auth/loginError', nocache, function (req, res) {
        res.render('loginError');
    });

    router.get('/auth/logout', nocache, function (req, res) {
        res.clearCookie(cookieName);
        res.redirect('/auth');
    });

    router.get('/home', nocache, function (req, res) {

        if(req.signedCookies['psl_session']){
            console.log(req.signedCookies.psl_session);
        }

        if(req.cookies.psl_session){
            console.log(req.cookies.psl_session);
        }

        res.render('home');
    });

    return router;
};


