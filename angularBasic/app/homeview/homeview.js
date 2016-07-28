'use strict';

angular.module('callsApplication.homeview', ['ngRoute', 'ngMaterial'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/homeview', {
    templateUrl: 'homeview/homeview.html',
    controller: 'homeviewController'
  });
}])

.controller('homeviewController', ['$scope', '$timeout', '$mdSidenav', function($scope, $timeout, $mdSidenav) {

  $scope.toggleLeft = buildToggler('left');
  $scope.close = close('left');

  var leafletMap = L.map('map').setView([-8.0564394, -34.9221501], 14);

  leafletMap.zoomControl.setPosition('topright');

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
  }).addTo(leafletMap);
  

  $timeout(function() {
    leafletMap.invalidateSize();
  }, 10);



  function buildToggler(navId){
    return function(){
      $mdSidenav(navId)
      .toggle()
      .then(function(){
        // alert('Toggle is done.');
      });
    }
  }

  function close(navId){
    return function(){
      $mdSidenav(navId)
      .close()
      .then(function(){
        // alert('Close is done.');
      });
    }
  }

}]);

