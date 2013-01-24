<!DOCTYPE html>
<html lang="en" xmlns:ng="http://angularjs.org" data-ng-app="myhonors">
<head>
	<title>MyHonors</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" type="text/css" href="assets/css/bootstrap.css" />
	<link rel="stylesheet" type="text/css" href="assets/css/style.css" />
	<!-- this is for the Sticky Footer Solution -->
	<!--[if !IE 7]>
	<style type="text/css">
		#wrap {display:table;height:100%}
	</style>
	<![endif]-->
</head>
<body data-ng-controller="AppCtrl">

<!-- we use these two div's for the sticky footer -->
<div id="wrap">

	<!-- header -->
	<div class="navbar navbar-static-top navbar-inverse">
		<div class="navbar-inner">
			<div class="container-fluid">
				<a class="brand" href="#/home">&nbsp;</a>
				<ul class="nav">
					<li><a href="#/events"><i class="icon-calendar icon-white"></i> Events</a></li>
					<li><a href="#/citizenship"><i class="icon-ok icon-white"></i> Citizenship</a></li>
				</ul>
				<div class="dropdown pull-right">
					<span class="dropdown-text">Logged in as</span> <button class="btn btn-link dropdown-toggle" data-toggle="dropdown"><i class="icon-user icon-white"></i> {{profileData.fname}} {{profileData.lname}}</button>
					<ul class="dropdown-menu pull-right" role="menu">
						<li><a href="#">View Profile</a></li>
						<li><a href="#">Update Profile</a></li>
						<li class="divider"></li>
						<li><a href="auth/logout">Logout</a></li>
					</ul>
				</div>
				</p>
			</div>
		</div>
	</div>

	<!-- content -->
	<div class="container-fluid">

		<!-- this div gets populated with AngularJS's views -->
		<div class="row-fluid" data-ng-view></div>

	</div>

	<!-- this is needed for the sticky footer -->
	<div id="push"></div>

</div>

<!-- footer -->
<div id="footer">
	<div class="container-fluid">
		<div class="row-fluid">
			<div class="span6 pagination-right" id="footer-image">
				<img src="assets/img/honors-logo.jpg" alt="Honors College - Florida International University" />
			</div>
			<div class="span6" id="footer-content">
				<address><small>The Honors College (DM 233), 11200 SW 8th Street, Miami, FL 33199</small></address>
				<small>Phone: (305) 348-4100 &#8226; Fax: (305) 348-2118 &#8226; Email: <a href="mailto:honors@fiu.edu">honors@fiu.edu</a></small>
			</div>
		</div>
	</div>
</div>

<script src="assets/lib/jquery.min.js"></script>
<script src="assets/lib/angular.js"></script>
<script src="assets/lib/angular-resource.js"></script>
<script src="assets/lib/bootstrap.js"></script>
<script type="text/javascript">

'use strict';

var myhonors = angular.module('myhonors', ['myhonorsConfig', 'myhonorsEvents']);

/* Config */

myhonors.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo:'/home', templateUrl: 'assets/partials/home.html'});
}]);

/* Controllers */

myhonors.controller('AppCtrl', ['$scope', '$location', function AppCtrl($scope, $location) {
	$scope.page_title = "";
	$scope.profileData = <?php echo(json_encode($profile_data)); ?>;
}]);

</script>
<script src="assets/js/config.js"></script>
<script src="assets/js/events.js"></script>

</body>
</html>