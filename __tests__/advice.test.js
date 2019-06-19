const advice = require('../advice')

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
    const adviceObject = advice()
    adviceObject.addAdvice('AROUND', dummyAdvice)

    // Validate that we have two advices: a BEFORE and AFTER, both with a path of '/'
    expect(adviceObject.adviceList.length).toBe(2)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(1)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(1)
})

test('Add around advice with path', () => {
    // Add an AROUND advice to the app, specifying a path
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'AROUND', dummyAdvice)

    // Validate that we have two advices: a BEFORE and AFTER, both with a path of '/'
    expect(adviceObject.adviceList.length).toBe(2)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/foo').length).toBe(1)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/foo').length).toBe(1)
})

test('Add before advice without path', () => {
    // Add an AROUND advice to the app without specifying a path
    const adviceObject = advice()
    adviceObject.addAdvice('BEFORE', dummyAdvice)

    // Validate that we one have one BEFORE advice, with a path of '/'
    expect(adviceObject.adviceList.length).toBe(1)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(1)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(0)
})

test('Add before advice with path', () => {
    // Add an AROUND advice to the app without specifying a path
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'BEFORE', dummyAdvice)

    // Validate that we one have one BEFORE advice, with a path of '/foo'
    expect(adviceObject.adviceList.length).toBe(1)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/foo').length).toBe(1)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/foo').length).toBe(0)
})

test('Add after advice without path', () => {
    // Add an AROUND advice to the app without specifying a path
    const adviceObject = advice()
    adviceObject.addAdvice('AFTER', dummyAdvice)

    // Validate that we one have one AFTER advice, with a path of '/'
    expect(adviceObject.adviceList.length).toBe(1)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(0)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(1)
})

test('Add after advice with path', () => {
    // Add an AROUND advice to the app without specifying a path
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'AFTER', dummyAdvice)

    // Validate that we one have one AFTER advice, with a path of '/foo'
    expect(adviceObject.adviceList.length).toBe(1)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/foo').length).toBe(0)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/foo').length).toBe(1)
})

test('Add invalid advice with no path', () => {
    // Add an invalid advice mode: AFTER_ALL
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'AFTER_ALL', dummyAdvice)

    // Validate that no advice was added
    expect(adviceObject.adviceList.length).toBe(0)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(0)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(0)
})

test('Add advice with wrong number of arguments', () => {
    const adviceObject = advice()
    adviceObject.addAdvice(dummyAdvice)

    // Validate that no advice was added
    expect(adviceObject.adviceList.length).toBe(0)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'BEFORE' && advice.path ==='/').length).toBe(0)
    expect(adviceObject.adviceList.filter(advice => advice.mode === 'AFTER' && advice.path ==='/').length).toBe(0)
})

test('Build Advice Chain', () => {
    // Add three advices: BEFORE without path, AFTER without a path, and AROUND with path '/foo'
    const adviceObject = advice()
    adviceObject.addAdvice('AFTER', dummyAdvice)
    adviceObject.addAdvice('BEFORE', dummyAdvice)
    adviceObject.addAdvice('/foo', 'AROUND', dummyAdvice)

    // Build the advice chain for '/foo'
    const adviceChain = adviceObject.buildAdviceChain('/foo', 'BEFORE')

    // Verify that we have two BEFORE advices: one for '/' and one for '/foo'
    expect(adviceChain.length).toBe(2)
    expect(adviceChain.filter(a => a.path === '/').length).toBe(1)
    expect(adviceChain.filter(a => a.path === '/foo').length).toBe(1)
})

test('Execute before advice', async () => {
    // Create a before advice
    let beforeAdviceRan = false
    const beforeAdvice = (mode, req, res) => {
        if (mode === 'BEFORE') {
            beforeAdviceRan = true
        }
    }

    // Add the advice to an advice object
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'BEFORE', beforeAdvice)

    // Execute the advice
    await adviceObject.executeBeforeAdvice('/foo')

    // Confirm that it ran
    expect(beforeAdviceRan).toBe(true)
})

test('Execute before advice with promise', async () => {
    // Create a before advice
    let beforeAdviceRan = false
    const beforeAdvice = async (mode, req, res) => {
        if (mode === 'BEFORE') {
            beforeAdviceRan = true
        }
    }

    // Add the advice to an advice object
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'BEFORE', beforeAdvice)

    // Execute the advice
    await adviceObject.executeBeforeAdvice('/foo')

    // Confirm that it ran
    expect(beforeAdviceRan).toBe(true)
})


test('Execute after advice', async () => {
    // Create an after advice
    let afterAdviceRan = false
    const afterAdvice = (mode, req, res) => {
        if (mode === 'AFTER') {
            afterAdviceRan = true
        }
    }

    // Add the advice to an advice object
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'AFTER', afterAdvice)

    // Execute the advice
    await adviceObject.executeAfterAdvice('/foo')

    // Confirm that it ran
    expect(afterAdviceRan).toBe(true)
})

test('Execute after advice with promise', async () => {
    // Create an after advice
    let afterAdviceRan = false
    const afterAdvice = async (mode, req, res) => {
        if (mode === 'AFTER') {
            afterAdviceRan = true
        }
    }

    // Add the advice to an advice object
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'AFTER', afterAdvice)

    // Execute the advice
    await adviceObject.executeAfterAdvice('/foo')

    // Confirm that it ran
    expect(afterAdviceRan).toBe(true)
})

test('Execute around advice', async () => {
    // Create an after advice
    let beforeAdviceRan = false
    let afterAdviceRan = false
    const aroundAdvice = (mode, req, res) => {
        if (mode === 'AFTER') {
            afterAdviceRan = true
        } else if (mode === 'BEFORE') {
            beforeAdviceRan = true
        }
    }

    // Add the advice to an advice object
    const adviceObject = advice()
    adviceObject.addAdvice('/foo', 'AROUND', aroundAdvice)

    // Execute the advice
    await adviceObject.executeBeforeAdvice('/foo')
    await adviceObject.executeAfterAdvice('/foo')

    // Confirm that it ran
    expect(beforeAdviceRan).toBe(true)
    expect(afterAdviceRan).toBe(true)
})