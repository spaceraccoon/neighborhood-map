function RestaurantsViewModel() {
  var self = this;
  var init = false;

  self.query = ko.observable('');

  self.restaurantList = ko.computed(function() {
    var restaurantList = [];
    for (var i = 0; i < restaurants.length; i++) {
      if (restaurants[i].name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {
        restaurantList.push(restaurants[i]);
      }
    }
    return restaurantList;
  }, this);

  self.refreshMarkers = function() {
    var res_ids = [];
    for (var restaurant in self.restaurantList()) {
      var res_id = self.restaurantList()[restaurant].res_id;
      res_ids.push(res_id)
    }

    for (var marker in markers) {
      if (res_ids.indexOf(markers[marker].res_id) < 0) {
        markers[marker].setVisible(false);
      } else {
        markers[marker].setVisible(true);
      }
    }
  };
}

function initMap() {
  getRestaurants();

  var styles = [{
    "featureType": "landscape",
    "stylers": [{
      "hue": "#FFBB00"
    }, {
      "saturation": 43.400000000000006
    }, {
      "lightness": 37.599999999999994
    }, {
      "gamma": 1
    }]
  }, {
    "featureType": "road.highway",
    "stylers": [{
      "hue": "#FFC200"
    }, {
      "saturation": -61.8
    }, {
      "lightness": 45.599999999999994
    }, {
      "gamma": 1
    }]
  }, {
    "featureType": "road.arterial",
    "stylers": [{
      "hue": "#FF0300"
    }, {
      "saturation": -100
    }, {
      "lightness": 51.19999999999999
    }, {
      "gamma": 1
    }]
  }, {
    "featureType": "road.local",
    "stylers": [{
      "hue": "#FF0300"
    }, {
      "saturation": -100
    }, {
      "lightness": 52
    }, {
      "gamma": 1
    }]
  }, {
    "featureType": "water",
    "stylers": [{
      "hue": "#0078FF"
    }, {
      "saturation": -13.200000000000003
    }, {
      "lightness": 2.4000000000000057
    }, {
      "gamma": 1
    }]
  }, {
    "featureType": "poi",
    "stylers": [{
      "hue": "#00FF6A"
    }, {
      "saturation": -1.0989010989011234
    }, {
      "lightness": 11.200000000000017
    }, {
      "gamma": 1
    }]
  }];

  largeInfowindow = new google.maps.InfoWindow();

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 41.3083,
      lng: -72.9279
    },
    zoom: 14,
    styles: styles,
    mapTypeControl: false
  });

  // Helper to add pan, bounce and Infowindow on click.
  function markerHelper(marker) {
    return function() {
      map.panTo(marker.position);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 750);
      populateInfoWindow(marker, largeInfowindow);
    };
  }

  for (var i = 0; i < restaurants.length; i++) {
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: {
        lat: restaurants[i].lat,
        lng: restaurants[i].lng
      },
      title: restaurants[i].name,
      map: map,
      icon: 'images/pizza_icon.png',
      animation: google.maps.Animation.DROP,
      res_id: restaurants[i].res_id
    });

    marker.setVisible(false);
    // Push the marker to our array of markers.
    markers.push(marker);

    // Change icon size on mouseover
    marker.addListener('mouseover', function() {
      this.setIcon('images/pizza_icon_large.png');
    });
    marker.addListener('mouseout', function() {
      this.setIcon('images/pizza_icon.png');
    });

    marker.addListener('click', markerHelper(marker));
  }

  // Initialize
  RestaurantViewModel = new RestaurantsViewModel();
  ko.applyBindings(RestaurantViewModel);
  linkMarkers(markers);

};

function mapError() {
  // Error handling
  alert('Failed to load Google Maps API.');
};

function linkMarkers(markers) {
  // Wow, a closure! Adds event listener to open infowindow for link clicks.
  function linkHelper(marker) {
    return function() {
      map.panTo(marker.position);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 750);
      populateInfoWindow(marker, largeInfowindow);
    };
  }

  for (var i = 0; i < markers.length; i++) {
    var link = document.getElementById(markers[i].res_id);
    var marker = markers[i];
    link.addEventListener('click', linkHelper(marker));
  }
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    // Sent AJAX request to Zomato, failing gracefully if error found.
    $.ajax({
      url: "https://developers.zomato.com/api/v2.1/restaurant",
      type: "GET",
      data: {
        res_id: marker.res_id
      },
      headers: {
        "user-key": "a372a4ad119e5e91d5ae63c54225f12d"
      },
      dataType: "json",

      success: function(data) {
        var cost = "Not found";
        var rating = data.user_rating.rating_text;
        if (data.average_cost_for_two !== 0) {
          cost = "$" + data.average_cost_for_two.toString();
        }
        infowindow.setContent('<h5>' + marker.title + '</h5>' +
          '<li>Rating: ' + rating + '</li><li>Average cost for two: ' + cost + '</li>');

      },
      error: function(err) {
        console.log(err);
        infowindow.setContent('<h5>' + marker.title + '</h5>' + 'No data found.');
      }
    });

    infowindow.open(map, marker);
  }
}

function getRestaurants() {
  // Sent AJAX request to Zomato, failing gracefully if error found.
  $.ajax({
    url: "restaurants.json",
    type: "GET",
    dataType: "json",

    success: function(data) {
      console.log(data);
    },
    error: function(err) {
      console.log(err);
      infowindow.setContent('<h5>' + marker.title + '</h5>' + 'No data found.');
    }
  });
}

// Global variables
var map = null;
var markers = [];
var largeInfowindow = null;
var restaurants = null;
var RestaurantViewModel = null;