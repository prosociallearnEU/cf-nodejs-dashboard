# cf-nodejs-dashboard

This application has been developed to interact with some components of the <a href="https://docs.cloudfoundry.org/concepts/architecture/" target="_blank">Cloud foundry Architecture</a>: <a href="https://docs.cloudfoundry.org/concepts/architecture/cloud-controller.html" target="_blank">Cloud Controller</a>, <a href="https://docs.cloudfoundry.org/concepts/architecture/uaa.html" target="_blank">UAA</a> & <a href="https://docs.pivotal.io/pivotalcf/devguide/deploy-apps/streaming-logs.html" target="_blank">Metrics</a> services installed in a <a href="https://www.cloudfoundry.org/" target="_blank">Cloud Foundry</a> Instance. Cloud Foundry offers a <a href="https://github.com/cloudfoundry/cli" target="_blank">CLI</a> to manage a app life cycle in combination with the Web apps provided by the commercial Cloud Foundry platforms as <a href="https://run.pivotal.io/" target="_blank">PWS</a> or <a href="https://console.ng.bluemix.net/" target="_blank">Bluemix</a>. This Web App allows the user create the app, uploads the code and execute the typical actions (Start, Stop, Restage, Remove, Scale)

## Getting Started.

The application is able to run in localhost or hosted. To test in local, the steps are:

``` bash
git clone https://github.com/prosociallearnEU/cf-nodejs-dashboard.git
npm install
node index.js
```

and later, open a webbrowser and type:

``` bash
open http://localhost:5000/
```

### User Interface

**Login**

The app will redirect to login area:

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/login.png)

Once, you have authenticated in the previous step, you will be redirected to home:

**Home**

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/home.png)

This view, will be used to show:

* List of Organization
* List of Spaces from the first Organization
* Memory used in the First Organization
* Organization Quota associated with the first Organization

If you click in the space:

**Space / Apps**

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/spaceApps.png)

The UI will show the list of apps created in the space and some interesting aspects of every app:

* Stage status
* App status
* Instances

The UI has a button to go to the detail of every app. The UI has other actions:

* Add a new application to current space
* Refresh window






