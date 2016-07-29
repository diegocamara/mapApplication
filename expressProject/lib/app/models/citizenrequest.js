var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  ano: {type: String},
  mes: {type: String},
  numeroProcesso: {type: String},
  data: {type: Date, default: null},
  hora: {type: String},
  descricao: {type: String},
  regional: {type: String},
  bairro: {type: String},
  localidade: {type: String},
  endereco: {type: String},
  microregiao: {type: String},
  plantao: {type: String},
  origemChamado: {type: String},
  loc:{
    type: {type: String, default: 'Point'},
    coordinates: []
  },
  vitimas: {type: String},
  vitimasFatais: {type: String},
  situacao: {type: String},
  tipo: {type: String},
  origemProcesso: {type: String},
  localizacaoProcesso: {type: String},
  statusProcesso: {type: String},
  dataConclusaoProcesso: {type: String}
});

module.exports = mongoose.model('CitizenRequest', schema);
