const response = require('../response')

test('Initial response state', () => {
    const res = response()

    expect(res.statusCode).toBe(200)
    expect(res.body).toBeNull()
    expect(Object.keys(res.headers).length).toBe(0)
})

test('Set header', () => {
    const res = response()
    const result = res.set({'X-Foo': 'bar'})

    // Validate that the header is set
    expect(Object.keys(res.headers).length).toBe(1)
    expect(res.headers['X-Foo']).toBe('bar')

    // Validate that the returns object is a reference to the original object
    expect(result).toBe(res)
})

test('Set multiple headers', () => {
    const res = response()
    const result = res.set({'X-Foo': 'bar', 'X-Bar': 'foo'})

    // Validate that the headers are set
    expect(Object.keys(res.headers).length).toBe(2)
    expect(res.headers['X-Foo']).toBe('bar')
    expect(res.headers['X-Bar']).toBe('foo')

    // Validate that the returns object is a reference to the original object
    expect(result).toBe(res)
})

test('JSON body', () => {
    const obj = {
        name: 'Foo',
        password: 'Bar'
    }

    const res = response()
    const result = res.json(obj)

    expect(res.body).toBe(JSON.stringify(obj))
    expect(result).toBe(res)
})

test('Plain text body: send()', () => {
    const res = response()
    const result = res.send('Hello, World')

    expect(res.body).toBe('Hello, World')
    expect(result).toBe(res)
})

test('Set status code', () => {
    const res = response()
    const result = res.status(500)

    expect(res.statusCode).toBe(500)
    expect(result).toBe(res)
})

test('Set invalid status code', () => {
    const res = response()
    const result = res.status('foo')

    expect(res.statusCode).toBe(200)
    expect(result).toBe(res)
})

test('Execute end method', () => {
    const res = response()
    const result = res.end()

    expect(result).toBe(res)
})