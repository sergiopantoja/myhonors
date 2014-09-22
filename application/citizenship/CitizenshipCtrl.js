'use strict';

angular.module('myhonorsEvents').controller('CitizenshipCtrl', ['$scope', 'FirebaseIO', 'UserService', 'VolunteerService', 'CitizenshipService', 'SwipeService', function($scope, FirebaseIO, UserService, VolunteerService, CitizenshipService, SwipeService) {
    
	$scope.submissions = VolunteerService.list(UserService.profile.pid);
	
	$scope.submit = function(volunteerHoursForm) {
		if (volunteerHoursForm.$valid) {
			var data = angular.extend($scope.newData, {userId: UserService.profile.id});
			VolunteerService.create(data);
			$scope.newData = {};
		}
	};

	
	$scope.hoursCompleted = 0;
	$scope.addVolunteerHours = function (submission) {
		if (submission.status == "accepted" && submission.hours) {
			$scope.hoursCompleted += submission.hours;
		}
	};
	
	$scope.removeVolunteerHours = function (volunteerHour) {
		// We ask the user for a double confirmation before deleting the volunteer hours
		var confirmation1 = confirm("Are you sure you wish to delete this volunteer hour?"),
            confirmation2 = false;
		
		if (confirmation1) {
			confirmation2 = confirm("All the information of this volunteer hour will be deleted. Are you sure you wish to proceed?");
        }
			
			
		if (confirmation1 && confirmation2) {
			VolunteerService.remove(volunteerHour, UserService.profile.id);
		
			$scope.hoursCompleted = 0;	//Reset the total volunteer hours counter
			$scope.submissions = VolunteerService.list(UserService.profile.pid);	//Reload the volunteer hours list
		}
	};
    
    var citizenshipTypes = CitizenshipService.getTypes();
    $scope.citizenship = {
        types: citizenshipTypes,
        points: 0,
        events: {},
        eventsCount: 0,
        roomswipe: {},
        roomswipeCount: 0
    };
    $scope.eventsAttended = SwipeService.listByUser(UserService.profile.id);
    
    $scope.$watch('eventsAttended', function() {
		citizenshipTypes.then( function (promise) {
			$scope.citizenship.points = 0;
			$scope.citizenship.eventsCount = $scope.eventsAttended.length;
			// Event Names added here just like $scope.citizenship.events. This checks for duplicate swipes in one event and prevents additional points for such.
			var eventsArray = [];
			
			angular.forEach($scope.eventsAttended, function(eventInfo, key) {
				var eventName = eventInfo.name;
				var eventType = eventInfo.types[0];
				
				if (!$scope.citizenship.events[eventType] && promise.enabledTypes.hasOwnProperty(eventType)) {
					$scope.citizenship.events[eventType] = {};
				}	
				
				// Event of such a type is enabled on system_settings
				if (promise.enabledTypes.hasOwnProperty(eventType)){
					// Put appropriate events in event type, fill with eventInfo from Firebase
					$scope.citizenship.events[eventType][eventName] = eventInfo;
					// Calculate points as necessary
					if (eventsArray.indexOf(eventName) == -1) {
						var pointsForEventType = promise.enabledTypes[eventType].points,
							maxPointsForEventType = promise.enabledTypes[eventType].maxPoints;
						$scope.citizenship.points += (maxPointsForEventType !== 0 && pointsForEventType > maxPointsForEventType) ? maxPointsForEventType : pointsForEventType;
						eventsArray.push(eventName);
					}
				}
			});
		});
	});
    
    
    
}]);
