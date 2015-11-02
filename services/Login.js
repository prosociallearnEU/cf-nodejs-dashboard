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
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;
            return CloudFoundry.login(authorization_endpoint, username, password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;             
            return resolve("{ \"auth_token\" :" +  token_type + "\" " + access_token + "}");
        }).catch(function (reason) {
            return reject(reason);
        });

    });
};

module.exports = Login;