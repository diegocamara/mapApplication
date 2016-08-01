var models = require('../models');
var services = require('../services');

exports.insertUserPost = function(req, res){

  var categoria = req.body.categoria;
  var comentarios = req.body.comentarios;
  var severidade = req.body.severidade;
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  var facebookId = req.body.facebookId;

  var alerta = new models.Alerta({
    categoria: categoria,
    comentarios: comentarios,
    severidade: severidade,
    latitude: latitude,
    longitude: longitude,
    facebookId: facebookId
  });

  alerta.save(function(err, alerta){

    if(err){
      throw err;
    }

    res.send(alerta);

  });

}
