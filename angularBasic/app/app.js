'use strict';

// Declare app level module which depends on views, and components
angular.module('callsApplication', [
  'ngRoute',
  'ngMaterial',
  'callsApplication.homeview',
  'callsApplication.version'
]).
config(['$locationProvider', '$routeProvider', '$mdDateLocaleProvider', function($locationProvider, $routeProvider, $mdDateLocaleProvider) {
  $locationProvider.hashPrefix('!');

  // $mdDateLocaleProvider.parseDate = function(date){
  //   var moment = moment(date, 'DD-MM-YYYY', true);
  //   console.log(moment);
  //   return moment.isValid() ? moment.toDate() : new Date(NaN);
  // }

   $mdDateLocaleProvider.formatDate = function(date) {
    return moment(date).format('DD/MM/YYYY');
  };

  $routeProvider.otherwise({redirectTo: '/homeview'});
}]);
