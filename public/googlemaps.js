// Google Maps API
var map;
var infoWindow;
var heatmap;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: {lat: 42.912346, lng: -78.877747},
    mapTypeId: 'roadmap'
  });

  // Define the LatLng coordinates for the polygon.
  var knockCoords = [{
      lat: 42.927727,
      lng: -78.889378
    }, {
      lat: 42.928160,
      lng: -78.867796
    }, {
      lat: 42.922313,
      lng: -78.867343
    }, {
      lat: 42.922258,
      lng: -78.863740
    }, {
      lat: 42.895576,
      lng: -78.873580
    }, {
      lat: 42.896105,
      lng: -78.876650
    }, {
      lat: 42.902906,
      lng: -78.888449
    }
  ];

  // Construct the polygon.
  var knockDeliveryArea = new google.maps.Polygon({
    paths: knockCoords,
    strokeColor: '#A9A9A9',
    strokeOpacity: 1,
    strokeWeight: 3,
    fillColor: '#F0FFF0',
    fillOpacity: 0.3
  });
  knockDeliveryArea.setMap(map);

  // Add a listener for the click event.
  knockDeliveryArea.addListener('click', showArrays);

  infoWindow = new google.maps.InfoWindow;

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),
    map: map
  });

  var marker = new google.maps.Marker({
    map: map,
    draggable: false,
    animation: google.maps.Animation.DROP,
    icon: 'assets/knock_hq_map_marker.png',
    title: "Knock HQ",
    position: {lat: 42.912628, lng: -78.877682},
    position: map.getCenter(),
    url: 'http://knockconcierge.com/'
   });
      marker.addListener('click', function() {
        window.location.href = marker.url;
      });
  }

/** @this {google.maps.Polygon} */
function showArrays(event) {
  var vertices = this.getPath();

  var contentString = '<b>Knock Delivery Area</b><br>' +
    'You are inside the delivery area and can place an order now! <br>' + event.latLng.lat() + ',' + event.latLng.lng() +
    '<br>';

  infoWindow.setContent(contentString);
  infoWindow.setPosition(event.latLng);

  infoWindow.open(map);
}

// Button
function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

// Heatmap
function getPoints() {
  return [
    new google.maps.LatLng(42.920204, -78.876773),
    new google.maps.LatLng(42.920202, -78.876775),
    new google.maps.LatLng(42.920202, -78.876774),
    new google.maps.LatLng(42.920202, -78.876779),
    new google.maps.LatLng(42.920244, -78.876753)
  ];
}
