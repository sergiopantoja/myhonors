'use strict'

angular.module('myhonorsUser').factory('UserService', function($http, $location, $timeout, $q, $rootScope, FirebaseIO, webStorage) {
	var login = function(username, password) {
		// used to show "Loading..." status after clicking Login button
		this.status.loading = true;

		var self = this;
		var defer = $q.defer();

		if(username.length === 0 || password.length === 0){
			defer.reject("No username and/or password provided");
			this.profile = null;
			this.status.loading = false;
			return defer.promise;
		}

		var data = 'pid=' + username + '&password=' + password;
		$http.post('auth/auth.php', data, {headers: {'Content-Type' : 'application/x-www-form-urlencoded'}}).success(function(result) {
			var loginSuccess = false;
			if (result.success === true && angular.isDefined(result.token))
			{
				FirebaseIO.auth(result.token, function(error, authObject) {
					// evaluate the status of the login attempt
					if (error) {
						// an error occurred while attempting login, make sure profile object is empty
						$timeout(function() {
							self.profile = null;
						});

						alert(error);
					}
					else if (authObject) {
						//checks if the id in the auth object is found in the barred list. if so a flag is to true to block them
						var isUnauthorized = false;
						var ref2 = FirebaseIO.child('/system_settings/isUnauthorized/' + authObject.auth.id);
						ref2.once('value', function(snapshot) {
							if(snapshot.val() !== null) {
								$timeout(function() {
									self.profile = null;
									self.status.loading = false;
								});
								isUnauthorized = true;
								return;
							}
						});

						// then check if the user has a profile. if not, create it
						var ref = FirebaseIO.child('/user_profiles/' + authObject.auth.id);

						ref.once('value', function(snapshot) {
							// If the user profile doesn't exist then that means the student is not a Honors college member
							if (snapshot.val() === null) {
								alert("You must be an Honors student if you wish to login. If you are a new Honors student, please wait until the Fall semester starts before you attempt to log in.");
								$timeout(function() {
									self.profile = null;
									self.status.loading = false;
								});
								return;
							}
							// If information has been pre-loaded into their user profile, but the user has never actually logged in before
							else if (snapshot.child('lastActivity').val() === null ||
									  snapshot.child('fname').val() === null ||
									  snapshot.child('lname').val() === null)
							{
								// new user, create profile for them
								ref.child('fname').set(result.fname);
								ref.child('lname').set(result.lname);
								ref.child('pid').set(result.pid);
								ref.child('lastActivity').set(Date.now());
							} else if(isUnauthorized) {
								//The return needs to be called so the user is not logged in.
								alert("Sorry, but you are not authorized to enter.");//need to put alert here because firefox alert "pauses" functions when alert is calld
									return;
							} else {
								// user has profile. update lastActivity
								ref.child('lastActivity').set(Date.now());
								var profile = snapshot.val();
								profile.id = snapshot.name();

								// save data to object
								$timeout(function() {
									self.profile = profile;
									self.auth = authObject.auth;
									self.ref = ref.ref();
								})

								// redirect to homepage
								//$location.path('');
								self.status.loading = false;
							}
                            // user successfully logged in. save token to localStorage (or cookies if browser doesn't support it)
                            // so we can auth on every page load via appResolve
                            webStorage.add('auth_token', result.token);
                            loginSuccess = true;
                            defer.resolve( loginSuccess );
						});

					}
					else {
						// user is logged out, make sure profile object is empty
						$timeout(function() {
							self.profile = null;
							self.status.loading = false;
						});
					}
				});
			}
			else
			{
				alert(result.error);
				self.status.loading = false;
			}

		});

		return defer.promise;

	};

	var logout = function() {
		$http.get('auth/un_auth.php', {headers: {'Content-Type' : 'application/x-www-form-urlencoded'}});
		webStorage.remove('auth_token');
		FirebaseIO.unauth();
		this.profile = null;
		$location.path('/login');
	};

	/**
	 * Check if a certain userId already exists and executes a callback with the boolean result
	 */
	var exists = function(userId, callback) {
		if (!angular.isString(userId) || userId.length === 0) {
			callback(false);
			return;
		}

		FirebaseIO.child('user_profiles/' + userId).once('value', function(snapshot) {
			if (snapshot.val() === null) {
				callback(false);
			} else {
				callback(true, snapshot.val());
			}
		});
	};

    /**
     * Method that accepts a student's username and returns a promise containing that student's PID
     */
    var getPIDFromUsername = function( username ) {
        var deferred = $q.defer();

        $timeout(function() {
            FirebaseIO.child( 'usernames/' + username ).once( 'value', function( snapshot ) {
                if ( snapshot.val() === null )
                    deferred.reject( "No student with that username was found" );
                else
                    deferred.resolve( snapshot.val().toString()  );
                $rootScope.$apply();
            });
        });


        return deferred.promise;
    };

	return {
		profile: null,
		auth: null,
		ref: null,
		status: {loading: false}, // used to show "Loading..." status after clicking Login button
		login: login,
		logout: logout,
		exists: exists,
        getPIDFromUsername: getPIDFromUsername
	};
});
