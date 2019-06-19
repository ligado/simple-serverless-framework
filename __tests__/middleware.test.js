const fs = require('fs')
const middleware = require('../middleware')
const request = require('../request')
const response = require('../response')

test('Add two middlewares without path', () => {
    const mw = middleware()
    mw.use((req, res, next) => 'foo')
    mw.use((req, res, next) => 'bar')

    expect(mw.middlewares.length).toBe(2)
    expect(mw.middlewares.filter(m => m.path === '/').length).toBe(2)
})

test('Add two middlewares with path', () => {
    const mw = middleware()
    mw.use('/foo', (req, res, next) => 'foo')
    mw.use('/bar', (req, res, next) => 'bar')

    expect(mw.middlewares.length).toBe(2)
    expect(mw.middlewares.filter(m => m.path === '/foo').length).toBe(1)
    expect(mw.middlewares.filter(m => m.path === '/bar').length).toBe(1)
})

test('Add two middlewares with and without paths', () => {
    const mw = middleware()
    mw.use('/foo', (req, res, next) => 'foo')
    mw.use((req, res, next) => 'bar')

    expect(mw.middlewares.length).toBe(2)
    expect(mw.middlewares.filter(m => m.path === '/foo').length).toBe(1)
    expect(mw.middlewares.filter(m => m.path === '/').length).toBe(1)
})

test('Execute two middlewares that succeed', async () => {
    // Create a new middleware object with two middlewares that record whether or not they ran
    const mw = middleware()
    let mw1Ran = false
    mw.use((req, res, next) => {
        mw1Ran = true
        next()
    })
    let mw2Ran = false
    mw.use((req, res, next) => {
        mw2Ran = true
        next()
    })

    // Execute the middleware chain
    const result = await mw.execute('foo', 'bar')

    // Validate that it was successful and that both middlewares ran
    expect(result).toBe(true)
    expect(mw1Ran).toBe(true)
    expect(mw2Ran).toBe(true)
})

test('Execute two middlewares first succeeds, second fails', async () => {
    // Create a new middleware object with two middlewares that record whether or not they ran
    const mw = middleware()
    let mw1Ran = false
    mw.use((req, res, next) => {
        mw1Ran = true
        next()
    })
    let mw2Ran = false
    mw.use((req, res, next) => {
        mw2Ran = true
    })

    // Execute the middleware chain
    const result = await mw.execute('foo', 'bar')

    // Validate that it failed and that both middlewares ran
    expect(result).toBe(false)
    expect(mw1Ran).toBe(true)
    expect(mw2Ran).toBe(true)
})

test('Execute two middlewares first fails', async () => {
    // Create a new middleware object with two middlewares that record whether or not they ran
    const mw = middleware()
    let mw1Ran = false
    mw.use((req, res, next) => {
        mw1Ran = true
    })
    let mw2Ran = false
    mw.use((req, res, next) => {
        mw2Ran = true
        next()
    })

    // Execute the middleware chain
    const result = await mw.execute('foo', 'bar')

    // Validate that it failed, that the first ran, and the second did not
    expect(result).toBe(false)
    expect(mw1Ran).toBe(true)
    expect(mw2Ran).toBe(false)
})

test('Two middlewares with different paths', async () => {
    // Create a new middleware object with two middlewares that record whether or not they ran
    const mw = middleware()
    let mw1Ran = false
    mw.use('/users', (req, res, next) => {
        mw1Ran = true
        next()
    })
    let mw2Ran = false
    mw.use('/bar', (req, res, next) => {
        mw2Ran = true
        next()
    })

    // Execute the middleware chain
    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const req = request(event)
    const result = await mw.execute(req, 'foo')

    // Validate that the operation was successful, that the first middleware ran, and the second did not (because its
    // path did not match
    expect(result).toBe(true)
    expect(mw1Ran).toBe(true)
    expect(mw2Ran).toBe(false)
})

test('Execute a middleware with no middleware functions', async () => {
    const mw = middleware()
    const result = await mw.execute('foo', 'bar')
    expect(result).toBe(true)
})

test('Add header to request', async () => {
    const event = JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8'))
    const req = request(event)
    const res = response()

    const mw = middleware()
    mw.use((req, res, next) => {
        req.headers['X-SampleHeader'] = 'Sample Value'
        next()
    })
    const result = await mw.execute(req, res)
    expect(result).toBe(true)
    expect(req.headers['X-SampleHeader']).toBe('Sample Value')
})