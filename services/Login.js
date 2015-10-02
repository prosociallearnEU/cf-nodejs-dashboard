/*jslint node: true*/
/*globals Promise:true*/
"use strict";

var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
CloudFoundry = new CloudFoundry();

function Login() {
    return undefined;
}

Login.prototype.auth = function (endpoint, username, password) {

    CloudFoundry.setEndPoint(endpoint);

    var token_endpoint = null;

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            return CloudFoundry.login(token_endpoint, username, password);
        }).then(function (result) {
            return resolve("{ \"auth_token\" :" +  result.token_type + "\" " + result.access_token + "}");
        }).catch(function (reason) {
            return reject(reason);
        });

    });
};

module.exports = Login;