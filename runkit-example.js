fetch = require('node-fetch');
var GraficoQL = require("grafico-ql");

var endpoint = 'https://api.graph.cool/simple/v1/movies';
var query = '{Movie(title: "Inception") {releaseDate, actors {name}}}';

await GraficoQL.request(endpoint, query);
