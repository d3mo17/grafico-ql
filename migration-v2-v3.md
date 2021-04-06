## Changes in Version 3

To act in accordance with the [GraphQL-specification](https://spec.graphql.org/June2018/#sec-Response-Format), there are some important changes in the response format in Version 3 of GraficoQL.

Now, in case of status code `200 OK`, the response format of methods `request` and `rawRequest` will always be at least:

```
{
    errors?: any[];
    data?: Object;
    extensions?: Object;
}
```
The response of method `request` is restricted to this format and also to the order of the responded keys. So if the key "errors" is present in the response it appears always on first position.

But, other than that, the call of method `rawRequest` responses all transmitted keys in transmitted order.

Before this change, the method `request` did only respond the content of key "data". So all data evaluation in relation to this call has to be adapted in version 3.

But there is also a change in response of method `rawRequest`:
Before version 3 the response had another format if the key "errors" was present or when another status code than `200 OK` occured:
```
{
    response: Object
    request: Object
}
```
But now, this only happens anymore (for debugging purposes) on status codes other than `200 OK`; With status code `200 OK`, the response format will be always (for both methods `request` and `rawRequest`) as described at the top of this document.
