function createRequest(event) {
    // Parse the event into a request
    let req = {
        method: event.httpMethod,
        path: event.path,
        resource: event.resource,
        headers: event.headers,
        query: event.queryStringParameters,
        params: event.pathParameters,
        body: null
    }

    // Handle the body parsing; TODO: do we want to support this in a middleware instead?
    if (event.body) req.body = JSON.parse(event.body)

    // Add a get() method to return the header value
    req.get = header => req.headers[header]

    // Return the request
    return req
}

module.exports = createRequest