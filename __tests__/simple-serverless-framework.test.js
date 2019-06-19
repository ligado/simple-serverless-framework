const fs = require('fs')
const app = require('../index')

beforeEach(() => {
    app.handlers.length = 0
    app.middlewares.middlewares.length = 0
    app.adviceObject.adviceList.length = 0
})

test('Add handlers', () => {
    // Add a GET handler
    app.get('/foo', (req, res) => console.log('GET request'))
    app.post('/foo', (req, res) => console.log('POST request'))
    app.put('/foo', (req, res) => console.log('PUT request'))
    app.patch('/foo', (req, res) => console.log('PATCH request'))
    app.delete('/foo', (req, res) => console.log('DELETE request'))

    console.log(`Handlers: ${JSON.stringify(app.handlers)}`)

    // Validate that we have 5 handlers
    expect(app.handlers.length).toBe(5)

    // Validate that our handlers were added
    expect(app.handlers.filter(handler => handler.method === 'GET' && handler.path === '/foo').length).toBe(1)
    expect(app.handlers.filter(handler => handler.method === 'POST' && handler.path === '/foo').length).toBe(1)
    expect(app.handlers.filter(handler => handler.method === 'PUT' && handler.path === '/foo').length).toBe(1)
    expect(app.handlers.filter(handler => handler.method === 'PATCH' && handler.path === '/foo').length).toBe(1)
    expect(app.handlers.filter(handler => handler.method === 'DELETE' && handler.path === '/foo').length).toBe(1)
})

test('Add middleware without path', () => {
    const middlewareHandler = (req, res) => console.log('Middleware')
    app.use(middlewareHandler)

    // Validate that we have one middleware
    expect(app.middlewares.middlewares.length).toBe(1)

    // Validate that we have one middleware with the path '/'
    expect(app.middlewares.middlewares.filter(middleware => middleware.path === '/').length).toBe(1)
})

test('Add middleware with path', () => {
    const middlewareHandler = (req, res) => console.log('Middleware')
    app.use('/foo', middlewareHandler)

    // Validate that we have one middleware
    console.log(JSON.stringify(app.middlewares.middlewares))
    expect(app.middlewares.middlewares.length).toBe(1)

    // Validate that we have one middleware with the path '/foo'
    expect(app.middlewares.middlewares.filter(middleware => middleware.path === '/foo').length).toBe(1)
})

// Dummy Advice used to test that the advice list is properly built
const dummyAdvice = (mode, req, res) => {
    if (mode === 'BEFORE') {
        console.log('BEFORE ADVICE')
    } else {
        console.log('AFTER ADVICE')
    }
}

test('Add around advice without path', () => {
    // Add an AROUND advice to the app without specifying a path
    app.advice('AROUND', dummyAdvice)

    // Validate that we have two advices: a BEFORE and AFTER, both with a path of '/'
    expect(app.adviceObject.adviceList.length).toBe(2)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(1)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(1)
})

test('Add around advice with path', () => {
    // Add an AROUND advice to the app, specifying a path
    app.advice('/foo', 'AROUND', dummyAdvice)

    // Validate that we have two advices: a BEFORE and AFTER, both with a path of '/'
    expect(app.adviceObject.adviceList.length).toBe(2)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/foo').length).toBe(1)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/foo').length).toBe(1)
})

test('Add before advice without path', () => {
    // Add an AROUND advice to the app without specifying a path
    app.advice('BEFORE', dummyAdvice)

    // Validate that we one have one BEFORE advice, with a path of '/'
    expect(app.adviceObject.adviceList.length).toBe(1)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(1)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(0)
})

test('Add before advice with path', () => {
    // Add an AROUND advice to the app without specifying a path
    app.advice('/foo', 'BEFORE', dummyAdvice)

    // Validate that we one have one BEFORE advice, with a path of '/foo'
    expect(app.adviceObject.adviceList.length).toBe(1)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/foo').length).toBe(1)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/foo').length).toBe(0)
})

test('Add after advice without path', () => {
    // Add an AROUND advice to the app without specifying a path
    app.advice('AFTER', dummyAdvice)

    // Validate that we one have one AFTER advice, with a path of '/'
    expect(app.adviceObject.adviceList.length).toBe(1)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(0)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(1)
})

test('Add after advice with path', () => {
    // Add an AROUND advice to the app without specifying a path
    app.advice('/foo', 'AFTER', dummyAdvice)

    // Validate that we one have one AFTER advice, with a path of '/foo'
    expect(app.adviceObject.adviceList.length).toBe(1)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/foo').length).toBe(0)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/foo').length).toBe(1)
})

test('Add invalid advice with no path', () => {
    // Add an invalid advice mode: AFTER_ALL
    app.advice('/foo', 'AFTER_ALL', dummyAdvice)

    // Validate that no advice was added
    expect(app.adviceObject.adviceList.length).toBe(0)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(0)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(0)
})

