fetch = require('isomorphic-fetch');
var GraficoQL = require("grafico-ql");

var endpoint = 'https://countries.trevorblades.com';
var query = '{country(code:"IT") {name}}';

await GraficoQL.request(endpoint, query);
