'use strict';

angular.module('myhonorsUser').controller('ProfilePictureEditCtrl', ['$scope', '$routeParams', '$location', '$timeout', '$fileUploader', 'UserService', 'ProfileService', function EventBrowseCtrl($scope, $routeParams, $location, $timeout, $fileUploader, UserService, ProfileService) {
    $scope.pid = $routeParams.userId;
    $scope.form = {};
    
    $scope.cropImgCoordinates; // Hold the coordinates of the crop section
    $scope.previewImgSrc = ""; // Hold the URL representing the images's data as base64 encoded string. This is used to show a preview of it.
    $scope.picUpload;          // Hold the File object ( which is the image added to the uploader )
    
    /*
     * This method is called by the jCrop directive to store the crop coordinates
     */
    $scope.setCropImgCoordinates = function( coordinates ) {
        $scope.cropImgCoordinates = coordinates;
    };
    
    $scope.showPreviewImg = function( input ) {
        $scope.readURL( input );   
    }
        
    /*
     * Accepts an input element from a form that contains a file (which should be an image), read its data and store the URL representing 
     * the images's data as base64 encoded string
     */
    $scope.readURL = function( input ) {
        if ( input.files && input.files[ 0 ] ) {
            
            // Verify whether the file uploaded is a valid image
            $scope.form.error = "";
            var fileType = input.files[ 0 ].name.split('.').pop();
            if (fileType !== 'jpg' && fileType !== 'jpeg' && fileType !== 'png' && fileType !== 'gif')
                $scope.form.error = "<strong>Sorry!</strong> You can only upload JPG, GIF, PDF and PNG file formats.";
            
            // Store the uploaded picture
            $scope.uploadedPicture = input.files[ 0 ];
            
            
            // Set up the FIleReader so that the uploaded image can read and a preview of it can be shown
            var reader = new FileReader();            
            reader.onload = function ( e ) {
                $scope.previewImgSrc = e.target.result;
                $scope.$apply();
            }
            
            reader.readAsDataURL( $scope.uploadedPicture );
        }
    }
    
    /*
     * Submits the uploaded picture along with its info to the uploader and upload the image to be processed.
     */
    $scope.submitCroppedImg = function( form, coordinates ) {
        if ( coordinates == null ) {
            alert( "Please crop part of the picture before uploading it." );
            return;
        }
        
        // Add the File object to the uploader queue as well as its info
        $scope.uploader.addToQueue( $scope.uploadedPicture, { name: $scope.uploadedPicture.name , size:  $scope.uploadedPicture.size, type:  $scope.uploadedPicture.type } );
        $scope.uploader.formData[ 0 ].coordinates = JSON.stringify( coordinates ); // Pass the cropping coordinates as a JSON string
        $scope.uploader.uploadAll();
    };
    
    
    /* File Upload set up */
    
    // Create the file uploader with options
    var uploader = $scope.uploader = $fileUploader.create({
        scope: $scope,                      
        url: 'application/user/crop-image.php',
        formData: [
            {
                userId: $scope.pid,		// Send the user pid along with the file
                path: $scope.pid + '/profile/picture/', // Relative path where the user's profile picture will be stored,
                coordinates: ''
            }
        ],
        removeAfterUpload: true
    });
    
    // If the file upload is sucessful redirect the user back to his profile
    uploader.bind( 'success', function( event, xhr, item, result ) {
        if ( result.success === true )
            $location.path( 'profile/' + $scope.pid );
        else 
            $scope.form.error = "<strong>Sorry!</strong> " + result.error;
    } ); 
    
    /*
     * Before the image is uploaded, the uploader's formData is updated with the cropping coordinates. The item's formData must be updated before
     * upload so that it reflects this change.
     */
    uploader.bind( 'beforeupload', function( event, item ) {
        item.formData = uploader.formData; // Set the item's formData to be the same to the 
    } ); 

}]);