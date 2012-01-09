
class AssertionException
  constructor: (msg) -> @msg = msg
  toString: -> 'AssertionException: ' + @msg

assert = (p, msg) -> unless p then throw new AssertionException(msg)

test =
  run_all: (me) ->
    tests =
      sanity: ( true == true )

      colsGetFillEvents: ( $(me).find($('select.column')).length )

      fieldsetsUnderEditor: ( $(me).find('.forms form fieldset').length )

      actionsUnderEditor: ( $(me).find('.dimensions_widget')
                                 .find('.add_measure').length )

      rmDimensionUnderEditor: ( $(me).find('.dimensions_widget')
                                     .find('.rm_dimension').length )

      tabs: ( $(me).find('.modeleditor').children('fieldset')
                   .filter('.dimension').filter('.tab-pane').length )

    for name, test of tests
      assert test, name
      console.log("PASS ", name)
