var express = require('express');
var router = express.Router();
var controllers = require('./controllers');

router.get('/getcitizenrequest/', controllers.getCitizenRequests);

router.get('/getrecifegeojsonareas', controllers.getRecifeGeoJsonAreas);

module.exports = router;
