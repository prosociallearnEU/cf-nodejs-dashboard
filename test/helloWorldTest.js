/*jslint node: true*/
"use strict";

var chai = require("chai"),
    expect = require("chai").expect;
const Browser = require('zombie');
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

var cf_api_url = nconf.get('CF_API_URL'),
    username = nconf.get('username'),
    password = nconf.get('password');

Browser.localhost('localhost', 5000);

describe('User visits signup page', function() {
    this.timeout(15000);

    const browser = new Browser();

    before(function() {
        return browser.visit('/');
    });

    describe('submits form', function() {

        before(function() {
            browser
                .fill('endpoint', cf_api_url)
                .fill('username', username)
                .fill('password', password);
            return browser.pressButton('Sign in');
        });

        it('should be successful', function() {
            browser.assert.success();
        });

        it('should see welcome page', function() {
            browser.assert.text('title', 'Cloud Foundry Manager');
        });
    });
});

