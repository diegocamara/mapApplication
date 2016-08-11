var models = require('../models');
var services = require('../services');

exports.getCitizenRequests = function(req, res){

  var initialDate = req.query.initialDate;
  var finalDate = req.query.finalDate;  
  
  var CitizenRequest = new models.CitizenRequest({});

  CitizenRequest.collection.find({data: {$gte: new Date(initialDate), $lte: new Date(finalDate)}}).toArray(function(err, result){    
    
    if(err){
      throw err;
    }

    res.send(result);

    
  });

}

exports.getRecifeGeoJsonAreas = function(req, res){

  var geoJsonUrl = 'http://dados.recife.pe.gov.br/storage/f/2013-07-15T15%3A17%3A15.285Z/bairros.geojson';

  var request = require('request');

  request.get(geoJsonUrl, function(error, response, body){

    if(error){
      throw err;
    }    
        
    res.send(body);

  });

}