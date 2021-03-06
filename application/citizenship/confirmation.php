<?php

require_once "../../config.php"; //Include all the necessary Firebase config variables
require_once "../../auth/FirebaseToken.php";
require_once '../lib/firebaseLib/firebaseLib.php';
	
/* After the student submits the volunteer hours information, a POST request with that data is sent to this file. An email is then sent
 * to the person specified by the student in order to confirm the volunteer work
 */
if ( $_SERVER['REQUEST_METHOD'] === 'POST' ) {
	
	// All output after POSTing will be delivered in JSON format
	header( 'Content-Type: application/json' );
	
	// Make sure that all the necessary variables were sent along in the request
	if ( !isset( $_POST[ 'agency' ] ) ||
		 !isset( $_POST[ 'referenceEmail' ] ) || 
		 !isset( $_POST[ 'referenceName' ] ) || 
		 !isset( $_POST[ 'userName' ] ) ||
		 !isset( $_POST[ 'startDate' ] ) ||
		 !isset( $_POST[ 'endDate' ] ) ||
		 !isset( $_POST[ 'activity' ] ) ||
		 !isset( $_POST[ 'hours' ] ) ) {
			
			$result = array( 'success' => false, 'error' => "All the form fields must be completed." );
			echo json_encode( $result );
			die();
		}
		
		
			
			
	// Format the email message depending wheter the volunteer work was done on one day, or in a range of dates
	$date_message = "";
	if ( $_POST[ 'startDate' ] == $_POST[ 'endDate' ] )
		$date_message = "On " . $_POST[ 'startDate' ];
	else 
		$date_message = "Between " . $_POST[ 'startDate' ] . " and " . $_POST[ 'endDate' ];
	
	
	
	/* Email variables are set below */
	$to  = $_POST[ 'referenceEmail' ];
	
	// subject
	$subject = 'Volunteer Hours Confirmation for ' . $_POST[ 'userName' ];
	
	// message
	$message = '
	<html>
	<head>
	<title>Volunteer Hours Confirmation</title>
	</head>
	<body>
	<p>Dear Volunteer Event Supervisor,</p>
	
	<p>'. $date_message . ', ' . $_POST[ 'userName' ] . ' participated in the following event for the specified number of hours as part of their citizenship requirement for The Honors College at Florida International University:
	
	<p><b>Agency/Organization:</b> ' . $_POST[ 'agency' ] . '</p>
	<p><b>Event description:</b> ' . $_POST[ 'activity' ] . '</p>
	
	<p><b>Hours served:</b> ' . $_POST[ 'hours' ] . ' </p>
	
	
	<p>Please confirm their attendance claim by clicking on the accept link: <a href="https://myhonors.fiu.edu/application/citizenship/confirmation.php?volunteerHoursID=' . $_POST[ 'volunteerHoursID' ] . '&userID=' . $_POST[ 'userID' ] .'">Accept</a></p>
	
	
	<p>If you feel that this Honors College student has not served the claimed hours, please contact me at <a href="urahman@fiu.edu">urahman@fiu.edu</a>.</p>
	
	<p>Sincerely,</p>
	
	<p>Umer Rahman<br />
	Coordinator of Student Programs<br />
	The Honors College</p>
	</body>
	</html>
	';
	
	// To send HTML mail, the Content-type header must be set
	$headers  = 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
	
	// Additional headers
	$headers .= 'To: ' . $_POST[ 'referenceName' ] . ' <' . $_POST[ 'referenceEmail' ] . '>' . "\r\n";
	$headers .= 'From: Umer Rahman <urahman@fiu.edu>' . "\r\n";
	
	// Mail it
	$email_sent = mail( $to, $subject, $message, $headers, '-f urahman@fiu.edu' );
	
	if ( !$email_sent ) {
		$result = array( 'success' => false, 'error' => "A problem ocurred when attemtping to send the confirmation email." );
		echo json_encode( $result );
		die();
	}
	
	$result = array( 'success' => true );
	echo json_encode( $result );
}

/* After the recipient of the confirmation email confirms the volunteer work and clicks the link, a GET request is sent here along with
 * the volunteer hours ID. Then, a PATCH request is sent to Firebase utilizing cURL to update the status field of that object from 
 * 'pending' to 'accepted'
 */
else {
	
	if ( isset( $_GET[ 'volunteerHoursID' ] ) && 
         isset( $_GET[ 'userID' ] ) ) {
		
		$volunteerHoursID = $_GET[ 'volunteerHoursID' ];
		$userID = $_GET[ 'userID' ];  //Panther ID of the student
		
		$tokenGen = new Services_FirebaseTokenGenerator( FIREBASE_SECRET );
		$temp_token = $tokenGen->createToken( array(), array( 'admin' => true ) );
	
	
		$fb = new fireBase( FIREBASE_VOLUNTEER_URL, $temp_token );
		// save the data to Firebase
		$path = $volunteerHoursID;
		$fb->set( $path . "/status", "accepted" );
		
		
		$fb = new fireBase( FIREBASE_USERS_URL, $temp_token );
		// save the data to Firebase
		$path = $userID . '/volunteerHours/' . $volunteerHoursID;
		$fb->set( $path . "/status", "accepted" );
	?>
	
	
<html>
    <head>
        <title>Volunteer Hours Confirmation | FIU Honors College</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="../../assets/css/bootstrap.css" />
        <link rel="stylesheet" type="text/css" href="../../assets/css/font-awesome.css" />
        <link rel="stylesheet" type="text/css" href="../../assets/css/style.css" />
    </head>
    <body>
        <img src="../../assets/img/honors-logo.jpg" style="margin: 5px 0px 0px 5px;"/>

        <div class="row">
            <div class="span6 offset4" style="margin-top: 190px;">
                <div class="box" style="width: 500px; height: 200px;">
                    <h4 class="pagination-centered" style="padding-top: 15%;">Your response has been recorded. Thank you for your time!</h4>
                </div>
            </div>
        </div>
    </body>
</html>

<?php
	
	}
}



 ?>
	
	
	
