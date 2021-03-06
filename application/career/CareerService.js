'use strict'

angular.module('myhonorsCareer').factory('CareerService', function($q, FirebaseIO, FirebaseCollection, UserService) {

	/**
	 * Check if the career object being created or updated meets all the necessary conditions
	 */
	function checkConditions(careerObject) {
		if (!angular.isString(careerObject.companyName) ||
				!angular.isString(careerObject.address) ||
				!angular.isString(careerObject.pointOfContact) ||
				!angular.isString(careerObject.details) ||
				!angular.isString(careerObject.description) ||
				!angular.isString(careerObject.status)
			) {
				return false;
            }
			
			return true;
	};

	return {
		create: function(careerObject) {
			if (!checkConditions(careerObject)) {
				// Invalid input, do nothing
				alert("Invalid  form");
				return;
			}
            
            careerObject.createdAt = Date.now();
            
            var ref = FirebaseIO.child('careers/' + careerObject.createdAt);
            // Setting the priority to -(current time) causes the list to be ordered from newest added to oldest
            ref.setWithPriority(careerObject, -careerObject.createdAt);

			return ref.name();	// Return the ID of the newly created position
		},
		read: function(positionID, onComplete) {
			var deferred = $q.defer();

			FirebaseIO.child('careers/' + positionID).on('value', function(snapshot) {
				if (snapshot.val() === null) {
					// Career was deleted, do nothing
					return;
				}

				var data = snapshot.val();
				data.id = snapshot.name();
				data.numApplications = snapshot.child('applications').numChildren();

				if (angular.isFunction(onComplete)) {
					onComplete(data);
				}

				deferred.resolve(data);	
			});

			return deferred.promise;
		},

		
		list: function(options) {
			var eventsRef = FirebaseIO.child('careers');

			var options = options || {};
            
			if (options.hasOwnProperty('startAt')) eventsRef = eventsRef.startAt(options.startAt);
			if (options.hasOwnProperty('endAt'))   eventsRef = eventsRef.endAt(options.endAt);
			if (options.hasOwnProperty('limit'))   eventsRef = eventsRef.limit(options.limit);

			return FirebaseCollection(eventsRef, {metaFunction: function(doAdd, snapshot) {
				var extraData = {
					id: snapshot.name()
				};

				doAdd(snapshot, extraData);
			}});
		},

		/**
		 * When a user submits an application to a particular position, the application info is stored in the 'applications'
		 * child of the career parent in Firebase. The ID of the application is then pushed to the user's profile in order
		 * to denormalize the data.
		 * 
		 * @param applicationInfo JSON object containing the information of the application
		 * @param positionID 
		 * 
		 * @return The application ID
		 */
		addApplication: function(applicationInfo, positionID) {
			var now = Date.now();
			applicationInfo.submissionTime = now;
			var applicationRef = FirebaseIO.child('careers/' + positionID + '/applications/' + UserService.profile.pid).set(applicationInfo); 
		
			UserService.ref.child('positions/' + positionID).set(now);
	
		},
		
		readApplication: function(positionID, applicationID, onComplete) {
			var deferred = $q.defer();

			FirebaseIO.child('careers/' + positionID + '/applications/' + applicationID).on('value', function(snapshot) {
				if (snapshot.val() === null) {
					// There application was deleted, do nothing
					return;
				}

				var data = snapshot.val();
				data.id = snapshot.name();

				if (angular.isFunction(onComplete)) {
					onComplete(data);
				}

				deferred.resolve(data);	
			});

			return deferred.promise;
		},

		update: function(careerID, careerObject) {
			if (!checkConditions(careerObject)) {
				alert("Invalid  form");
				return false;
			}
            
            careerObject.editedAt = Date.now();
			
			// Go through each property in the object and add that specifically, this prevents
			// us from overwriting the entire career object in Firebase
			angular.forEach(careerObject, function(value, key) {
				FirebaseIO.child('careers/' + careerID + '/' + key).set(value);
			});
            
            // Setting the priority to -(current time) causes the list to be ordered from newest added to oldest
			FirebaseIO.child('careers/' + careerID).setPriority(-careerObject.editedAt);
			
			return true;
			
		},
		
		/**
		 * Activates or deactivates the position depending on its current status (It will do the opposite of the current status)
		 * 
		 * @param currenStatus The current status of the position: 'active' or 'inactive'
		 */
		toggleActivation: function(positionID, currentStatus) {
			if (currentStatus === "active")
				FirebaseIO.child('careers/' + positionID + '/status').set("inactive");
			else
				FirebaseIO.child('careers/' + positionID + '/status').set("active");
			
		},
		
		approvePosition: function(positionID) {
			FirebaseIO.child('careers/' + positionID + '/status').set("active");
		},

		delete: function(positionID) {
			FirebaseIO.child('careers/' + positionID).remove();
		}

	}
});
