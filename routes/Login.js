/*jslint node: true*/
"use strict";

var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
CloudFoundry = new CloudFoundry();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

exports.login = function (req, res) {

    console.log("POST Login");

    var endpoint = req.body.endpoint;
    var username = req.body.username;
    var password = req.body.password;

    console.log(endpoint);
    console.log(username);
    console.log(password);

    CloudFoundry.setEndPoint(endpoint);

    var token_endpoint = null;

    CloudFoundry.getInfo().then(function (result) {
        token_endpoint = result.token_endpoint;
        return CloudFoundry.login(token_endpoint, username, password);
    }).then(function (result) {
        res.json({ "auth_token" : result.token_type + " " + result.access_token});
    }).catch(function (reason) {
        res.json({"error": reason});
    });

};
