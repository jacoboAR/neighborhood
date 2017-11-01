var ko = require('knockout');
var locations = require('./data.js');
var credentials = require('./credentials.js');

import '../css/main.css';

// Initialize the map
var map;
window.initMap = function () {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 42.432190, lng: -8.645293 }, 
        zoom: 15
    });
    ko.applyBindings(new ViewModel());
}

// A constructor object to store information for each place
var Place = function(data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.description = ko.observable('');
}

var ViewModel = function () {
    let that = this;
    this.placeList = ko.observableArray([]);
    for (let l of locations) {
        that.placeList.push(new Place(l));
    }
    let infowindow = new google.maps.InfoWindow({
        maxWidth: 200,
    });
    let marker;
    for (let p of that.placeList()) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(p.lat(), p.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        p.marker = marker;

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search?client_id=UZFIFA33KYVR3W5RJ3DC2G4WSUK010I3SPKDBTPA1JEMNAHG&client_secret=MBO3GW4POHNKN4FSMA3NQY2WDV5UO3PGH4ZAOWWQVQC14T1D&v=20171101&ll=' + p.lat() + ',' + p.lng(),
            dataType: 'json'
        }).done(function(result){
                let response = result.response.venue;

                // Content of the infowindow
                let contentString = '<div id="iWindow"><h4>' + p.name() + '</h4></div>';

                // Add infowindows credit http://you.arenot.me/2010/06/29/google-maps-api-v3-0-multiple-markers-multiple-infowindows/
                google.maps.event.addListener(p.marker, 'click', function () {
                    infowindow.open(map, this);
                    // Bounce animation credit https://github.com/Pooja0131/FEND-Neighbourhood-Project5a/blob/master/js/app.js
                    p.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        p.marker.setAnimation(null);
                    }, 500);
                    infowindow.setContent(contentString);
                    map.setCenter(p.marker.getPosition());
        });
        }).fail(function(e){
            infowindow.setContent('<h5>Foursquare data is unavailable. Please try refreshing later.</h5>');
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, this);
            p.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                p.marker.setAnimation(null);
            }, 500);
        });
    }
};
