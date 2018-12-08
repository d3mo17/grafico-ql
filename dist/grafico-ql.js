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
    headers: {'Content-Type': 'application/json'}
  };
  
  /**
   * @constructor
   * @param {string} url
   * @param {object} options
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
   * Overwrite header definition.
   * @param headers
   * @returns {GraphQLClient}
   */
  GraphQLClient.prototype.setHeaders = function (headers) {
    typeof headers === 'object' && !Array.isArray(headers)
      && (this.options.headers = headers || {});
    return this;
  };
  
  /**
   * Set a header-key.
   * @param key
   * @param value
   * @returns {GraphQLClient}
   */
  GraphQLClient.prototype.setHeader = function (key, value) {
    this[' options']['headers'][key] = value;
    return this;
  };
  
  /**
   * Extend target by source object.
   * @param {object} target
   * @param {object} source
   */
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
  
  /**
   * @param {string} query
   * @param {object} variables
   */
  GraphQLClient.prototype.request = function (query, variables) {
    var resultHandling;
    var deferred = {resolve: null, reject: null};
    var queryParams = {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: variables ? variables : undefined
      })
    };
    deferred.promise = new Promise(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    
    resultHandling = handleRequestResult.bind(deferred, query, variables);
    fetch(this[' url'], extend(this[' options'], queryParams))
      .then(function (response) {
        var handling = resultHandling.bind(null, response);
        getResultPromise(response).then(handling, handling);
      });
    return deferred.promise;
  };
  
  /**
   * @this deferred-object
   * @param {string} query
   * @param {object} variables
   * @param {object} response
   * @param {object} result
   */
  function handleRequestResult(query, variables, response, result) {
    var errorResult;
    
    if (response.ok && !result.errors && result.data) {
      this.resolve(result.data);
      return;
    }
    
    errorResult = typeof result === 'string' ? {error: result} : result || {};
    errorResult['status'] = response.status;
    this.reject({
      response: errorResult,
      request: {query: query, variables: variables}
    });
  }
  
  /**
   * @private
   * @param response
   * @returns {*}
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
    create: function (url, options) {
      return new GraphQLClient(url, options);
    },
    request: function (url, query, variables) {
      var client = exports.create(url);
      return client.request(query, variables);
    }
  });
}));

if (typeof define === 'function' && define.amd) {
    define(['grafico-ql'], function (GraficoQL) { return GraficoQL; });
}
