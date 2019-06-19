const fs = require('fs')
const request = require('../request')

test('Parse GET Event', () => {
    // Create a request object from a sample event
    const req = request(JSON.parse(fs.readFileSync(__dirname + '/events/get-users-by-email-event.json', 'utf8')))

    // Validate fields
    expect(req.method).toBe('GET')
    expect(req.resource).toBe('/users')
    expect(req.path).toBe('/users')
    expect(req.query.email).toBe('somebody@somewhere.com')
    expect(req.headers['Accept']).toBe('*/*')

    // Test get(header)
    expect(req.get('Accept')).toBe('*/*')
})

test('Parse POST Event', () => {
    const req = request(JSON.parse(fs.readFileSync(__dirname + '/events/post-confirm-user-event.json', 'utf8')))

    expect(req.method).toBe('POST')
    expect(req.resource).toBe('/confirm')
    expect(req.path).toBe('/confirm')
    expect(req.headers['Accept']).toBe('*/*')
    expect(req.body.email).toBe('someone@somewhere.com')
    expect(req.body.confirmationToken).toBe('464edb88-fe24-4c6b-bd36-0c778ea2acd7')
})