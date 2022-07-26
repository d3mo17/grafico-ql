const GraphQLClient = require('../src/GraficoQL');

function extend(target, source) {
  Object.keys(source).forEach(function (key) {
    if (typeof target[key] !== 'object' || target[key] === null) {
      target[key] = source[key];
    } else if (Array.isArray(target[key])) {
      Array.isArray(source[key])
        && (target[key] = target[key].concat(source[key]));
    } else if (typeof source[key] === 'object'
      && source[key] !== null
      && !Array.isArray(source[key])
    ) {
      target[key] = extend(target[key], source[key]);
    }
  });
  return target;
}

describe('test extend-function', () => {
  it('should extend an object by another', () => {
    const target = { a: 1, b: 'test', c: [2, 3, 4], d: { e: 12, f: 'nested' } };
    const source = { a: 3, c: [2, 1], d: { g: 'nested new' } };
    extend(target, source);
    expect(target).toEqual({
      a: 3, b: 'test', c: [2, 3, 4, 2, 1], d: { e: 12, f: 'nested', g: 'nested new' }
    });
  });

  it('should extend an object by another, respect different types', () => {
    const target = { a: 1, b: 'test', c: [2, 3, 4], d: { e: 12, f: 'nested' } };
    const source = { a: [1, 2], c: 'foo', d: 'bar' };
    extend(target, source);
    expect(target).toEqual({
      a: [1, 2], b: 'test', c: [2, 3, 4], d: { e: 12, f: 'nested' }
    });
  });

  it('should extend an object by another, respect different object-types', () => {
    const target = { a: { g: 'foo', '1': 'bar' }, b: 'test', c: [2, 3, 4] };
    const source = { a: [1, 2], c: { h: 'nested in source' } };
    extend(target, source);
    expect(target).toEqual({
      a: { g: 'foo', '1': 'bar' }, b: 'test', c: [2, 3, 4]
    });
  });
});

function fakeGraphQL(response, option) {
  fetch.mockResponse(() => Promise.resolve(
    extend({
      body: JSON.stringify(response),
      headers: new Headers({ 'Content-Type': 'application/json' })
    }, option || {})
  ));
}