test('Add advice with wrong number of arguments', () => {
    app.advice(dummyAdvice)

    // Validate that no advice was added
    expect(app.adviceObject.adviceList.length).toBe(0)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(0)
    expect(app.adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(0)
})

test('App Execution no middleware or advice', async () => {
    app.get('/users', async (req, res) => {
        res.status(200)
            .set({'Location': `/users`})
            .json({email: req.query.email})
    })

    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const result = await app.handle(event)

    expect(result.statusCode).toBe(200)
    expect(result.headers['Location']).toBe('/users')
    expect(JSON.parse(result.body).email).toBe('somebody@somewhere.com')
})

test('App Execution with middleware success and no advice', async () => {
    // Create app
    app.get('/users', async (req, res) => {
        res.status(200)
            .set({'Location': `/users`})
            .json({email: req.query.email})
    })

    // Add middleware
    app.use((req, res, next) => {
        req.query.email = `${req.query.email}!`
        next()
    })

    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const result = await app.handle(event)

    expect(result.statusCode).toBe(200)
    expect(result.headers['Location']).toBe('/users')
    expect(JSON.parse(result.body).email).toBe('somebody@somewhere.com!')
})

test('App Execution with middleware failure and no advice', async () => {
    // Create app
    app.get('/users', async (req, res) => {
        res.status(200)
            .set({'Location': `/users`})
            .json({email: req.query.email})
    })

    // Add middleware: do not call next()
    app.use((req, res, next) => {
        res.status(500)
        res.json({error: 'Something bad happened'})
    })

    // Handle the event
    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const result = await app.handle(event)

    // Validate that the middleware stopped the execution and returned a 500 with the error body above and no headers
    expect(result.statusCode).toBe(500)
    expect(Object.keys(result.headers).length).toBe(0)
    expect(JSON.parse(result.body).error).toBe('Something bad happened')
})

test('App Execution with no middleware and around advice', async () => {
    // Create app
    app.get('/users', async (req, res) => {
        res.status(200)
            .set({'Location': `/users`})
            .json({email: req.query.email})
    })

    // Add advice
    let beforeAdviceCalled = false
    let afterAdviceCalled = false
    app.advice('AROUND', (mode, req, res) => {
        if (mode === 'BEFORE') {
            beforeAdviceCalled = true
        } else if (mode === 'AFTER') {
            afterAdviceCalled = true
        }
    })

    // Handle the event
    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const result = await app.handle(event)

    // Validate the response
    expect(result.statusCode).toBe(200)
    expect(result.headers['Location']).toBe('/users')
    expect(JSON.parse(result.body).email).toBe('somebody@somewhere.com')
    expect(beforeAdviceCalled).toBe(true)
    expect(afterAdviceCalled).toBe(true)
})

test('App Execution with middleware success and around advice', async () => {
    // Create app
    app.get('/users', async (req, res) => {
        res.status(200)
            .set({'Location': `/users`})
            .json({email: req.query.email})
    })

    // Add middleware
    app.use((req, res, next) => {
        req.query.email = `${req.query.email}!`
        next()
    })

    // Add advice
    let beforeAdviceCalled = false
    let afterAdviceCalled = false
    app.advice('AROUND', (mode, req, res) => {
        if (mode === 'BEFORE') {
            beforeAdviceCalled = true
        } else if (mode === 'AFTER') {
            afterAdviceCalled = true
        }
    })

    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const result = await app.handle(event)

    expect(result.statusCode).toBe(200)
    expect(result.headers['Location']).toBe('/users')
    expect(JSON.parse(result.body).email).toBe('somebody@somewhere.com!')
    expect(beforeAdviceCalled).toBe(true)
    expect(afterAdviceCalled).toBe(true)
})

test('App Execution with middleware failure and around advice', async () => {
    // Create app
    app.get('/users', async (req, res) => {
        res.status(200)
            .set({'Location': `/users`})
            .json({email: req.query.email})
    })

    // Add middleware
    app.use((req, res, next) => {
        res.status(500)
        res.json({error: 'Something bad happened'})
    })

    // Add advice
    let beforeAdviceCalled = false
    let afterAdviceCalled = false
    app.advice('AROUND', (mode, req, res) => {
        if (mode === 'BEFORE') {
            beforeAdviceCalled = true
        } else if (mode === 'AFTER') {
            afterAdviceCalled = true
        }
    })

    // Handle the event
    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const result = await app.handle(event)

    // Validate the response
    expect(result.statusCode).toBe(500)
    expect(Object.keys(result.headers).length).toBe(0)
    expect(JSON.parse(result.body).error).toBe('Something bad happened')
    expect(beforeAdviceCalled).toBe(false)
    expect(afterAdviceCalled).toBe(false)
})

test('App Execution with invalid path', async () => {
    app.get('/user', async (req, res) => {
        res.status(200)
            .set({'Location': `/users`})
            .json({email: req.query.email})
    })

    // Execute the event, which is looking for /users, not /user
    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const result = await app.handle(event)

    expect(result.statusCode).toBe(400)
    expect(Object.keys(result.headers).length).toBe(0)
    expect(JSON.parse(result.body).message).toBe('No request mapping found for GET /users')
})

test('App Execution that throws an error', async () => {
    // Create a handler that throws an error
    app.get('/users', async (req, res) => {
        throw 'Error message'
    })

    // Execute the event, which should execute our handler and throw an error
    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const result = await app.handle(event)

    // Validate the response
    expect(result.statusCode).toBe(500)
    expect(Object.keys(result.headers).length).toBe(0)

    const body = JSON.parse(result.body)
    expect(body.message).toBe('An error occurred')
    expect(body.error).toBe('"Error message"')
})