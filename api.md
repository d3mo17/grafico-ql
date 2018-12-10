## Modules

<dl>
<dt><a href="#module_GraficoQL">GraficoQL</a></dt>
<dd><p>A minimalistic graphql client.</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#GraphQLClient">GraphQLClient</a> ℗</dt>
<dd></dd>
</dl>

<a name="module_GraficoQL"></a>

## GraficoQL
A minimalistic graphql client.


* [GraficoQL](#module_GraficoQL)
    * [.create(url, options)](#module_GraficoQL.create) ⇒ [<code>GraphQLClient</code>](#GraphQLClient)
    * [.request(url, query, variables)](#module_GraficoQL.request) ⇒ <code>Promise</code>


* * *

<a name="module_GraficoQL.create"></a>

### GraficoQL.create(url, options) ⇒ [<code>GraphQLClient</code>](#GraphQLClient)
Creates an object to request a graphql endpoint.

**Kind**: static method of [<code>GraficoQL</code>](#module_GraficoQL)  
**Throws**:

- <code>ReferenceError</code> 


| Param | Type |
| --- | --- |
| url | <code>String</code> | 
| options | <code>Object</code> | 


* * *

<a name="module_GraficoQL.request"></a>

### GraficoQL.request(url, query, variables) ⇒ <code>Promise</code>
Requests a graphql endpoint.

**Kind**: static method of [<code>GraficoQL</code>](#module_GraficoQL)  
**Throws**:

- <code>ReferenceError</code> 


| Param | Type |
| --- | --- |
| url | <code>String</code> | 
| query | <code>String</code> | 
| variables | <code>Object</code> | 


* * *

<a name="GraphQLClient"></a>

## GraphQLClient ℗
**Kind**: global class  
**Access**: private  

* [GraphQLClient](#GraphQLClient) ℗
    * [new GraphQLClient(url, options)](#new_GraphQLClient_new)
    * [.setHeaders(headers)](#GraphQLClient+setHeaders) ⇒ <code>this</code>
    * [.setHeader(key, value)](#GraphQLClient+setHeader) ⇒ <code>this</code>
    * [.request(query, variables)](#GraphQLClient+request) ⇒ <code>Promise</code>


* * *

<a name="new_GraphQLClient_new"></a>

### new GraphQLClient(url, options)

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url of the graphql endpoint |
| options | <code>Object</code> |  |


* * *

<a name="GraphQLClient+setHeaders"></a>

### graphQLClient.setHeaders(headers) ⇒ <code>this</code>
Overwrite header definition.

**Kind**: instance method of [<code>GraphQLClient</code>](#GraphQLClient)  

| Param | Type |
| --- | --- |
| headers | <code>Object</code> | 


* * *

<a name="GraphQLClient+setHeader"></a>

### graphQLClient.setHeader(key, value) ⇒ <code>this</code>
Set a header-key.

**Kind**: instance method of [<code>GraphQLClient</code>](#GraphQLClient)  

| Param | Type |
| --- | --- |
| key | <code>String</code> | 
| value | <code>String</code> | 


* * *

<a name="GraphQLClient+request"></a>

### graphQLClient.request(query, variables) ⇒ <code>Promise</code>
Requests the stored graphql endpoint.

**Kind**: instance method of [<code>GraphQLClient</code>](#GraphQLClient)  

| Param | Type |
| --- | --- |
| query | <code>String</code> | 
| variables | <code>Object</code> | 


* * *