describe('GraficoQL.js', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('succeeds on query (default method "POST")', () => {
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        }
      }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(2);
    fakeGraphQL(data);

    return GraphQLClient.request(
      'https://mock-api.com/graphql',
      query,
      variables
    ).then(response => {
      expect(response).toEqual(data);
      expect(fetch).toBeCalledWith(
        'https://mock-api.com/graphql',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ query, variables })
        })
      );
    });
  });


  it('succeeds on query with raw response (default method "POST")', () => {
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        },
        additional: 'Jack'
      }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(5);
    fakeGraphQL(data);

    return GraphQLClient.rawRequest(
      'https://mock-api.com/graphql2',
      query,
      variables
    ).then((response) => {
      expect(response.status).toEqual(200);
      expect(response.data).toEqual(data.data);
      expect(response.additional).toEqual('Jack');
      expect('headers' in response).toBe(true);
      expect(fetch).toBeCalledWith(
        'https://mock-api.com/graphql2',
        expect.objectContaining({method: 'POST'})
      );
    });
  });


  it('Strips additional keys', () => {
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        },
        additional: 'Jack'
      }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(1);
    fakeGraphQL(data);

    return GraphQLClient.request(
      'https://mock-api.com/graphql',
      query,
      variables
    ).then((response) => {
      expect(response).toEqual({data: data.data});
    });
  });


  it('succeeds, but with errors', () => {
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        },
        errors: [
            { message: 'Bad moon arising!' }
        ]
      }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(3);
    fakeGraphQL(data);

    return GraphQLClient.request(
      'https://mock-api123.com/graphql',
      query,
      variables
    ).then((response) => {
      expect(response.data).toEqual(data.data);
      expect(response.error).toEqual(data.error);
      expect(fetch).toBeCalledWith(
        'https://mock-api123.com/graphql',
        expect.objectContaining({method: 'POST'})
      );
    });
  });


  it('succeeds on fetch with response header containing content-type with charset', () => {
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        }
      }
    const query = `{ viewer { id } }`;
    expect.assertions(2);
    fetch.mockResponse(() => Promise.resolve(
      {
        body: JSON.stringify(data),
        headers: new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
      }
    ));

    return GraphQLClient.request(
      'https://mock-api.de/graphql',
      query
    ).then((response) => {
      expect(response).toEqual(data);
      expect(fetch).toBeCalledWith(
        'https://mock-api.de/graphql',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ query })
        })
      );
    });
  });


  it('succeeds on query with method "GET"', () => {
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        }
      }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(2);
    fakeGraphQL(data);

    return GraphQLClient.create('https://mock-api.com/graphql', { method: 'get' })
      .request(query, variables)
      .then((response) => {
        expect(response).toEqual(data);
        expect(fetch).toBeCalledWith(
          'https://mock-api.com/graphql'
          + '?query=%7B%20viewer%20%7B%20id%20%7D%20%7D'
          + '&variables=%7B%22foo%22%3A%22bar%22%7D',
          expect.objectContaining({
            method: 'get',
            headers: {"Content-Type": "text/plain"}
          })
        );
      });
  });


  it('succeeds on query with method "GET" on url with parameters', () => {
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        }
      }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(2);
    fakeGraphQL(data);

    return GraphQLClient.create('https://mock-api.com/graphql?a=b', { method: 'GET' })
      .request(query, variables)
      .then((response) => {
        expect(response).toEqual(data);
        expect(fetch).toBeCalledWith(
          'https://mock-api.com/graphql?a=b'
          + '&query=%7B%20viewer%20%7B%20id%20%7D%20%7D'
          + '&variables=%7B%22foo%22%3A%22bar%22%7D',
          expect.objectContaining({
            method: 'GET',
            headers: {"Content-Type": "text/plain"}
          })
        );
      });
  });


  it('Server Response with incorrect content-type header', () => {
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        }
      }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(1);
    fetch.mockResponse(() => Promise.resolve(
      {
        body: JSON.stringify(data)
      }
    ));

    return GraphQLClient.create('https://mock-api.com/graphql?a=b')
      .request(query, variables)
      .then((response) => {
        expect(response).toEqual(data);
      });
  });


  it('fails on query, cause of internal server error', () => {
    expect.hasAssertions();
    fakeGraphQL('', { status: 500 });
    const fetchPromise = GraphQLClient.request(
      'https://mock-api.com/graphql',
      `{ viewer { id } }`
    );

    return expect(fetchPromise).rejects.toEqual(expect.objectContaining({
      request: expect.any(Object),
      response: {
        status: 500,
        error: ''
      }
    }));
  });


  it('fails on query, cause of page not found', () => {
    expect.hasAssertions();
    fakeGraphQL('', { status: 404 });
    const fetchPromise = GraphQLClient.request(
      'https://mock-api.com/graphql',
      `{ viewer { id } }`
    );

    return expect(fetchPromise).rejects.toEqual(expect.objectContaining({
      request: expect.any(Object),
      response: {
        status: 404,
        error: ''
      }
    }));
  });


  it('transports extra fetch options',() => {
    const options = {
      credentials: 'include',
      mode: 'cors',
      cache: 'reload',
    }
    const query = `{ viewer { id } }`;
    const data = {
        data: {
          viewer: {
            id: 'some-id',
          }
        }
      };
    expect.assertions(2);
    fakeGraphQL(data);

    return GraphQLClient
      .create('https://mock-api.it/graphql', options)
      .request(query)
      .then((response) => {
        expect(response).toEqual(data);
        expect(fetch).toBeCalledWith(
          'https://mock-api.it/graphql',
          expect.objectContaining(extend({
            method: 'POST',
            body: JSON.stringify({ query })
          }, options))
        );
      });
  });
});
