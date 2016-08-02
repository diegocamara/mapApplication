var jsonLoader = require('./jsonloader');

module.exports = {

    obterJsonLoaderDemandasRecife: function(){      
      return obterJsonLoaderDemandasRecife();
    },
        
    verificarNovosDados: function(callback){
          
      var Agenda = require('agenda');

      var mongoConnectionString = "mongodb://admin:admin12345@ds031925.mlab.com:31925/realtimerequestdb";

      var agenda = new Agenda({priority:'high', db: {address: mongoConnectionString}});

      agenda.define('job', 
                    {priority: 'highest',
                    concurrency: 1,
                    lockLimit: 0,
                    lockLifetime: 0}, 
                    function(job, done){

        console.log('Verificando novos dados...');   

        try{

          getCitizenRequest(function(json){                 
           done();
           console.log('Bath done.');
          });

        }catch(err){
           console.err(err);
           done();
        }       

      });      

      agenda.on('ready', function(){

        agenda.every('15 minutes', 'job');

        agenda.start();
        console.log('Agenda starting...');

      });    

      agenda.on('error', function(){

      });  

    }

}

 
  function getCitizenRequest(callback){
            
      var url;

      obterUrlCsvDemandasRecife(function(urlRequest){
        
        url = urlRequest;
        console.log(url);       

        jsonLoader.getJsonFromWeb(url, function(json){
          
          var models = require('../models');
          var citizenRequests = [];

          for(var citizenRequestIndex = 0; citizenRequestIndex < json.length; citizenRequestIndex++){
            
            var citizenRequest = {            
              ano: json[citizenRequestIndex].ano,
              mes: json[citizenRequestIndex].mes,
              numeroProcesso: json[citizenRequestIndex].processo_numero.toString(),
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
            };   

            citizenRequests.push(citizenRequest);              
            
          }

          var CitizenRequest = models.CitizenRequest;
          var updateRequests = [];
          console.log('Updating documents...');
          updateCitizenRequests(citizenRequests, CitizenRequest, updateRequests, 0, function(){
            callback(json);
          });


        });

    }); 

  }

  function updateCitizenRequests(citizenRequests, CitizenRequest, updateRequests, index, callback){

    if(citizenRequests !== undefined && citizenRequests.length > 0 && ((citizenRequests.length - index) >= 1)){
      
      CitizenRequest.findOne({numeroProcesso: citizenRequests[index].numeroProcesso}, function(err, existingDocument){
              
        if(existingDocument){

          CitizenRequest.collection.update({numeroProcesso: citizenRequests[index].numeroProcesso}, citizenRequests[index], function(err, result){

            if(err){
              throw err;
            }

            console.log('Update process: ' + citizenRequests[index].numeroProcesso);            
            updateRequests.push(citizenRequests[index]);
            updateCitizenRequests(citizenRequests, CitizenRequest, updateRequests, ++index, callback);                           

          });   

        }else{

          updateCitizenRequests(citizenRequests, CitizenRequest, updateRequests, ++index, callback);

        }      
  

    });          

    }else{

      var citizenRequestInsertList = [];
      
      if(citizenRequests.length > 0 && updateRequests.length > 0){

        for(var citizenRequestIndex = 0; citizenRequestIndex < citizenRequests.length; citizenRequestIndex++){

          isExistsUpdatedRequest = false;
          
          for(var citizenRequestUpdateIndex = 0; citizenRequestUpdateIndex < updateRequests.length; citizenRequestUpdateIndex++){           
            if(citizenRequests[citizenRequestIndex].numeroProcesso.trim() === updateRequests[citizenRequestUpdateIndex].numeroProcesso.trim()){
              isExistsUpdatedRequest = true;              
              break;
            }
          }
          
          if(!isExistsUpdatedRequest){
            citizenRequestInsertList.push(citizenRequests[citizenRequestIndex]);
          }

        }        

      }      

      if(citizenRequestInsertList.length > 0){
          insertCitizenRequests(citizenRequestInsertList, CitizenRequest, function(){

            if(callback){
               callback();
            }

        }); 
      }else if(citizenRequests.length > 0 && updateRequests.length == 0){
          insertCitizenRequests(citizenRequests, CitizenRequest, function(){
          
             if(callback){
               callback();
             }

        }); 
      }else{
          
            if(callback){
               callback();
            }

      }         

    }  

  }

  function insertCitizenRequests(citizenRequests, CitizenRequest, callback){

    if(citizenRequests !== undefined && citizenRequests.length > 0){

      CitizenRequest.collection.insert(citizenRequests, function(err, docs){

        if(err){
          throw err;
        }

        console.log(docs.insertedCount  + ' Documents inserted.');
        callback();
      });

    }

  }

  function obterUrlCsvDemandasRecife(callback){

      var urlDemandasRecife = 'http://dados.recife.pe.gov.br/dataset/demandas-dos-cidadaos-e-servicos-dados-vivos-recife/resource/079fd017-dfa3-4e69-9198-72fcb4b2f01c';
        
      var request = require('request');      
      
      console.log('Request html code...');

      request.get(urlDemandasRecife, function(error, response, body){

        var htmlBody = JSON.stringify(body);

        var rePattern = new RegExp('URL:'); 
        
        var arrMatches = htmlBody.match(rePattern);

        htmlBody = htmlBody.substring(arrMatches.index, (arrMatches.index + 500));
        
        rePattern = new RegExp('>');

        arrMatches = htmlBody.match(rePattern);                       
       
        var urlInitialIndex = arrMatches.index;
       
        htmlBody = htmlBody.substring((urlInitialIndex + 1), (urlInitialIndex + 200));        
        
        rePattern = new RegExp('</');

        arrMatches = htmlBody.match(rePattern);        

        urlInitialIndex = 0;
        var urlFinalIndex = arrMatches.index;        

        htmlBody = htmlBody.substring(urlInitialIndex, urlFinalIndex);

        if(htmlBody !== null && htmlBody !== undefined){
          callback(htmlBody);
        }

      });     
     
    }
