fetch = require('node-fetch');
var GraficoQL = require("grafico-ql");

var endpoint = 'https://countries.trevorblades.com';
var query = '{country(code:"IT") {name}}';

await GraficoQL.request(endpoint, query);
