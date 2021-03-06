'use strict';

angular.module('myhonorsArchive').controller('ArchiveCtrl', ['$scope', 'FirebaseIO', '$location','ArchiveService', function($scope, FirebaseIO, $location, ArchiveService) {

  $scope.list = ArchiveService.list();
  $scope.addingVideo = false;
  $scope.newVideo = {};

  $scope.adding = function() {
      $scope.addingVideo = !$scope.addingVideo;
  };

  $scope.editing = function(video) {
    video.editing = !video.editing;
  };

  $scope.edit = function(video, edit) {
    ArchiveService.edit(video, edit);
    video.editing = false;
  };

  $scope.submit = function() {
    var id = ArchiveService.submit($scope.newVideo);
    $scope.newVideo = {};
  };

  $scope.survey = function(surveyURL) {
      if(surveyURL.toLowerCase() === 'close' || surveyURL.toLowerCase() === 'closed' || surveyURL.toLowerCase ==="")
        return false;
      else
        return true;
  };

  $scope.delete = function(video) {
    var sure = confirm('Are you sure you want to delete this video from the archive : ' + video['title']);
    if(sure) {
      ArchiveService.delete(video);
    } else {

    }
  };

}]);
