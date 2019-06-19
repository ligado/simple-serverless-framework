const isPromise = obj => {
    return obj.__proto__.toString() === "[object Promise]"
}

function createAdvice() {
    const advice = {
        adviceList: []
    }

    advice.addAdvice = (...args) => {
        // Derive our parameters from the specified arguments
        let uri = null
        let mode = null
        let handler = null
        if (args.length === 3) {
            uri = args[0]
            mode = args[1]
            handler = args[2]
        } else if (args.length === 2) {
            uri = '/'
            mode = args[0]
            handler = args[1]
        } else {
            // Invalid number of arguments
            return
        }

        // Validate the mode
        if (!(mode === 'BEFORE' || mode === 'AFTER' || mode === 'AROUND')) {
            // Invalid advice mode
            return
        }

        if (mode === 'AROUND') {
            // AROUND advice is added twice: once with a BEFORE mode and once with an AFTER mode
            advice.adviceList.push({path: uri, mode: 'BEFORE', handler: handler})
            advice.adviceList.push({path: uri, mode: 'AFTER', handler: handler})
        } else {
            // Add the advice, as specified by the caller
            advice.adviceList.push({path: uri, mode: mode, handler: handler})
        }
    }

    advice.buildAdviceChain = (resource, mode) => {
        return advice.adviceList
            .filter(a => a.path === resource || a.path === '/')
            .filter(a => a.mode === mode)
    }

    advice.executeBeforeAdvice = async (resource, req, res) => {
        const beforeAdviceChain = advice.buildAdviceChain(resource, 'BEFORE')
        for (let i = 0; i < beforeAdviceChain.length; i++) {
            const beforeAdvice = beforeAdviceChain[i]
            const result = beforeAdvice.handler.apply(null, ['BEFORE', req, res])
            if (result && isPromise(result)) {
                await result
            }
        }
    }

    advice.executeAfterAdvice = async (resource, req, res) => {
        const adviceChain = advice.buildAdviceChain(resource, 'AFTER')
        for (let i = 0; i < adviceChain.length; i++) {
            const afterAdvice = adviceChain[i]
            const result = afterAdvice.handler.apply(null, ['AFTER', req, res])
            if (result && isPromise(result)) {
                await result
            }
        }
    }

    return advice
}

module.exports = createAdvice