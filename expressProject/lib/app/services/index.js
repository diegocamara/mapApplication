module.exports = {

    obterJsonLoaderDemandasRecife: function(){
      var jsonLoader = require('./jsonloader');
      return jsonLoader;
    },

    obterUrlCsvDemandasRecife: function(callback){

      var urlDemandasRecife = 'http://dados.recife.pe.gov.br/dataset/demandas-dos-cidadaos-e-servicos-dados-vivos-recife/resource/9afa68cf-7fd9-4735-b157-e23da873fef7';
        
      var request = require('request');      
      
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


}
