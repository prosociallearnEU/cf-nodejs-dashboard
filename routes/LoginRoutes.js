/*jslint node: true*/
"use strict"

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Routes
var Login = require('../services/Login');
Login = new Login();

module.exports = function (express) {

    var router = express.Router();
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({extended: false}));// parse application/x-www-form-urlencoded

    var cookieName = "psl_session";
    //TODO: Move to config file
    var cookieSecret = "secret";
    router.use(cookieParser(cookieSecret));

    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }

    router.get('/', nocache, function (req, res) {
        res.render('login/login.jade');
    });

    router.post('/login', nocache, function (req, res) {

        console.log("POST Login");

        var endpoint = req.body.endpoint;
        var username = req.body.username;
        var password = req.body.password;

        console.log(endpoint);
        console.log(username);
        console.log(password);

        Login.auth(endpoint, username, password).then(function (result) {
            console.log(result);
            var cookieValue = {
                endpoint: endpoint,
                username: username,
                password: password
            };
            res.cookie(cookieName, JSON.stringify(cookieValue), {expires: 0, httpOnly: true});
            res.redirect('/home');
        }).catch(function (reason) {
            console.log(reason);
            res.redirect('/auth/loginError');
        });

    });

    router.get('/loginError', nocache, function (req, res) {
        res.render('login/loginError.jade');
    });

    router.get('/logout', nocache, function (req, res) {
        res.clearCookie(cookieName);
        res.redirect('/auth');
    });

    return router;
};


