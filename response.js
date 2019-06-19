function createResponse() {
    // Create a response object
    const res = {
        statusCode: 200,
        headers: {},
        body: null
    }

    /**
     * Adds the specified header dictionary values to the response headers
     * @param header    A dictionary containing key/value header pairs
     * @returns         The response object
     */
    res.set = header => {
        for (const key in header) {
            res.headers[key] = header[key]
        }
        return res
    }

    /**
     * Sets the response body to a JSON string representation of the specified object.
     * @param obj   The object to set as the body of the response
     * @returns     The response object
     */
    res.json = obj => {
        res.body = JSON.stringify(obj)
        return res
    }

    /**
     * Sets the body of the response to the specified value.
     * @param value     The value to set as the body
     * @returns         The response object
     */
    res.send = value => {
        res.body = value
        return res
    }

    /**
     * Sets the HTTP status code of the response
     * @param status    The status code response number, e.g. 200 or 404
     * @returns         The response object
     */
    res.status = status => {
        // Validate that status is a number before setting it
        if (!isNaN(parseFloat(status)) && isFinite(status)) {
            res.statusCode = status
            return res
        }

        // Invalid status code: must be a number
        return res
    }

    /**
     * Ends the response; note that this added for compatibility with Express, this function does nothing.
     * @returns     The response object
     */
    res.end = () => res

    // Return the response object
    return res
}

module.exports = createResponse