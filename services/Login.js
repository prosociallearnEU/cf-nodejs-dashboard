/*jslint node: true*/

var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
CloudFoundry = new CloudFoundry();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();

function Login() {
    "use strict";
    return undefined;
}

Login.prototype.auth = function (endpoint, username, password) {
    "use strict";
    CloudFoundry.setEndPoint(endpoint);

    //var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                //token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(username, password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return resolve("{ \"auth_token\" :" + token_type + "\" " + access_token + "}");
            }).catch(function (reason) {
                return reject(reason);
            });

        } catch (error) {
            return reject(error);
        }

    });
};

module.exports = Login;