
var username = null;
var password = null;

$(document).ready(function() {

	function initApp(){
		$("#mainNavBar").hide();
		$("#mainNavBar2").hide();
		$("#pageLogin").show();
		$("#pageHome").hide();
		$("#pageApps").hide();
		$("#pageCreateApps").hide();
	}

	initApp();

	$("#pageLogin").find("#btnLoginSubmit").click(function(event) {
		event.preventDefault();

		var url = "/api/v1/auth/login";
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
		}

		$.ajax({
		    url: url, 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify(data)}
		).done(function( data ) {
			$("#mainNavBar").show();
			$("#mainNavBar2").show();			
		  	$("#pageLogin").hide();
		  	$("#pageHome").show();
		});
	});

	$("body").on("click","#btnLogout", function(event) {
		event.preventDefault();

		$("#username").val("");
		$("#password").val("");

		$("#mainNavBar").hide();
		$("#mainNavBar2").hide();
		$("#pageLogin").show();
		$("#pageHome").hide();
		$("#pageApps").hide();
		$("#pageCreateApps").hide();
	});

	$("body").on("click","#btnHome", function(event) {
		event.preventDefault();

		$("#pageLogin").hide();
		$("#pageHome").show();
		$("#pageApps").hide();
		$("#pageCreateApps").hide();
	});

	$("body").on("click","#btnApps", function(event) {
		event.preventDefault();

		var url = "/api/v1/apps";
		$.ajax({
		    url: url, 
		    type: 'GET', 
		    contentType: 'application/json'
		}).done(function(data) {

			console.log(data);

		  	var htmlcode = "";
		  	$.each(data.resources, function(index) {
		  		//console.log(data.resources[index]);
		  		htmlcode += "<tr>";
		  		htmlcode += "<td>" + index + "</td>";
		  		htmlcode += "<td>" + data.resources[index].entity.name + "</td>";
		  		htmlcode += "<td>" + data.resources[index].entity.package_state + "</td>";
		  		htmlcode += "<td>" + data.resources[index].entity.state + "</td>";
		  		htmlcode += "<td>" + data.resources[index].metadata.updated_at + "</td>";
		  		htmlcode += "<td>";
		  		htmlcode += "<a class='btn btn-default' href='#' onclick='viewApp(\"" + data.resources[index].metadata.guid + "\"); return false;'>View</a>";
		  		htmlcode += "</td>";
		  		htmlcode += "<tr>";
			});

			$("#pageApps").find("#result").html(htmlcode);

			$("#pageLogin").hide();
			$("#pageHome").hide();
			$("#pageApps").show();
			$("#pageAppView").hide();			
			$("#pageCreateApps").hide();
		});

	});

	$("#pageCreateApps").find("#btCreateApp").click(function(event) {
		event.preventDefault();

		$('#btCreateApp').attr('disabled','disabled');

		var url = "/api/v1/apps/create";
		var appname = $("#appname").val();

		//Form validation
		if (!appname.trim()) {
    		console.log("Form validation problem");
    		return false;
		}

		var data = {
			appname: appname
		}

		$.ajax({
		    url: url, 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify(data)}
		).done(function( data ) {
		  	console.log(data);
		  	//$("#pageLogin").hide();
		  	//$("#pageHome").show();
		});
	});

	$("#btnAppCreate").on("click", function(event) {
		event.preventDefault();

		$("#pageHome").hide();
		$("#pageApps").hide();
		$("#pageCreateApps").show();		
	});

});

function viewApp(app_guid){
	console.log(app_guid);

	var url = "/api/v1/apps/" + app_guid + "/view";
	$.ajax({
	    url: url, 
	    type: 'GET', 
	    contentType: 'application/json'
	}).done(function(data) {
		$("#pageApps").hide();
		$("#pageAppView").show();
		
	  	console.log(data);

	  	var htmlcode = "";
	  	$.each(data, function(index) {
	  		htmlcode += "<tr>";
	  		htmlcode += "<td>" + index + "</td>";
	  		htmlcode += "<td>" + data[index]  + "</td>";
	  		htmlcode += "<tr>";
		});

		$("#pageAppView").find("#result").html(htmlcode);	  	
	});		

}

$(window).on('beforeunload', function(){
      return 'Are you sure you want to leave?';
});