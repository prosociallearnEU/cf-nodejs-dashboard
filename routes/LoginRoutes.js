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
    router.use(bodyParser.urlencoded({extended: false}));

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

        console.log("GET /auth/login");

        res.render('login/login.jade');
    });

    router.post('/login', function (req, res) {

        console.log("POST /login");

        var endpoint = req.body.endpoint;
        var username = req.body.username;
        var password = req.body.password;

        console.log("CC Endpoint: " + endpoint);
        console.log("Username: " + username);
        console.log("Password: " + password);

        var back = {
            path:"/auth/",
            text:"Login"
        }

        Login.auth(endpoint, username, password).then(function (result) {
            console.log("Authentication process: Success");
            //console.log(result);
            var cookieValue = {
                endpoint: endpoint,
                username: username,
                password: password
            };
            res.cookie(cookieName, JSON.stringify(cookieValue), {expires: 0, httpOnly: true});
            
            console.log("Redirect to /home")
            res.redirect('/home');
        }).catch(function (reason) {

            //Parse output to detect "unauthorized" case        
            try{
                var result = JSON.parse(reason);
                if(result.error === "unauthorized"){
                    res.render('global/globalError', {pageData: {error: result.error, back:back}});
                }else {
                    res.render('global/globalError', {pageData: {error: result, back:back}});
                }
            //Endpoint case
            }catch (error) {             
                res.render('global/globalError', {pageData: {error: reason, back:back}});
            }

        //Others
        }).catch(function (reason) {
            res.render('global/globalError', {pageData: {error: reason, back:back}});
        });
    });

    router.get('/logout', nocache, function (req, res) {

        console.log("GET /logout");

        res.clearCookie(cookieName);
        res.redirect('/auth');
    });

    return router;
};


