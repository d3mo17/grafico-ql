/**
 * Requirements: IE9+, fetch, Promise
 *
 * @param   {Object} root
 * @param   {Function} factory
 *
 * @returns {Object}
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('grafico-ql',['exports'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    factory(exports);
  } else {
    factory(root.GraficoQL = {});
  }
}(typeof self !== 'undefined' ? self : this, function (exports) {
  var defaults = {
    headers: {},
    method: 'POST'
  };
  
  /**
   * A minimal graphql client.
   * @module GraficoQL
   */
  
  /**
   * @constructor
   * @global
   * @private
   * 
   * @param {String} url The url of the graphql endpoint
   * @param {Object} options
   */
  function GraphQLClient(url, options) {
    checkDependencies();
    this[' url'] = url;
    // clone defaults-object and extend it with option-object
    this[' options'] = extend(
      JSON.parse(JSON.stringify(defaults)),
      options || {}
    );
  }
  
  /**
   * Set a header-key.
   * @method GraphQLClient#setHeader
   * @param {String} key
   * @param {String} value
   * @returns {this}
   */
  GraphQLClient.prototype.setHeader = function (key, value) {
    this[' options']['headers'][key] = value;
    return this;
  };
  
  /**
   * Extend target by source object.
   * @param {Object} target
   * @param {Object} source
   * @return {Object} target
   */
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

  /**
   * Shared function for requests.
   * @param {Boolean} responseShouldBeRaw
   * @param {String} query
   * @param {Object} variables
   * @returns {Promise}
   */
  function privateRequest(responseShouldBeRaw, query, variables) {
    var resultHandling;
    var url = [this[' url']];
    var deferred = {resolve: null, reject: null};
    var queryParams = {};

    switch (this[' options']['method'].toLowerCase()) {
      case 'post':
        this.setHeader('Content-Type', 'application/json');
        queryParams.body = JSON.stringify({
          query: query,
          variables: variables ? variables : undefined
        });
        break;

      case 'get':
        this.setHeader('Content-Type', 'text/plain');
        url.push(
          (this[' url'].indexOf('?') === -1 ? '?' : '&')
          + 'query=' + encodeURIComponent(query)
        );
        variables && url.push(
          '&variables=' + encodeURIComponent(JSON.stringify(variables))
        );
        break;

      default:
        throw new Error(
          'Invalid method (' + this[' options']['method'] + '). '
          + 'Use method GET or POST!'
        );
    }

    deferred.promise = new Promise(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    
    resultHandling = handleRequestResult.bind(
      deferred,
      responseShouldBeRaw,
      query,
      variables
    );
    fetch(url.join(''), extend(this[' options'], queryParams))
      .then(function (response) {
        var handling = resultHandling.bind(null, response);
        getResultPromise(response).then(handling, handling);
      }, function (response) {
        deferred.reject({
            response: {status: 900, error: response},
            request: {query: query, variables: variables}
        });
      });
    return deferred.promise;
  }

  /**
   * Requests the stored graphql endpoint.
   * @method GraphQLClient#request
   * @param {String} query
   * @param {Object} variables
   * @returns {Promise}
   */
  GraphQLClient.prototype.request = function (query, variables) {
    return privateRequest.call(this, false, query, variables);
  };
  
  /**
   * Requests the stored graphql endpoint.
   * The complete response will be transmit to the resolved promise.
   * @method GraphQLClient#rawRequest
   * @param {String} query
   * @param {Object} variables
   * @returns {Promise}
   */
  GraphQLClient.prototype.rawRequest = function (query, variables) {
    return privateRequest.call(this, true, query, variables);
  };
  
  /**
   * @this deferred-object
   * @param {Boolean} responseShouldBeRaw 
   * @param {String} query
   * @param {Object} variables
   * @param {Object} response
   * @param {Object} result
   */
  function handleRequestResult(
    responseShouldBeRaw,
    query,
    variables,
    response,
    result
  ) {
    var errorResult;
    
    if (response.ok && !result.errors && result.data) {
      if (!responseShouldBeRaw) {
        this.resolve(result.data);
      } else {
        result['headers'] = response.headers;
        result['status'] = response.status;
        this.resolve(result);
      }
      return;
    }
    
    errorResult = typeof result === 'string' ? {error: result} : result || {};
    errorResult['status'] = response.status;
    responseShouldBeRaw && (errorResult['headers'] = response.headers);
    this.reject({
      response: errorResult,
      request: {query: query, variables: variables}
    });
  }
  
  /**
   * @private
   * @param response
   * @returns {Promise}
   */
  function getResultPromise(response) {
    var contentType = response.headers.get('Content-Type');
    if (contentType && contentType.indexOf('application/json') === 0) {
      return response.json();
    } else {
      return response.text();
    }
  }
  
  /**
   * @private
   * @throws {ReferenceError}
   */
  function checkDependencies() {
    var msg = 'Cannot initialize GraphQLClient, cause of missing ';
    var advice = ' You can resolve this by providing a polyfill for it.';
    if (!fetch) {
      throw new ReferenceError(msg + 'fetch-function!' + advice);
    }
    if (!Promise) {
      throw new ReferenceError(msg + 'Promise-constructor!' + advice);
    }
  }
  
  extend(exports, {
    /**
     * Creates an object to request a graphql endpoint.
     * 
     * @alias   module:GraficoQL.create
     * @param   {String} url 
     * @param   {Object} options 
     * @returns {GraphQLClient}
     * @throws  {ReferenceError}
     */
    create: function (url, options) {
      return new GraphQLClient(url, options);
    },
    /**
     * Requests a graphql endpoint.
     * 
     * @alias   module:GraficoQL.request
     * @param   {String} url 
     * @param   {String} query 
     * @param   {Object} variables 
     * @returns {Promise}
     * @throws  {ReferenceError}
     */
    request: function (url, query, variables) {
      var client = exports.create(url);
      return client.request(query, variables);
    },
    /**
     * Requests a graphql endpoint.
     * The complete response will be transmit to the resolved promise.
     * 
     * @alias   module:GraficoQL.rawRequest
     * @param   {String} url 
     * @param   {String} query 
     * @param   {Object} variables 
     * @returns {Promise}
     * @throws  {ReferenceError}
     */
    rawRequest: function (url, query, variables) {
      var client = exports.create(url);
      return client.rawRequest(query, variables);
    }
  });
}));

if (typeof define === 'function' && define.amd) {
    define(['grafico-ql'], function (GraficoQL) { return GraficoQL; });
}
