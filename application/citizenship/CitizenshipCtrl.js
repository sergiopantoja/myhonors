

angular.module('myhonorsEvents').controller('CitizenshipCtrl', ['$scope', '$timeout', 'FirebaseIO', 'UserService', 'VolunteerService', 'CitizenshipService', 'SwipeService', function($scope, $timeout, FirebaseIO, UserService, VolunteerService, CitizenshipService, SwipeService) {
    
    'use strict';
    
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
        roomswipe: {
            'BBC Lab': 0,
            'Study Room': 0
        },
        roomswipeCount: 0
    };
    $scope.eventsAttended = SwipeService.listByUser(UserService.profile.id);
    
    $scope.$watchCollection('eventsAttended', function() {
        //console.log($scope.eventsAttended);
		citizenshipTypes.then( function (promise) {
			$scope.citizenship.points = 0;
			$scope.citizenship.eventsCount = $scope.eventsAttended.length;
            $scope.citizenship.roomswipe["BBC Lab"] = $scope.citizenship.roomswipe["Study Room"] = 0;
			// Event Names added here just like $scope.citizenship.events. This checks for duplicate swipes in one event and prevents additional points for such.
			var eventsArray = [];
            var clubsAttendance = {};

			 /**** calculate the points for BBC and Study Room Swipes *****/
            var labAttendance = 0;
            var bbcLabSwipes = UserService.profile.attendance.bbclabswipe;
            var studyRoomSwipes = UserService.profile.attendance.studyroomswipe;
            for (var k in bbcLabSwipes) if (bbcLabSwipes.hasOwnProperty(k)) $scope.citizenship.roomswipe["BBC Lab"]++;
            for (var k in studyRoomSwipes) if (studyRoomSwipes.hasOwnProperty(k)) $scope.citizenship.roomswipe["Study Room"]++;

            var labAttendance = $scope.citizenship.roomswipe["BBC Lab"] + $scope.citizenship.roomswipe["Study Room"];
            $scope.citizenship.roomswipeCount = labAttendance -= 2; /* to remove the eventType properties in each object */
			var labPoints = labAttendance * promise.enabledTypes["Labs"].points;

            if (labAttendance < promise.enabledTypes["Labs"].minAttendance) labPoints = 0;
            else if (labPoints > promise.enabledTypes["Labs"].maxPoints) labPoints = promise.enabledTypes["Labs"].maxPoints;

            $scope.citizenship.points += labPoints;
            /************************************************************/
            
			angular.forEach($scope.eventsAttended, function(eventInfo, key) {
				if (eventInfo.name == undefined || eventInfo.types == undefined){
					return;
				}
				var eventName = eventInfo.name,
					eventType = eventInfo.types[0],
                    eventHasClub = eventInfo.hasOwnProperty("club") && eventInfo.club.length;
				
				if (!$scope.citizenship.events[eventType] && promise.enabledTypes.hasOwnProperty(eventType)) {
					$scope.citizenship.events[eventType] = {};
				}	
				
				// Event of such a type is enabled on system_settings
				if (promise.enabledTypes.hasOwnProperty(eventType)){
					// Put appropriate events in event type, fill with eventInfo from Firebase
					$scope.citizenship.events[eventType][eventName] = eventInfo;
					// Calculate points as necessary
					if (eventsArray.indexOf(eventName) == -1) {
                        var points = 0,
                            pointsForEventType = promise.enabledTypes[eventType].points,
                            maxPointsForEventType = promise.enabledTypes[eventType].maxPoints;

                        if (!eventHasClub) {
                            points = (maxPointsForEventType !== 0 && pointsForEventType > maxPointsForEventType) ? maxPointsForEventType : pointsForEventType;
                        }
                        else {
                            var clubName = eventInfo.club;
                            clubsAttendance[clubName] = (clubsAttendance[clubName] == null) ? 1 : clubsAttendance[clubName] + pointsForEventType;
                            if (clubName.indexOf("HEARTS A CAPELLA") > -1) {
                                maxPointsForEventType += 3;   
                            }
                            if (clubsAttendance[clubName] * pointsForEventType <= maxPointsForEventType)
                                points = pointsForEventType;
                        }
						$scope.citizenship.points += points;
						eventsArray.push(eventName);
					}
				}
			});
		});
	});
    
    
    
}]);
