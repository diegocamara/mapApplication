var models = require('../models');
var services = require('../services');

exports.getCitizenRequest = function(req, res){

  var url;
    services.obterUrlCsvDemandasRecife(function(urlRequest){
      
      url = urlRequest;

      var jsonLoader = services.obterJsonLoaderDemandasRecife();

      jsonLoader.getJsonFromWeb(url, function(json){

        for(var citizenRequestIndex = 0; citizenRequestIndex < json.length; citizenRequestIndex++){
          
          var citizenRequest = new models.CitizenRequest({            
            ano: json[citizenRequestIndex].ano,
            mes: json[citizenRequestIndex].mes,
            numeroProcesso: json[citizenRequestIndex].processo_numero,
            data: json[citizenRequestIndex].solicitacao_data,
            hora: json[citizenRequestIndex].solicitacao_hora,
            descricao: json[citizenRequestIndex].solicitacao_descricao,
            regional: json[citizenRequestIndex].solicitacao_regional,
            bairro: json[citizenRequestIndex].solicitacao_bairro,
            localidade: json[citizenRequestIndex].solicitacao_localidade,
            endereco: json[citizenRequestIndex].solicitacao_endereco,
            microregiao: json[citizenRequestIndex].solicitacao_microrregiao,
            plantao: json[citizenRequestIndex].solicitacao_plantao,
            origemChamado: json[citizenRequestIndex].solicitacao_origem_chamado,
            loc:{
              type: {type: String, default: 'Point'},
              coordinates: [json[citizenRequestIndex].latitude, json[citizenRequestIndex].longitude]
            },
            vitimas: json[citizenRequestIndex].solicitacao_vitimas,
            vitimasFatais: json[citizenRequestIndex].solicitacao_vitimas_fatais,
            situacao: json[citizenRequestIndex].processo_situacao,
            tipo: json[citizenRequestIndex].processo_tipo,
            origemProcesso: json[citizenRequestIndex].processo_origem,
            localizacaoProcesso: json[citizenRequestIndex].processo_localizacao,
            statusProcesso: json[citizenRequestIndex].processo_status,
            dataConclusaoProcesso: json[citizenRequestIndex].processo_data_conclusao
          });        
          
        }

        res.send(json);

      });

  }); 

}

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
