var request = require('request');
var Converter = require('csvtojson').Converter;


var JsonLoader = function(){
}

JsonLoader.prototype.getJsonFromWeb = function(url, callBack){
  
  var converter = new Converter({delimiter: ";"});

  converter.on('end_parsed', function(jsonArray){
    callBack(null, jsonArray);   
  });

  request.get(url, function(error, response, body){

    if(error){
      throw error;
    }

   if(response.statusCode != 200){
     callBack({error:response.statusCode}, null);
   }

  }).pipe(converter);

}

module.exports = new JsonLoader();
