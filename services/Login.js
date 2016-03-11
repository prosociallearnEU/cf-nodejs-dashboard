/*jslint node: true*/
"use strict";

var CloudController = require("cf-nodejs-client").CloudController;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
CloudController = new CloudController();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();

function Login() {
    return undefined;
}

Login.prototype.auth = function (endpoint, username, password) {
    CloudController.setEndPoint(endpoint);

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    return new Promise(function (resolve, reject) {

        try {

            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(username, password);
            }).then(function (result) {
                console.log(result);
                token_type = result.token_type;
                access_token = result.access_token;
                return resolve("{ \"auth_token\" :" + token_type + "\" " + access_token + "}");
            }).catch(function (reason) {
                return reject(reason);
            });

        } catch (error) {
            console.log(error);
            return reject(error);
        }

    });
};

module.exports = Login;