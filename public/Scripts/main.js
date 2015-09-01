
/*global alert, window */
/*jslint node: true*/
"use strict";

var username = null;
var password = null;

function drawAppTable() {
    var url = "/api/apps";
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {

        //console.log(data);
        console.log("OK");

        var htmlcode = "";
        var app_guid = null;
        $.each(data.resources, function (index) {

            app_guid = data.resources[index].metadata.guid;

            //console.log(data.resources[index]);
            htmlcode += "<tr>";
            htmlcode += "<td>" + (index + 1) + "</td>";
            htmlcode += "<td><a href='#' onclick='openApp(\"" + app_guid + "\"); return false;'>" + data.resources[index].entity.name + "</a></td>";
            htmlcode += "<td>" + data.resources[index].entity.package_state + "</td>";
            htmlcode += "<td>" + data.resources[index].entity.state + "</td>";
            htmlcode += "<td>" + data.resources[index].metadata.updated_at + "</td>";
            htmlcode += "<td>";
            htmlcode += "<a class='btn btn-default' href='#' onclick='viewApp(\"" + app_guid + "\"); return false;'>View</a>&nbsp;";
            htmlcode += "<a class='btn btn-default' href='#' onclick='upgradeApp(\"" + app_guid + "\"); return false;'>Upgrade</a>&nbsp;";
            htmlcode += "<a class='btn btn-default' href='#' onclick='stopApp(\"" + app_guid + "\"); return false;'>Stop</a>&nbsp;";
            htmlcode += "<a class='btn btn-default' href='#' onclick='startApp(\"" + app_guid + "\"); return false;'>Start</a>&nbsp;";
            htmlcode += "<a class='btn btn-default' href='#' onclick='removeApp(\"" + app_guid + "\"); return false;'>Remove</a>&nbsp;";
            htmlcode += "</td>";
            htmlcode += "<tr>";
        });

        $("#pageApps").find("#result").html(htmlcode);

        $("#pageLogin").hide();
        $("#pageHome").hide();
        $("#pageApps").show();
        $("#pageAppView").hide();
        $("#pageCreateApps").hide();
        $("#pageUpgradeApps").hide();
    });
}

$(document).ready(function () {

    function initApp() {
        $("#mainNavBar").hide();
        $("#mainNavBar2").hide();
        $("#pageLogin").show();
        $("#pageHome").hide();
        $("#pageApps").hide();
        $("#pageCreateApps").hide();
        $("#pageUpgradeApps").hide();
    }

    initApp();

    $("#pageLogin").find("#btnLoginSubmit").click(function (event) {
        event.preventDefault();

        var url = "/api/auth/login";
        username = $("#username").val();
        password = $("#password").val();

        //Form validation
        if ((!username.trim()) && (!password.trim())) {
            console.log("Form validation problem");
            return false;
        }

        var data = {
            username: username,
            password: password
        };

        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).done(function () {
            $("#mainNavBar").show();
            $("#mainNavBar2").show();
            $("#pageLogin").hide();
            $("#pageHome").show();
        });
    });

    $("body").on("click", "#btnLogout", function (event) {
        event.preventDefault();

        $("#username").val("");
        $("#password").val("");

        $("#mainNavBar").hide();
        $("#mainNavBar2").hide();
        $("#pageLogin").show();
        $("#pageHome").hide();
        $("#pageApps").hide();
        $("#pageCreateApps").hide();
        $("#pageUpgradeApps").hide();
    });

    $("body").on("click", "#btnHome", function (event) {
        event.preventDefault();

        $("#pageLogin").hide();
        $("#pageHome").show();
        $("#pageApps").hide();
        $("#pageCreateApps").hide();
    });

    $("body").on("click", "#btnApps", function (event) {
        event.preventDefault();

        drawAppTable();
    });

    $("#pageCreateApps").find("#btCreateApp").click(function (event) {
        event.preventDefault();

        $('#btCreateApp').attr('disabled', 'disabled');

        var url = "/api/apps/create";
        var appname = $("#appname").val();

        //Form validation
        if (!appname.trim()) {
            console.log("Form validation problem");
            return false;
        }

        var data = {
            appname: appname
        };

        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).done(function (data) {
            console.log(data);

            //Reset form
            $("#appname").val("");
            $('#btCreateApp').removeAttr("disabled");

            //Return to GetApps View
            $("#btnApps").trigger("click");
        });
    });


    $("body").on("click", "#btnAppCreate", function (event) {
        event.preventDefault();

        $("#pageHome").hide();
        $("#pageApps").hide();
        $("#pageCreateApps").show();
    });

    $("#pageUpgradeApps").find("#btUpgradeApp").click(function (event) {
        event.preventDefault();

        $('#btCreateApp').attr('disabled', 'disabled');

        var url = "/api/apps/upgrade";
        var app_guid = $("#app_guid").val();

        var data = {
            guid: app_guid
        };

        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).done(function (data) {
            console.log(data);

            //Return to GetApps View
            $("#btnApps").trigger("click");
        });
    });

});

function viewApp(app_guid) {
    console.log(app_guid);

    var url = "/api/apps/" + app_guid + "/view";
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        $("#pageApps").hide();
        $("#pageAppView").show();
        console.log(data);

        var htmlcode = "";
        $.each(data, function (index) {
            htmlcode += "<tr>";
            htmlcode += "<td>" + index + "</td>";
            htmlcode += "<td>" + data[index]  + "</td>";
            htmlcode += "<tr>";
        });

        $("#pageAppView").find("#result").html(htmlcode);
    });

}

function upgradeApp(app_guid) {
    console.log(app_guid);

    $("#app_guid").val(app_guid);

    $("#pageApps").hide();
    $("#pageUpgradeApps").show();
}

function stopApp(app_guid) {
    console.log(app_guid);

    var url = "/api/apps/stop";
    var data = {
        guid: app_guid
    };

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done(function (data) {
        console.log(data);
    });

}

function startApp(app_guid) {

    var url = "/api/apps/start";
    var data = {
        guid: app_guid
    };

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        }
    });

}

function removeApp(app_guid) {
    console.log(app_guid);

    var url = "/api/apps/remove";
    var data = {
        guid: app_guid
    };

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done(function (data) {
        console.log(data);

        drawAppTable();
    });

}

function openApp(app_guid) {
    console.log(app_guid);

    var url = "/api/apps/open";
    var data = {
        guid: app_guid
    };

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        } else {
            console.log(data);
            window.open(data, '_blank');
        }
    });

}


$(window).on('beforeunload', function () {
    return 'Are you sure you want to leave?';
});