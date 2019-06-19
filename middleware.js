function createMiddleware() {
    // Create the middleware object
    const middleware = {
        middlewares: []
    }

    /**
     * Adds the specified middleware to either all requests or a single request. If one argument is specified then
     * the middleware will be applied to all paths, equivalent to '/', and if two arguments are specified, the first
     * specifies the path for which the middleware should be applied. Sample usages:
     * middleware.use((req, res) => return 'Foo')  // Applied to all requests
     * middleware.use('/foo', (req, res) => return 'Foo')  // Applied only to '/foo'
     *
     * @param args  One or two arguments:
     *                  function
     *                  uri, function
     */
    middleware.use = (...args) => {
        if (args.length === 1) {
            middleware.middlewares.push({path: '/', handler: args[0]})
        } else if (args.length === 2) {
            middleware.middlewares.push({path: args[0], handler: args[1]})
        }
    }

    /**
     * Find all middlewares for which this resource is applicable.
     * @param resource  The resource name, such as /foo
     * @returns         A list of all middlewares applicable to this resource
     */
    middleware.buildMiddlewareChain = (resource) => {
        return middleware.middlewares.filter(mw => mw.path === resource || mw.path === '/')
    }

    /**
     * Builds the middleware chain and executes each middleware in turn. If one of the middlewares does not call
     * next() then returns a false response, otherwise returns true to denote success.
     * @param req   The application request
     * @param res   The application response
     */
    middleware.execute = async (req, res) => {
        if (middleware.middlewares.length === 0) {
            // We do not have any middlewares to execute
            return true
        }
        let success = false

        function next() {
            success = true
        }

        // Simple implementation: execute each middleware in order and define the next method to set success to true
        // to denote whether or not we should continue. So not really a chain, but behaves like one.
        const middlewareChain = middleware.buildMiddlewareChain(req.resource)
        for (let i = 0; i < middlewareChain.length; i++) {
            const mw = middlewareChain[i]
            success = false
            await mw.handler.apply(null, [req, res, next])

            if (!success) {
                // next() was not called
                break
            }
        }

        // Return our success status: did all of the applicable middlewares complete successfully (called next())?
        return success
    }

    // Return the newly created middleware
    return middleware
}

module.exports = createMiddleware