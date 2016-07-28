'use strict';

angular.module('callsApplication.version', [
  'callsApplication.version.interpolate-filter',
  'callsApplication.version.version-directive'
])

.value('version', '0.1');
