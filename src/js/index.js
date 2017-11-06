var ko = require('knockout');
var locations = require('./data.js');
var credentials = require('./credentials.js');

import 'bootstrap';
import '../css/main.scss';

// Initialize the map
var map;
window.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 42.432190, lng: -8.645293 }, 
        zoom: 15,
        zoomControl: false
    });
    ko.applyBindings(new ViewModel());
}

window.errorHandling = function() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}

// A constructor object to store information for each place
var Place = function(data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.id = ko.observable(data.id);
    this.photoPre = ko.observable('');
    this.photoSuf = ko.observable('');
}

// ViewModel
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
    // Get the photo on Foursquare
    for (let p of that.placeList()) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(p.lat(), p.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        p.marker = marker;
        //AJAX request
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + p.id() + '?client_id=' + credentials.client_id + '&client_secret='+ credentials.client_secret + '&v=20171101', 
            dataType: 'json'
        }).done(function(result){
            let data = result.response.venue;

            let bestPhoto = data.hasOwnProperty('bestPhoto') ? data.bestPhoto : '';
            if (bestPhoto.hasOwnProperty('prefix')) {
                p.photoPre(bestPhoto.prefix || '');
            }

            if (bestPhoto.hasOwnProperty('suffix')) {
                p.photoSuf(bestPhoto.suffix || '');
            }

            let contentString = '<div id="InfoWindow"><h6>' + p.name() + '</h6>' + 
            '<img src="' + p.photoPre() + '110x110'  + p.photoSuf() + '" alt="Image"></div>';

            google.maps.event.addListener(p.marker, 'click', function () {
                infowindow.open(map, this);
                p.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    p.marker.setAnimation(null);
                }, 500);
                infowindow.setContent(contentString);
                map.setCenter(p.marker.getPosition());
        });
        }).fail(function(e){
            infowindow.setContent('<h6>Sorry, there was an issue loading data from Foursquare</h6>');
        });


        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, this);
            p.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                p.marker.setAnimation(null);
            }, 500);
        });
    }
    // Activate the marker when user click
    that.activateMarker = function (p) {
        google.maps.event.trigger(p.marker, 'click');
    };

    //Input search funcionality
    that.visible = ko.observableArray();
    
    that.placeList().forEach(function (place) {
        that.visible.push(place);
    });

    that.userInput = ko.observable('');

    that.filterMarkers = function () {
        var searchInput = that.userInput().toLowerCase();
        that.visible.removeAll();
        that.placeList().forEach(function (place) {
            place.marker.setVisible(false);
            if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
                that.visible.push(place);
            }
        });
        that.visible().forEach(function (place) {
            place.marker.setVisible(true);
        });
    };
    
    //Collapse the navar
    that.activeNavbar = ko.observable(false);
    that.collapseNavbar = function() {
        that.activeNavbar(!that.activeNavbar());
    };

};
