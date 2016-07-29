var fs = require('fs');

var JsonLoader = function(){
}

JsonLoader.prototype.loadJSON = function(filePath, encode, callBack){

  fs.readFile(filePath, encode, function(err, data){

    if(err){
      throw err;
    }

    callBack(data);

  });

}

module.exports = new JsonLoader();
//
// fs.readFile('hoteis.json', 'utf8', function(err, data){
//
//
//
//   contents = JSON.parse(data);
//
//   for(var object in contents){
//
//     var hotel_ = {
//       nome: contents[object].nome,
//       endereco: contents[object].endereco,
//       telefone: contents[object].telefone,
//       site: contents[object].site,
//       latitude: contents[object].latitude,
//       longitude: contents[object].longitude
//     }
//
//     hotel.create(hotel_).then(function(){
//     });
//
//   }
//
// });
