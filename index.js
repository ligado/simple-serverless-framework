const request = require('./request')
const response = require('./response')
const middleware = require('./middleware')
const advice = require('./advice')

function createSimpleServlerlessFramework() {
    const app = {
        handlers: [],
        middlewares: middleware(),
        adviceObject: advice()
    }

    // Add requests handler
    app.get = (uri, handler) => app.handlers.push({method: 'GET', path: uri, handler: handler})
    app.post = (uri, handler) => app.handlers.push({method: 'POST', path: uri, handler: handler})
    app.put = (uri, handler) => app.handlers.push({method: 'PUT', path: uri, handler: handler})
    app.patch = (uri, handler) => app.handlers.push({method: 'PATCH', path: uri, handler: handler})
    app.delete = (uri, handler) => app.handlers.push({method: 'DELETE', path: uri, handler: handler})

    /**
     * Adds the specified middleware to the app or request.
     * @param args
     */
    app.use = (...args) => app.middlewares.use(...args)

    /**
     * Adds advice to the app. Advice can run in one of three modes: BEFORE, AFTER, or AROUND.
     *  BEFORE advice is run after all middleware completed and immediately before the handler is invoked
     *  AFTER advice is run immediately after the handler completes, but before a response is returned to the caller
     *  AROUND advice is run both BEFORE and AFTER the handler is invoked, with the mode passed to the handler.
     *
     *  The advice is invoked with three arguments: mode, req, and res.
     *
     * @param args  Either [uri, mode, handler function] or [mode, handler function]. If no uri is specified
     *              then it configured to apply to all requests: '/'
     */
    app.advice = (...args) => app.adviceObject.addAdvice(...args)

    /**
     * Handle an API Gateway event.
     * @param event The API Gateway event
     * @returns     The response that API Gateway expects: {headers, body, statusCode}
     */
    app.handle = async event => {
        // Build our request/response objects
        const req = request(event)
        const res = response()
        // console.log(`Request: ${JSON.stringify(req)}`)

        // Find the correct handler and execute it
        const matchingHandlers = app.handlers.filter(handler => handler.method === req.method && handler.path === req.resource)
        if (matchingHandlers.length === 0) {
            // No matching handler found, return a 400 error
            res.status(400).json({message: `No request mapping found for ${req.method} ${req.resource}`})
            return res
        } else {
            // Found a handler
            const handler = matchingHandlers[0].handler
            try {
                // Execute BEFORE advice
                await app.adviceObject.executeBeforeAdvice(req.resource, req, res)

                // Execute middlewares
                const middlewareResult = await app.middlewares.execute(req, res)
                if (middlewareResult) {
                    // Middleware succeeded, execute the request
                    await handler.apply(null, [req, res])
                }

                // // Execute AFTER advice
                await app.adviceObject.executeAfterAdvice(req.resource, req, res)

                // The execution was successful, return the response
                return res
            } catch (err) {
                // An error was thrown, return a 500 error
                res.status(500).json({
                    message: 'An error occurred',
                    error: JSON.stringify(err)
                })
                return res
            }
        }
    }

    // Return the app we just constructed
    return app
}

module.exports = createSimpleServlerlessFramework()