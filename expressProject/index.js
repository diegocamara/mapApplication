var cfg = require('_/config');
var log = require('_/log');
var models = require('_/app/models');
var app = require('_/app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var services = require('_/app/services');

var lastRequests = [];

io.on('connection', function(socket){
    lastRequests.push(socket);
    console.log('user connected');

    services.getLastRequests(function(result){
        socket.emit('requests update', result);
    });

    socket.on('disconnect', function(){
        console.log('user desconnected');
    });

});

// var csv = require('fast-csv');

// csv.fromPath('/home/diego/Downloads/Sedec_chamados.csv', {encoding: "utf8"})
// .on('data', function(data){
//     console.log(data);
// }).on('end', function(){
//     console.log('done');
// });

models.mongoose.connection.on('error', console.error.bind(console, 'Connection error:'));

models.mongoose.connection.once('open', function(callback){
    console.log('Connected to mongodb');
        
    // app.listen(cfg.port, function(){
    //     console.log('app listening on port', cfg.port);

    //     services.verificarNovosDados(function(data){

    //     });
    // });

    http.listen(cfg.port, function(){
        console.log('app listening on port', cfg.port);

        services.verificarNovosDados(function(data){

        }, function(){

            services.getLastRequests(function(result){
                
                if(lastRequests && lastRequests.length > 0){

                    for(var requestIndex = 0; requestIndex < lastRequests.length; requestIndex++){

                        lastRequests[requestIndex].emit('requests update', result);

                    }

                }

            });
            

        });
    });

});
