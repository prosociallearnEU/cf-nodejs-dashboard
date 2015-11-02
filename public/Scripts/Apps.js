/*global alert, window, Dropzone */
"use strict";

function Apps() {
    return undefined;
}

Apps.prototype.viewApp = function (app_guid) {
    //console.log(app_guid);

    var url = "/apps/view/" + app_guid;
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        $("#pageApps").hide();
        $("#pageAppView").show();
        //console.log(data);

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

Apps.prototype.logApp = function (app_guid) {

    var url = "/apps/log/" + app_guid;
    var data = {
        guid: app_guid
    };

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        } else {
            console.log(data);
            $("#result").html(data);
        }
    });

};

function stopApp(app_guid) {
    //console.log(app_guid);

    var url = "/apps/stop/" + app_guid;

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        } else {
            console.log(data);
            //drawAppTable();
            location.reload();
        }
    });

}

function startApp(app_guid) {

    var url = "/apps/start/" + app_guid;

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        } else {
            console.log(data);
            //drawAppTable();
            location.reload();
        }
    });

}

function removeApp(app_guid) {
    //console.log(app_guid);

    var url = "/apps/remove/" + app_guid;

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        console.log(data);
        //drawAppTable();
        location.reload();
    });

}

function openApp(app_guid) {
    //console.log(app_guid);

    var url = "/apps/open/" + app_guid;

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json'
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

$("#formAppAdd").submit(function( event ) {

    var appName = $("#appname").val();
    if (appName.match(/^[a-z0-9]{5,10}$/)) {
        return true;
    }else {
        alert("Your app uses a bad name.\nPattern: [a-z0-9]{5,15}");
    }

    event.preventDefault();
});