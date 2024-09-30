/**
 * @param   {Object} root
 * @param   {Function} factory
 *
 * @returns {Object}
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GraficoQL = factory();
  }
}(this, function () {
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
    this[' url'] = url;
    // clone defaults-object and extend it with option-object
    this[' options'] = Object.assign(
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

    switch (this[' options']['method'].toLowerCase()) {
      case 'post':
        this.setHeader('Content-Type', 'application/json');
        this[' options'].body = JSON.stringify({
          query: query,
          variables: variables ? variables : undefined
        });
        break;

      case 'get':
        this.setHeader('Content-Type', 'text/plain');
        delete this[' options'].body;
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
    fetch(url.join(''), this[' options'])
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
    var responseData = {};
    var errorResult;

    if (response.ok && (result.data || result.errors)) {
      if (!responseShouldBeRaw) {
        result.errors && (responseData.errors = result.errors);
        result.data !== undefined && (responseData.data = result.data);
        Object.prototype.toString.call(result.extensions) === '[object Object]'
          && (responseData.extensions = result.extensions);
        this.resolve(responseData);
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
      return response.text().then(function (str) { return JSON.parse(str); });
    }
  }

  return {
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
      return (new GraphQLClient(url)).request(query, variables);
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
      return (new GraphQLClient(url)).rawRequest(query, variables);
    }
  };
}));
