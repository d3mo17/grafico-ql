require('whatwg-fetch');
const fakeFetch = require('fake-fetch');
const GraphQLClient = require('../src/GraficoQL');

function extend(target, source) {
  Object.keys(source).forEach(function (key) {
    if (typeof target[key] !== 'object' || target[key] === null) {
      target[key] = source[key];
    } else if (Array.isArray(target[key])) {
      Array.isArray(source[key])
        && (target[key] = target[key].concat(source[key]));
    } else {
      source[key] === 'object' && source[key] !== null
        || (target[key] = extend(target[key], source[key]));
    }
  });
  return target;
}

function fakeGraphQL(response, option) {
  fakeFetch.respondWith(
    JSON.stringify({ data: response }),
    extend({ headers: new Headers({ 'Content-Type': 'application/json' }) }, option || {})
  );
}

describe('GraficoQL.js',() => {
  beforeEach(fakeFetch.install);
  afterEach(fakeFetch.restore);


  it('succeeds on query (default method "POST")', () => {
    const data = {
      viewer: {
        id: 'some-id',
      },
    }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(3);
    fakeGraphQL(data);

    return GraphQLClient.request(
      'https://mock-api.com/graphql',
      query,
      variables
    ).then((response) => {
      expect(response).toEqual(data);
      expect(fakeFetch.getMethod()).toEqual('POST');
      expect(fakeFetch.getBody()).toEqual(JSON.stringify({ query, variables }));
    });
  });


  it('succeeds on fetch with response header containing content-type with charset', () => {
    const data = {
      viewer: {
        id: 'some-id',
      },
    }
    const query = `{ viewer { id } }`;
    expect.assertions(3);
    fakeFetch.respondWith(
      JSON.stringify({ data }),
      { headers: new Headers({ 'Content-Type': 'application/json; charset=utf-8' }) }
    );

    return GraphQLClient.request(
      'https://mock-api.com/graphql',
      query
    ).then((response) => {
      expect(response).toEqual(data);
      expect(fakeFetch.getMethod()).toEqual('POST');
      expect(fakeFetch.getBody()).toEqual(JSON.stringify({ query }));
    });
  });


  it('succeeds on query with method "GET"', () => {
    const data = {
      viewer: {
        id: 'some-id',
      },
    }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(4);
    fakeGraphQL(data);

    return GraphQLClient.create('https://mock-api.com/graphql', { method: 'get' })
      .request(query, variables)
      .then((response) => {
        expect(response).toEqual(data);
        expect(fakeFetch.getMethod()).toEqual('get');
        expect(fakeFetch.getBody()).toBe('');
        expect(fakeFetch.getUrl()).toBe(
          'https://mock-api.com/graphql'
          + '?query=%7B%20viewer%20%7B%20id%20%7D%20%7D'
          + '&variables=%7B%22foo%22%3A%22bar%22%7D');
      });
  });


  it('succeeds on query with method "GET" on url with parameters', () => {
    const data = {
      viewer: {
        id: 'some-id',
      },
    }
    const query = `{ viewer { id } }`;
    const variables = { foo: 'bar' };
    expect.assertions(4);
    fakeGraphQL(data);

    return GraphQLClient.create('https://mock-api.com/graphql?a=b', { method: 'GET' })
      .request(query, variables)
      .then((response) => {
        expect(response).toEqual(data);
        expect(fakeFetch.getMethod()).toEqual('GET');
        expect(fakeFetch.getBody()).toBe('');
        expect(fakeFetch.getUrl()).toBe(
          'https://mock-api.com/graphql?a=b'
          + '&query=%7B%20viewer%20%7B%20id%20%7D%20%7D'
          + '&variables=%7B%22foo%22%3A%22bar%22%7D');
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
        data: ''
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
        data: ''
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
      viewer: {
        id: 'some-id',
      },
    };
    expect.assertions(4);
    fakeGraphQL(data);

    return GraphQLClient
      .create('https://mock-api.com/graphql', options)
      .request(query)
      .then((response) => {
        expect(response).toEqual(data);
        expect(fakeFetch.getMethod()).toEqual('POST');
        expect(fakeFetch.getBody()).toEqual(JSON.stringify({ query }));
        expect(fakeFetch.getOptions()).toMatchObject(options);
      });
  });
});
