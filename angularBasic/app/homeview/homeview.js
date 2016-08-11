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
          initialDate: getConsultDate(filter.initialDate),
          finalDate: getConsultDate(filter.finalDate) 
        }
      }).then(function(response){

       return response.data;

      }, function(response){

        //  console.log(response);

      });

    }

  }

})

.factory('LocationGeoJsonService', function($http){

  var webServiceUrl = 'http://localhost:3000/';

  var geoJsonUrl = webServiceUrl + 'getrecifegeojsonareas';

  return {

    getRecifeGeoJsonAreas: function(){

      return $http.get(geoJsonUrl)
      .then(function(response){        

        return response.data;

      }, function(){

      });

    }

  }

})

.controller('homeviewController', ['$scope', '$timeout', '$mdSidenav', 'CitizenRequestService', 'LocationGeoJsonService',
             function($scope, $timeout, $mdSidenav, CitizenRequestService, LocationGeoJsonService) {              
   
  $scope.citizenRequests = []; 

  socket.on('requests update', function(requests){   
   $scope.citizenRequests = requests; 
  });

  var dataAtual = new Date();
  
  $scope.filter = {
    initialDate: dataAtual,
    finalDate: dataAtual
  };  
    
  $scope.maxDate = $scope.filter.finalDate;

  $scope.minDate = $scope.filter.initialDate;

  

  $scope.changeInitialDate = function(){
    $scope.minDate = $scope.filter.initialDate;
  } 

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

  var blueMarker = L.AwesomeMarkers.icon({
          icon: 'fa-exclamation-triangle animated infinite pulse',
          markerColor: 'orange'
        });        

  $scope.getCitizenRequests = function(){

    CitizenRequestService.getCitizenRequests($scope.filter).then(function(citizenRequests){

    if(citizenRequests && citizenRequests.length > 0){     
     
      var markers = [];     

      for(var citizenRequestIndex = 0; citizenRequestIndex < citizenRequests.length; citizenRequestIndex++){         

        var citizenRequest = citizenRequests[citizenRequestIndex];

        if(citizenRequest.loc && citizenRequest.loc.coordinates[0] !== '' && citizenRequest.loc.coordinates[1] !== ''){

        var latitude = Number(citizenRequest.loc.coordinates[0].toString().replace(',','.'));
        var longitude = Number(citizenRequest.loc.coordinates[1].toString().replace(',','.'));
        
        // console.log(citizenRequests[citizenRequestIndex]);       

        var marker = L.marker([latitude, longitude], {icon: blueMarker})
        .bindPopup(citizenRequests[citizenRequestIndex].descricao);

        markers.push(marker);

        }
        
      }                        

    }

    if(requestsLayer){
        leafletMap.removeLayer(requestsLayer);
      }
      
      requestsLayer = L.layerGroup(markers);          
      requestsLayer.addTo(leafletMap);


      leafletMap.invalidateSize(true); 

    });

    LocationGeoJsonService.getRecifeGeoJsonAreas().then(function(geojson){
              
          var featureStyle = {
            "weight": 1,
            "opacity": 0.65
          }

          var rpasLayers = L.geoJson(geojson.features, {
            style: featureStyle,
            onEachFeature: onEachFeature
          }); 

          var rpas = {
            "Bairros": rpasLayers
          }
         
          L.control.layers(null, rpas).addTo(leafletMap);

        });

  }

  $timeout(function() {
    leafletMap.invalidateSize();
    $scope.getCitizenRequests();
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

function getConsultDate(date){

    var year = date.getFullYear().toString();
    var mouth = Number(date.getMonth() + 1).toString();
    var day = date.getDate().toString();

    var dateFormat = year + '-' + mouth + '-' + day + ' 00:00:00';

    return new Date(dateFormat);
  }

function onEachFeature(feature, layer){

  if(feature.properties){    
    layer.bindPopup(feature.properties.bairro_nome);
  }

}

function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature){

  var style = {
    fillColor: getColor(),
    weight: 2,
    opacity: 0.65,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  }

  return style;

}