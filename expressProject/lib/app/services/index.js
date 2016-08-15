var jsonLoader = require('./jsonloader');
var models = require('../models');

module.exports = {

    obterJsonLoaderDemandasRecife: function(){      
      return obterJsonLoaderDemandasRecife();
    },
        
    verificarNovosDados: function(callback, ioCallBack){

      var demandas = [
        { 
          nome: 'Demandas com localização',
          urlDemandaRecife: 'http://dados.recife.pe.gov.br/dataset/demandas-dos-cidadaos-e-servicos-dados-vivos-recife/resource/079fd017-dfa3-4e69-9198-72fcb4b2f01c',
          getRequest: obterComLatitudeLongitude
        }
        // {
        //   nome: 'Demandas de serviços 156',
        //   urlDemandaRecife: urlDemandasRecife = 'http://dados.recife.pe.gov.br/dataset/demandas-dos-cidadaos-e-servicos-dados-vivos-recife/resource/9afa68cf-7fd9-4735-b157-e23da873fef7',
        //   getRequest: obterDemandasDeServicos156
        // },        
        // ,
        // { 
        //   nome: 'Demandas Sedec Solicitações em Tempo Real',
        //   urlDemandaRecife: 'http://dados.recife.pe.gov.br/dataset/demandas-dos-cidadaos-e-servicos-dados-vivos-recife/resource/7723d193-c6d5-4859-933b-e8386e008b7e',
        //   getRequest: obterDemandasDeServicosSedec
        // }        
      ];      

       verificarDemandas(demandas, 0, function(){           
            console.log('All done.');            
       });

      var Agenda = require('agenda');

      var mongoConnectionString = "mongodb://admin:admin12345@ds031925.mlab.com:31925/realtimerequestdb";

      var agenda = new Agenda({db: {address: mongoConnectionString}});

      // agenda.define('job', 
      //               {priority: 'highest',
      //               concurrency: 1,
      //               lockLimit: 0,
      //               lockLifetime: 0}, 
      //               function(job, done){

      //   console.log('Verificando novos dados em ' + new Date() + '... ');   

      //   try{         

      //     verificarDemandas(demandas, 0, function(){
      //       done();
      //       console.log('All done.');
      //       ioCallBack();
      //     });

      //   }catch(err){
      //      console.err(err);
      //      done();
      //   }       

      // });      

      // agenda.on('ready', function(){

      //   agenda.every('15 minutes', 'job');

      //   agenda.start();
      //   console.log('Agenda starting...');

      // });    

      // agenda.on('error', function(){

      // });

    },

    getLastRequests: function(callback){

      var CitizenRequest = new models.CitizenRequest();

      CitizenRequest.collection.find({}).sort({data: -1}).limit(5).toArray(function(error, result){

        if(error){
          throw error;
        }

        callback(result);

      });

    }

}

  function getRecifeGeojson(callback){

    var geoJsonUrl = 'http://dados.recife.pe.gov.br/storage/f/2013-07-15T15%3A17%3A15.285Z/bairros.geojson';

    var request = require('request');

    request.get(geoJsonUrl, function(error, response, body){

      if(error){
        throw err;
      }    

      if(callback){
        callback(body);
      }

    });

  }

 
  function getCitizenRequest(htmlUrlToRequestData, getRequest, callback){
            
      var url;

      obterUrlCsvDemandasRecife(htmlUrlToRequestData, function(error, urlRequest){

        if(!error){
          
          url = urlRequest;
          console.log("Obtendo arquivo .csv de: " + url);       

          jsonLoader.getJsonFromWeb(url, function(json){
            
            
            var citizenRequests = [];

            for(var citizenRequestIndex = 0; citizenRequestIndex < json.length; citizenRequestIndex++){              

              citizenRequest = getRequest(json[citizenRequestIndex]);       

              citizenRequests.push(citizenRequest);              
              
            }

            var CitizenRequest = models.CitizenRequest;
            var updateRequests = [];
            console.log('Atualizando documents...');
            updateCitizenRequests(citizenRequests, CitizenRequest, updateRequests, 0, function(){
              callback(json);
            });

          });

        }

    }); 

  }

  function updateCitizenRequests(citizenRequests, CitizenRequest, updateRequests, index, callback){      

    if(citizenRequests !== undefined && citizenRequests.length > 0 && ((citizenRequests.length - index) >= 1)){
      
      CitizenRequest.findOne(citizenRequests[index].query, function(err, existingDocument){
              
        if(existingDocument){

          var query = citizenRequests[index].query;

          delete citizenRequests[index]['query'];         
          
          CitizenRequest.collection.update(query, citizenRequests[index], function(err, result){
          
            if(err){
              throw err;
            }

            console.log('Atualizando processo de numero: ' + citizenRequests[index].numeroProcesso);            
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
            delete citizenRequests[citizenRequestIndex]['query'];                      
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

            for(var requestIndex = 0; requestIndex < citizenRequests.length; requestIndex++){
              delete citizenRequests[requestIndex]['query'];             
            }

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
   
     getRecifeGeojson(function(geojson){       

        if(citizenRequests !== undefined && citizenRequests.length > 0){

          CitizenRequest.collection.insert(citizenRequests, function(err, docs){

            if(err){
              throw err;
            }

            console.log(docs.insertedCount  + ' Documents inserted.');

            var gjson = JSON.parse(geojson);

            checkCoords(0, gjson, function(){
               console.log('All areas checked.');
               callback();
            });
           
          });

        }

     });

   

  }

  function obterUrlCsvDemandasRecife(htmlUrlToRequestData, callback){

      var urlDemandasRecife = htmlUrlToRequestData;

      var request = require('request');      
      
      console.log('Requisitando código html...');

      request.get(urlDemandasRecife, function(error, response, body){

        if(error){
          console.log('Houve um erro ao requisitar o código html.');
          callback(error, null);
        }else{

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
            callback(null, htmlBody);
          }

        }        

      });     
     
    }

    function verificarDemandas(demandas, index, callback){

      if(demandas && demandas.length > 0 && (index < demandas.length)){

        var demanda = demandas[index];

        getCitizenRequest(demanda.urlDemandaRecife, demanda.getRequest, function(json){
           console.log('Bath ' + demanda.nome + ' finalizado em ' + new Date() + '.');
           verificarDemandas(demandas, ++index, callback);
        });

      }else{
        callback();
      }

    }

    function obterComLatitudeLongitude(requestDoc){
             
              var splitResult = requestDoc.solicitacao_data.toString().split('-');
              var year = splitResult[0];
              var mouth = splitResult[1];
              var day = splitResult[2];

              var dateFormat = year + '-' + mouth + '-' + day + ' 00:00:00';
              
              var citizenRequest = {            
                ano: requestDoc.ano,
                mes: requestDoc.mes,
                numeroProcesso: requestDoc.processo_numero.toString(),
                data: new Date(dateFormat),
                hora: requestDoc.solicitacao_hora,
                descricao: requestDoc.solicitacao_descricao,
                regional: requestDoc.solicitacao_regional,
                bairro: requestDoc.solicitacao_bairro,
                localidade: requestDoc.solicitacao_localidade,
                endereco: requestDoc.solicitacao_endereco,
                microregiao: requestDoc.solicitacao_microrregiao,
                plantao: requestDoc.solicitacao_plantao,
                origemChamado: requestDoc.solicitacao_origem_chamado,
                loc: {
                  type: 'Point',
                  coordinates: [Number(requestDoc.longitude.replace(',', '.')), Number(requestDoc.latitude.replace(',', '.'))]
                },
                vitimas: requestDoc.solicitacao_vitimas,
                vitimasFatais: requestDoc.solicitacao_vitimas_fatais,
                situacao: requestDoc.processo_situacao,
                tipo: requestDoc.processo_tipo,
                origemProcesso: requestDoc.processo_origem,
                localizacaoProcesso: requestDoc.processo_localizacao,
                statusProcesso: requestDoc.processo_status,
                dataConclusaoProcesso: requestDoc.processo_data_conclusao,
                bairro_coords: requestDoc.bairro_coords,
                query: {
                  numeroProcesso: requestDoc.processo_numero.toString()
                }
              }; 

              return citizenRequest;

    }

    function obterDemandasDeServicos156(requestDoc){
              
              var splitResult = requestDoc.DATA_DEMANDA.toString().split('-');
              var year = splitResult[0];
              var month = splitResult[1];
              var day = splitResult[2];

              var dateFormat = year + '-' + month + '-' + day + ' 00:00:00';
              
              var data = new Date(dateFormat);

              var citizenRequest = {            
                ano: year,
                mes: month,
                numeroProcesso: requestDoc.SERVICO_CODIGO.toString(),
                data: data,
                descricao: requestDoc.SERVICO_DESCRICAO,
                bairro: requestDoc.BAIRRO,
                endereco: requestDoc.LOGRADOURO + ' Nº: ' +requestDoc.NUMERO,
                situacao: requestDoc.SITUACAO,
                tipo: requestDoc.GRUPOSERVICO_DESCRICAO,
                query: {
                  'and': [
                    {ano: year},
                    {mes: month},
                    {numeroProcesso: requestDoc.SERVICO_CODIGO.toString()},
                    {data: data},
                    {descricao: requestDoc.SERVICO_DESCRICAO},
                    {bairro: requestDoc.BAIRRO},
                    {endereco: requestDoc.LOGRADOURO + ' Nº: ' +requestDoc.NUMERO},
                    {situacao: requestDoc.SITUACAO},
                    {tipo: requestDoc.GRUPOSERVICO_DESCRICAO}
                  ]                 
                }
              }; 

              return citizenRequest;

    }

    function obterDemandasDeServicosSedec(requestDoc){

              var splitResult = requestDoc.solicitacao_data.toString().split('-');
              var year = splitResult[0];
              var mouth = splitResult[1];
              var day = splitResult[2];

              var dateFormat = year + '-' + mouth + '-' + day + ' 00:00:00';
              
              var citizenRequest = {            
                ano: requestDoc.ano,
                mes: requestDoc.mes,
                numeroProcesso: requestDoc.processo_numero.toString(),
                data: new Date(dateFormat),
                hora: requestDoc.solicitacao_hora,
                descricao: requestDoc.solicitacao_descricao,
                regional: requestDoc.solicitacao_regional,
                bairro: requestDoc.solicitacao_bairro,
                localidade: requestDoc.solicitacao_localidade,
                endereco: requestDoc.solicitacao_endereco,
                microregiao: requestDoc.solicitacao_microrregiao,
                plantao: requestDoc.solicitacao_plantao,
                origemChamado: requestDoc.solicitacao_origem_chamado,
                loc:{
                  type: {type: String, default: 'Point'},
                  coordinates: [requestDoc.latitude, requestDoc.longitude]
                },
                vitimas: requestDoc.solicitacao_vitimas,
                vitimasFatais: requestDoc.solicitacao_vitimas_fatais,
                situacao: requestDoc.processo_situacao,
                tipo: requestDoc.processo_tipo,
                origemProcesso: requestDoc.processo_origem,
                localizacaoProcesso: requestDoc.processo_localizacao,
                statusProcesso: requestDoc.processo_status,
                dataConclusaoProcesso: requestDoc.processo_data_conclusao,
                query: {
                  numeroProcesso: requestDoc.processo_numero.toString()
                }

              }; 

              return citizenRequest;

    }


    function checkCoords(index, gjson, callback) {

      var CitizenRequest = new models.CitizenRequest();  
      
      if (index < gjson.features.length) {
        console.log('Checking requests for area: ' + gjson.features[index].properties.bairro_nome_ca + '        at ' + new Date());
        CitizenRequest.collection.find({
          loc: {
            $geoIntersects: {
              $geometry: {
                type: "Polygon",
                coordinates: gjson.features[index].geometry.coordinates
              }
            }
          }
        }).toArray(function (error, result) {

          if (error) {

            checkCoords(++index, gjson, callback);            

          }else{

            updateResult(0, index, result, gjson, function () {

              checkCoords(++index, gjson, callback);

            });

          }

        });

      } else {

        callback();

      }

    }


    function updateResult(indexResquest, indexArea, resultArray, gjson, callback) {

      if (resultArray.length > 0 && indexResquest < resultArray.length) {

        var CitizenRequest = new models.CitizenRequest();

        CitizenRequest.collection.update({ _id: resultArray[indexResquest]._id },
          {
            $set: { bairro_coords: gjson.features[indexArea].properties.bairro_nome_ca }
          }, function (error, doc) {

            if (error) {             
              throw error;
            }

            console.log(' * Process number: ' + doc.numeroProcesso + ' updated.');
            
            updateResult(++indexResquest,indexArea, gjson, resultArray, callback);

          });

      } else {
        callback();
      }

    }

    
