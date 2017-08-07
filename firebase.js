/*
 * Code added for display worker markers toggle.
 *  Notes: these functions are outside document ready function since it needs to be
 *  exposed for access to the toggle button in index.html
 * markerDict was already storing these, so we'll use that an loop through and setVisible
 * on each marker.  Done.  Except, what if displayMorks is false and an new worker checks in?
 *   This is why we have disployWorkerLocations var,  in lines 103-107, we now assign the checkedIn status
 *    to marker objects,  now we also check if they are checkedIn in the updateWorkerMarkers function.
 */
var markerDict = {};  // "dictionary" to store marker objects
var dispayWorkerLocations = true;
function toggleDisplayWorkerLocation() {
  dispayWorkerLocations =  !dispayWorkerLocations;
  updateWorkerMarkers();
}

function updateWorkerMarkers() {
  for(var key in markerDict) {
    var marker = markerDict[key];
    if(marker != null) {
      // if checkedIn, then display based on toggle, otherwise don't show
        if(marker.isCheckedIn) {
            marker.setVisible(dispayWorkerLocations);
        } else {
          marker.setVisible(false);
        }
    }
  }
}

$( document ).ready(function() {

// Initialize Firebase

var config = {
  apiKey: "AIzaSyAKMvmrrZdf4y3O2hprmZ-4hp9XURvCJjY",
  authDomain: "composite-dream-138119.firebaseapp.com",
  databaseURL: "https://composite-dream-138119.firebaseio.com",
  storageBucket: "composite-dream-138119.appspot.com",
  messagingSenderId: "347247603096"
};
firebase.initializeApp(config);

// Pull from Firebase database

var database = firebase.database();
var workerlist = document.getElementById('workerlist');
var knockrequest = document.getElementById('knockrequest');
var worker_count_ref = document.getElementById('worker_count');
var worker_count = 0;
var order_count_ref = document.getElementById('order_count');
var order_count = 0;
var pickupaddress = document.getElementById('pickupaddress');
var deliveryaddress = document.getElementById('deliveryaddress');


/*
 * Firebase reference to worker branch in db, this function will be called
 *  once when the code is started, then again when any child is added.  Since we
 *  know this will be called at startup we'll use this to setup placeholders for
 *  the workers's data.
 *
 * 1. when child added, check if we've already created a marker for that user,
       if not, create one
   2. if no marker found we'll also create a db ref to that worker and listen for
       changes (to update when checkedIn changes)
   3. Also, if no marker we'll create a db ref to the goelocation so that we
       can move the marker when location changes
 */

// Workers

database.ref('worker').on('child_added', function(snapshot) {
  var data = snapshot.val();
  var workerName = data.full_name;

  var photoUri = data.photoUri;
  var icon = null;
  if(photoUri != null) {
    icon = {
      url: photoUri,
      scaledSize: new google.maps.Size(33,33)
    };
  }
  var key = snapshot.key;

  // 1. check if we're created a marker for this worker
  if(markerDict[key] == null) {
    // create a marker for each worker
    var marker = new google.maps.Marker({
       map: map,
       draggable: false,
       title: workerName,
       icon: icon
    });
    // store the marker in the markerDict (so we can grab the marker later)
    markerDict[key] = marker;

    // 2. setup a firebase ref to the child so that we can listen for when checkedIn is
    //  changed
    database.ref('worker/' + key ).on('value', function(snapshot) {
      var isCheckedIn = snapshot.val().checkedIn;
      // lookup the marker and set visability
      var myMarker = markerDict[snapshot.key];
      if (myMarker != null){
        // set isCheckedIn on marker so that we con check that in dispayWorkerLocations function
        myMarker.isCheckedIn = isCheckedIn;
        // call updateWorkerMarkers to refresh display
        updateWorkerMarkers();
      }

      // dynamically update AdminWeb
      if(isCheckedIn) {
        const li = document.createElement('li');
        li.innerText = workerName;
        li.id = snapshot.key;
        workerlist.appendChild(li);

        worker_count++;
        worker_count_ref.innerText = worker_count;
        }   else {
              var data = snapshot.val();
              var liToRemove = document.getElementById(snapshot.key);
              // liToRemove may be null if they were never added to the form (if user
              //   checkedIn == false at page load)
              if(liToRemove != null) {
                liToRemove.remove();
                worker_count--;
              }
              worker_count_ref.innerText = worker_count;
      }
     });

     // 3. setup a ref to the geolocation so the marker is placed and moved as needed
     var responderPosition = database.ref('geofire_worker/' + key);
     responderPosition.on('value', function(snapshot) {

       var myMarker = markerDict[snapshot.key];
       if(myMarker != null) {
         var lat = snapshot.val().l[0];
         var lng = snapshot.val().l[1];

        changeMarkerPosition(myMarker, lat , lng  );
       }
     });
  } // end long if statement
});

// Orders

database.ref('request').on('child_added', function(snapshot) {
  var data = snapshot.val();

  var objectId = data.requestText;
  const li = document.createElement('li');
  li.innerText = objectId;
  li.id = snapshot.key;
  knockrequest.appendChild(li);
  order_count++;
  order_count_ref.innerText = order_count;
});

database.ref('request').on('child_removed', function(snapshot) {
  var data = snapshot.val();
  // var objectId = data.requestText;
  var liToRemove = document.getElementById(snapshot.key);
  liToRemove.remove();
  order_count--;
  order_count_ref.innerText = order_count;
});

function changeMarkerPosition(markerParam, lat , lng) {
  var latlng = new google.maps.LatLng(lat, lng);
    markerParam.setPosition(latlng);
}

// Heatmap

database.ref('location').on('child_added', function(snapshot) {

  var data = snapshot.val();
  var pickupAddress = data.address;
  const li = document.createElement('li');
  li.innerText = pickupAddress;
  li.id = snapshot.key;
  pickupaddress.appendChild(li);


});



database.ref('location').on('child_removed', function(snapshot) {
  var data = snapshot.val();
  var liToRemove = document.getElementById(snapshot.key);
  liToRemove.remove();
});


database.ref('knock_user').on('child_added', function(snapshot) {

  var data = snapshot.val();
  var deliveryAddress = data.defaultDeliveryLocation.address
  const li1 = document.createElement('li');
  li1.innerText = deliveryAddress;
  li1.id = snapshot.key;
  deliveryaddress.appendChild(li1);


});

database.ref('knock-user').on('child_removed', function(snapshot) {
  var data = snapshot.val();
  var liToRemove = document.getElementById(snapshot.key);
  liToRemove.remove();
});


});
