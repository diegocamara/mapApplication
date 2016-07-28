'use strict';

describe('callsApplication.version module', function() {
  beforeEach(module('callsApplication.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
