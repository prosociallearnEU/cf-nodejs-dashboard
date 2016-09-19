/*jslint node: true*/
"use strict";
var CloudController = require("cf-nodejs-client").CloudController;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
var CloudFoundryOrgs = require("cf-nodejs-client").Organizations;
var CloudFoundryOrgQuota = require("cf-nodejs-client").OrganizationsQuota;
var CloudFoundrySpaces = require("cf-nodejs-client").Spaces;
CloudController = new CloudController();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();
CloudFoundryOrgs = new CloudFoundryOrgs();
CloudFoundryOrgQuota = new CloudFoundryOrgQuota();
CloudFoundrySpaces = new CloudFoundrySpaces();

function HomeServices(_CF_API_URL, _username, _password) {
    this.CF_API_URL = _CF_API_URL;
    this.username = _username;
    this.password = _password;
}

HomeServices.prototype.setEndpoint = function (endpoint) {
    this.CF_API_URL = endpoint;
};

HomeServices.prototype.setCredential = function (username, password) {
    this.username = username;
    this.password = password;
};

HomeServices.prototype.getOrganizations = function () {
    var token_endpoint = null;
    var authorization_endpoint = null;

    var self = this;
    var results = null;
    var org_guid = null;
    var quota_guid = null;
    var organizations = null;
    var spaces = null;
    var orgMemory = null;
    var orgQuota = null;   

    return new Promise(function (resolve, reject) {

        try {

            CloudController.setEndPoint(self.CF_API_URL);
            CloudFoundryOrgs.setEndPoint(self.CF_API_URL);
            CloudFoundryOrgQuota.setEndPoint(self.CF_API_URL);
            CloudFoundrySpaces.setEndPoint(self.CF_API_URL);

            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryOrgs.setToken(result);
                CloudFoundryOrgQuota.setToken(result);
                CloudFoundrySpaces.setToken(result);
                return CloudFoundryOrgs.getOrganizations();
            }).then(function (result) {
                organizations = result;                
                //TODO: Refactor this part to be multi org.
                org_guid = result.resources[0].metadata.guid;
                quota_guid = result.resources[0].entity.quota_definition_guid;
                return CloudFoundryOrgs.getMemoryUsage(org_guid);
            }).then(function (result) {                
                orgMemory = result;
                return CloudFoundryOrgQuota.getQuotaDefinition(quota_guid);
            }).then(function (result) {                
                orgQuota = result;
                return CloudFoundrySpaces.getSpaces();
            }).then(function (result) {
                spaces = result;
                results = {
                    organizations: organizations,
                    orgMemory: orgMemory,
                    orgQuota: orgQuota,
                    spaces: spaces
                };
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