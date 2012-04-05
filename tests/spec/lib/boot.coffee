describe 'lib/boot', ->
  it 'should define the OpenSpending object', ->
    # NB: this test doesn't *really* test this, as it just tests that said
    # variable is available after all the source files have loaded.
    # Nonetheless, it serves as a statement of intent.
    expect(OpenSpending).to.exist

  it 'should define OpenSpending.getGlobal() to return the environment global object', ->
    expect(OpenSpending.getGlobal()).to.equal(module ? window)

  it 'should define OpenSpending.{jQuery,$} for OpenSpending\'s use', ->
    expect(OpenSpending.jQuery).to.exist
    expect(OpenSpending.$).to.exist
    expect(OpenSpending.jQuery.ajax).to.exist
    expect(OpenSpending.$.ajax).to.exist

  it 'should define OpenSpending.ajaxError, an ajax error handler', ->
    g = OpenSpending.getGlobal()
    if g.hasOwnProperty('console')
      stub = sinon.stub(g.console, 'error')
    else
      stub = sinon.stub(g, 'alert')

    callback = OpenSpending.ajaxError('msg')
    callback('rq', 'x', 'status')
    expect(stub).to.have.been.calledOnce
    stub.restore()

