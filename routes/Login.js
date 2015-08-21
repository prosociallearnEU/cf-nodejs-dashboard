/*jslint node: true*/
"use strict";

var config = require('../config.json');
var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
CloudFoundry = new CloudFoundry(config.CF_API_URL);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

exports.login = function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    var token_endpoint = null;

    CloudFoundry.getInfo().then(function (result) {
        token_endpoint = result.token_endpoint;
        return CloudFoundry.login(token_endpoint, config.username, config.password);
    }).then(function (result) {
        res.json({ "auth_token" : result.token_type + " " + result.access_token});
    }).catch(function (reason) {
        res.json({"error": reason});
    });

};
