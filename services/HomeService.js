/*jslint node: true*/

var fs = require('fs');
var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
var CloudFoundryOrgs = require("cf-nodejs-client").Organizations;
var CloudFoundryOrgQuota = require("cf-nodejs-client").OrganizationsQuota;
var CloudFoundrySpaces = require("cf-nodejs-client").Spaces;
CloudFoundry = new CloudFoundry();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();
CloudFoundryOrgs = new CloudFoundryOrgs();
CloudFoundryOrgQuota = new CloudFoundryOrgQuota();
CloudFoundrySpaces = new CloudFoundrySpaces();

function HomeServices(_CF_API_URL, _username, _password) {
    "use strict";
    this.CF_API_URL = _CF_API_URL;
    this.username = _username;
    this.password = _password;
}

HomeServices.prototype.setEndpoint = function (endpoint) {
    "use strict";
    this.CF_API_URL = endpoint;
};

HomeServices.prototype.setCredential = function (username, password) {
    "use strict";
    this.username = username;
    this.password = password;
};

HomeServices.prototype.getOrganizations = function () {
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;
    var app_guid = null;
    var space_guid = null;


    var self = this;
    var results = null;
    var org_guid = null;
    var quota_guid = null;
    var organizations = null;
    var orgMemory = null;
    var orgQuota = null;   

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.setEndPoint(self.CF_API_URL);
            CloudFoundryOrgs.setEndPoint(self.CF_API_URL);
            CloudFoundryOrgQuota.setEndPoint(self.CF_API_URL);
            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return CloudFoundryOrgs.getOrganizations(token_type, access_token);
            }).then(function (result) {
                organizations = result;
                //TODO: Refactor this part to be multi org.
                org_guid = result.resources[0].metadata.guid;
                quota_guid = result.resources[0].entity.quota_definition_guid;
                return CloudFoundryOrgs.getMemoryUsage(token_type, access_token, org_guid);
            }).then(function (result) {                
                //console.log(result);
                orgMemory = result;
                return CloudFoundryOrgQuota.getQuotaDefinition(token_type, access_token, quota_guid);
            }).then(function (result) {                
                //console.log(result);
                orgQuota = result;
                results = {
                    organizations: organizations,
                    orgMemory: orgMemory,
                    orgQuota: orgQuota
                }                              
                return resolve(results);
            }).catch(function (reason) {
                console.error("Error: " + reason);
                return reject(reason);
            });

        } catch (error) {
            return reject(error);
        }

    });

};



module.exports = HomeServices;