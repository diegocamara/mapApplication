module.exports = {

    obterJsonLoaderDemandasRecife: function(){
      var jsonLoader = require('./jsonloader');
      return jsonLoader;
    },

    obterUrlCsvDemandasRecife: function(callback){

      var urlDemandasRecife = 'http://dados.recife.pe.gov.br/dataset/monitoramento-das-areas-de-riscos/resource/5eaed1e8-aa7f-48d7-9512-638f80874870';
        
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
