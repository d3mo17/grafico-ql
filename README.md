# grafico

 Minimal GraphQL client with UMD-support, written in plain javascript (ES5).
 Inspired by `graphql-request`.

## Features

- Universal Module Definition
- Promise-based API (works with `async` / `await`)
- You have to provide polyfills for `fetch` and `Promise` to use it in IE9+

## Install

```sh
npm install grafico
```

## Quickstart

Send a GraphQL query with a single line of code.

```html
<script src="node_modules/grafico-ql/dist/grafico-ql.min.js"></script>
<script>
  var query = '{Movie(title: "Inception") {releaseDate, actors {name}}}';

  GraficoQL.request('https://api.graph.cool/simple/v1/movies', query)
	  .then(function (data) { console.log(data); });
</script>
```

## Usage

```js
// Run GraphQL queries/mutations using a static function
GraficoQL.request(endpoint, query, variables)
  .then(function (data) { console.log(data); });

// ... or create a GraphQL client instance to send requests
var client = GraficoQL.create(endpoint, { headers: {} });
client.request(query, variables).then(function (data) { console.log(data); });
```

## Examples

### Authentication via HTTP header

```html
<script src="node_modules/requirejs/require.js"></script>
<script>
  require.config({baseUrl: 'node_modules'});

  require(['grafico-ql/dist/grafico-ql.min'], function (GQL) {
    var endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';
		var query = '{Movie(title: "Inception") {releaseDate, actors {name}}}';

    var graphQLClient = GQL.create(endpoint, {
      headers: {
        authorization: 'Bearer MY_TOKEN'
      }
    });

		graphQLClient.request(query)
			.then(function (data) {
				console.log(JSON.stringify(data, undefined, 2));
			})
			.catch(function (error) {
				console.error(error);
			});
	});
</script>
```


### Passing more options to fetch

```html
<script src="node_modules/requirejs/require.js"></script>
<script>
  require.config({baseUrl: 'node_modules'});

  require(['grafico-ql/dist/grafico-ql.min'], function (GQL) {
    main(GQL).catch(error => console.error(error));
  });

	async function main(GraphQLClient) {
	  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'
	  const query = /* GraphQL */ `
	    {
	      Movie(title: "Inception") {
	        releaseDate
	        actors {
	          name
	        }
	      }
	    }
	  `

	  const graphQLClient = GraphQLClient.create(endpoint, {
	    credentials: 'include',
	    mode: 'cors',
	  })

	  const data = await graphQLClient.request(query)
	  console.log(JSON.stringify(data, undefined, 2))
	}
</script>
```


### Using variables

```html
<script src="node_modules/requirejs/require.js"></script>
<script>
  require.config({baseUrl: 'node_modules'});

  require(['grafico-ql/dist/grafico-ql.min'], function (GQL) {
	  var endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';
		var variables = {
			title: 'Inception'
		};
	  var query = 'query getMovie($title: String!) {'
			+ 'Movie(title: $title) {releaseDate, actors {name}}'
			+ '}';

	  GQL.request(endpoint, query, variables)
			.then(function (data) {
				console.log(JSON.stringify(data, undefined, 2));
			})
			.catch(function (error) {
				console.error(error);
			});
	});
</script>
```


### Error handling

```html
<script src="node_modules/grafico-ql/dist/grafico-ql.min.js"></script>
<script>
  var endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'
  var query = /* GraphQL */ '\
    {\
      Movie(title: "Inception") {\
        releaseDate\
        actors {\
					# "Cannot query field \'fullname\' on type \'Actor\'.\
					# Did you mean \'name\'?"\
					fullname\
        }\
      }\
    }\
  ';

	GraficoQL.request(endpoint, query)
		.then(function (data) { console.log(data); })
		.catch(function (error) { console.error(error); });
</script>
```


### Development

If you want to distribute your changes in the 'dist'-directory, you can use npm:

```shell
    $ npm run build
```


## License

The MIT License (MIT)

Copyright (c) 2018 Daniel Moritz

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
