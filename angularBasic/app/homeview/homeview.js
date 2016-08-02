'use strict';

angular.module('callsApplication.homeview', ['ngRoute', 'ngMaterial'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/homeview', {
    templateUrl: 'homeview/homeview.html',
    controller: 'homeviewController'
  });
}])

.factory('CitizenRequestService', function($http){

  var webServiceUrl = 'http://localhost:3000/';

  return{

    getCitizenRequests: function(filter){

      var url = webServiceUrl + 'getcitizenrequest/';

     return $http.get(url,{
        params:{
          initialDate: filter.initialDate,
          finalDate: filter.finalDate
        }
      }).then(function(response){

       return response.data;

      }, function(response){

         console.log(response);

      });

    }

  }

})

.controller('homeviewController', ['$scope', '$timeout', '$mdSidenav', 'CitizenRequestService', 
             function($scope, $timeout, $mdSidenav, CitizenRequestService) {

  $scope.filter = {
    initialDate: new Date(),
    finalDate: new Date()
  };

  $scope.citizenRequests = []; 

 

  $scope.toggleLeft = buildToggler('left');
  $scope.close = close('left');

  var leafletMap = L.map('map').setView([-8.0564394, -34.9221501], 12);    

  leafletMap.zoomControl.setPosition('topright');

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
  }).addTo(leafletMap);

  L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';

  var requestsLayer;   

  CitizenRequestService.getCitizenRequests($scope.filter).then(function(citizenRequests){

    if(citizenRequests && citizenRequests.length > 0){
     
      for(var citizenRequestIndex = 0; citizenRequestIndex < citizenRequests.length; citizenRequestIndex++){         

        var citizenRequest = citizenRequests[citizenRequestIndex];

        if(citizenRequest.loc.coordinates[0] !== '' && citizenRequest.loc.coordinates[1] !== ''){

        var latitude = Number(citizenRequest.loc.coordinates[0].toString().replace(',','.'));
        var longitude = Number(citizenRequest.loc.coordinates[1].toString().replace(',','.'));
        
        // console.log(citizenRequests[citizenRequestIndex]);

        var blueMarker = L.AwesomeMarkers.icon({
          icon: 'fa-exclamation-triangle animated pulse',
          markerColor: 'blue'
        });

        var marker = L.marker([latitude, longitude], {icon: blueMarker})
        .bindPopup(citizenRequests[citizenRequestIndex].descricao)
        .addTo(leafletMap);

        }
        
      }            
      
      leafletMap.invalidateSize(true);                          

    }

  });


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

