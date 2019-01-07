var app = angular.module("myApp", []);

app.constant("states", [
    { "code": "ap", "name": "Andhra Pradesh" },
    { "code": "an", "name": "Andaman and Nicobar Islands" },
    { "code": "ar", "name": "Arunachal Pradesh" },
    { "code": "as", "name": "Assam" },
    { "code": "br", "name": "Bihar" },
    { "code": "cg", "name": "Chhattisgarh" },
    { "code": "ch", "name": "Chandigarh" },
    { "code": "dl", "name": "Delhi" },
    { "code": "dd", "name": "Daman and Diu" },
    { "code": "dn", "name": "Dadra and Nagar Haveli" },
    { "code": "ga", "name": "Goa" },
    { "code": "gj", "name": "Gujarat" },
    { "code": "hr", "name": "Haryana" },
    { "code": "hp", "name": "Himachal Pradesh" },
    { "code": "jk", "name": "Jammu & Kashmir" },
    { "code": "jh", "name": "Jharkhand" },
    { "code": "ka", "name": "Karnataka" },
    { "code": "kl", "name": "Kerala" },
    { "code": "ld", "name": "Lakshadweep" },
    { "code": "mp", "name": "Madhya Pradesh" },
    { "code": "mh", "name": "Maharashtra" },
    { "code": "mn", "name": "Manipur" },
    { "code": "ml", "name": "Meghalaya" },
    { "code": "mz", "name": "Mizoram" },
    { "code": "nl", "name": "Nagaland" },
    { "code": "or", "name": "Orissa" },
    { "code": "pb", "name": "Punjab" },
    { "code": "py", "name": "Pondicherry" },
    { "code": "rj", "name": "Rajasthan" },
    { "code": "sk", "name": "Sikkim" },
    { "code": "tn", "name": "Tamil Nadu" },
    { "code": "tr", "name": "Tripura" },
    { "code": "ts", "name": "Telangana" },
    { "code": "up", "name": "Uttar Pradesh" },
    { "code": "uk", "name": "Uttarakhand" },
    { "code": "wb", "name": "West Bengal" }
]);

app.service('Map', function ($q, $rootScope, states) {

    this.near = function () {
        mapNearby();
    }

    function mapNearby() {
        var loc = { lat: $rootScope.lat, lng: $rootScope.lng };

        map = new google.maps.Map(document.getElementById('map'), {
            center: loc,
            zoom: 12
        });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: loc,
            radius: 8000,
            type: ['gas_station']
        }, callback);
    }


    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            $rootScope.routeNavigated = false;
            $rootScope.$apply();
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }
    }

    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
            getPlaceDetails(place);
        });
    }

    function getPlaceDetails(place) {
        var service = new google.maps.places.PlacesService($rootScope.map);
        service.getDetails({
            placeId: place.place_id
        }, function (place, status) {
            $rootScope.selectedPlace = place;
            var picArr = [];
            if ($rootScope.selectedPlace.photos != undefined) {
                $rootScope.selectedPlace.photos.forEach(element => {
                    picArr.push(element.getUrl());
                });
            }
            $rootScope.selectedPlace.picsUrl = picArr;
            $rootScope.selectedPlace.lat = place.geometry.location.lat();
            $rootScope.selectedPlace.lng = place.geometry.location.lng();
            $rootScope.$apply();
        });
    }

    this.calculateAndDisplayRoute = function () {
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            center: { lat: $rootScope.lat, lng: $rootScope.lng }
        });
        directionsDisplay.setMap(map);

        directionsService.route({
            origin: { lat: $rootScope.lat, lng: $rootScope.lng },
            destination: { lat: $rootScope.selectedPlace.lat, lng: $rootScope.selectedPlace.lng },
            travelMode: 'DRIVING'
        }, function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
                $rootScope.routeNavigated = true;
                $rootScope.$apply();
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    this.init = function () {
        infoWindow = new google.maps.InfoWindow;
        var geocoder = new google.maps.Geocoder;
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $rootScope.map = new google.maps.Map(
                    document.getElementById("map"),
                    {
                        // center: { lat: 15.49, lng: 73.82 },
                        center: { lat: position.coords.latitude, lng: position.coords.longitude },
                        zoom: 16
                    }
                );
                this.places = new google.maps.places.PlacesService($rootScope.map);
                
                $rootScope.lat = position.coords.latitude;
                $rootScope.lng = position.coords.longitude;
                var pos = {
                    lat: $rootScope.lat,
                    lng: $rootScope.lng
                };

                infoWindow.setPosition(pos);
                infoWindow.setContent('Location found.');
                infoWindow.open($rootScope.map);
                $rootScope.map.setCenter(pos);

                var latlng = { lat: $rootScope.lat, lng: $rootScope.lng };
                geocoder.geocode({ 'location': latlng }, function (results, status) {
                    if (status === 'OK') {
                        if (results[0]) {
                            for (i = 0; i < states.length; i++) {
                                if (results[0].formatted_address.toLowerCase().includes(states[i].name.toLowerCase())) {
                                    $rootScope.CurrentLocation = states[i];
                                    $rootScope.$apply();
                                    break;
                                }
                            }
                            mapNearby();
                        } else {
                            $rootScope.CurrentLocation = states[7];
                            $rootScope.$apply();
                            window.alert('No results found');
                        }
                    } else {
                        $rootScope.CurrentLocation = states[7];
                        $rootScope.$apply();
                    }
                });
                //   }
            }, function () {
                $rootScope.CurrentLocation = states[7];
                $rootScope.$apply();
            });
        } else {
            // Browser doesn't support Geolocation
            $rootScope.CurrentLocation = states[7];
            $rootScope.$apply();
        }
    }

});

app.controller("myCtrl", function ($scope, Map, $rootScope, states, coService) {
    $scope.states = states;
    $scope.petrolPriceData = {};
    $scope.dieselPriceData = {};

    $scope.changeLocation = function (state) {
        $rootScope.CurrentLocation = state;
    }

    $scope.getFuelPrices = function (code) {
        $scope.showLoading = true;
        var data = {
            "fuel": "p",
            "state": $rootScope.CurrentLocation.code
        }

        coService.Post("https://fuelprice.p.rapidapi.com/beta", data).then(res => {
            $scope.petrolPriceData = res;
            data.fuel = "d";
            coService.Post("https://fuelprice.p.rapidapi.com/beta", data).then(res => {
                $scope.dieselPriceData = res;
                $scope.showLoading = false;
            });
        });
    }


    $scope.$watch('CurrentLocation', function (newValue, oldValue, scope) {
        if ($rootScope.CurrentLocation != undefined) {
            $scope.getFuelPrices($rootScope.CurrentLocation.code);
        }
    });

    $scope.showDirection = function () {
        Map.calculateAndDisplayRoute();
    }

    $scope.resetNearby = function () {
        Map.near();
    }

    Map.init();

});


app.factory('coService', function ($http, $location) {
    return {
        'Post': function (endpoint, data) {

            var promise = $http({
                url: endpoint,
                method: "POST",
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': "k3r3fj3POnmshRCYOZu2tVl0sFGqp15DL2KjsnzdiXsq979CkJ"
                },
                data: JSON.stringify(data)
            }).then(function (response) {
                return response.data;
            });
            return promise;
        }

    }
});