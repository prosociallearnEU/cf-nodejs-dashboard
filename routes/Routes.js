/*jslint node: true*/
"use strict";

var bodyParser = require('body-parser');

//Routes
var Login = require('./Login');
var Apps = require('./Apps');

module.exports = function (express) {

    var router = express.Router();
    router.use(bodyParser.json());

    router.post('/auth/login', Login.login);
    router.get('/apps', Apps.getApps);
    router.get('/apps/:guid/view', Apps.view);
    router.post('/apps/create', Apps.create);
    router.post('/apps/upgrade', Apps.upgrade);

    return router;
};


