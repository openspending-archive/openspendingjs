WDMMG = "WDMMG" in window ? WDMMG : {}

;(function ($) {

var formatCurrency = function (val, prec, sym, dec, sep) {
  prec = prec === undefined ? 2 : prec
  sym = sym || '£'
  dec = dec || '.'
  sep = sep || ','

  var str
  var valAry = val.toFixed(prec).split('.')
  var sepAry = []

  for(var i = valAry[0].length; i > 2; i -= 3) {
    sepAry.unshift(valAry[0].slice(i-3, i))
  }
  if (i !== 0) { sepAry.unshift(valAry[0].slice(0, i)) }

  str = sym + sepAry.join(sep)
  if (prec > 0) str += dec + valAry[1]

  return str
}

WDMMG.DailyBread = function (elem) {
  var self = this

  this.$e = $(elem)
  this.$e.data('wdmmg.dailybread', this)

  this.tiers = []
  this.areas = []

  this.init = function () {
    this.setSalary(22000) // default starting salary

    this.$e.find('.wdmmg-slider').slider({
      value: this.salaryVal,
      min: 10000,
      max: 200000,
      step: 10,
      animate: true,
      slide: function () { self.sliderUpdated.apply(self, arguments) }
    })

    this.$e.delegate('.db-area-col', 'click', this.handleClick)
  }

  this.sliderUpdated = function (evt, sld) {
    self.setSalary(sld.value)
    self.sliderUpdate = true
    self.draw()
    self.sliderUpdate = false
  }

  this.handleClick = function () {
    var tier = $(this).closest('.db-tier')
    var tierId = parseInt(tier.attr('data-db-tier'), 10)
    var areaId = parseInt($(this).attr('data-db-area'), 10)

    // Update current selected area
    self.areas[tierId] = areaId
    // Slice off more specific selections
    self.areas = self.areas.slice(0, tierId + 1)

    tier
      .find('.db-area-col')
      .removeClass('active')
    .end()
      .find('[data-db-area='+areaId+']')
      .addClass('active')

    self.drawTier(tierId + 1)

    // Hide old tiers
    self.$e.find('.db-tier').each(function () {
      if ($(this).attr('data-db-tier') > tierId + 1) {
        $(this).hide()
      }
    })
  }

  this.setData = function (data) {
    self.data = data
  }

  this.setSalary = function (salary) {
    self.salaryVal = salary
    self.taxVal = 0.4 * salary
  }

  this.draw = function () {
    self.drawTotals()
    self.drawTier(0)
    for (var i = 0, tot = self.tiers.length; i < tot; i += 1) {
      self.drawTier(i)
    }
  }

  this.drawTotals = function () {
    $('#db-salary p').text(formatCurrency(self.salaryVal, 0))
    $('#db-tax p').text(formatCurrency(self.taxVal, 0))
  }

  this.drawTier = function (tierId) {
    var tdAry = self.taxAndDataForTier(tierId)
    if (!tdAry) { return } // No child tier for selected area.
    var tax = tdAry[0], data = tdAry[1]

    var t = self.tiers[tierId] = self.tiers[tierId] || $("<div class='db-tier' data-db-tier='" + tierId + "'></div>").appendTo(self.$e)
    var n = data.length
    var w = 100.0 / n

    if (!self.sliderUpdate) {
      var tpl = "<div class='db-area-row'>" +
                "<% _.each(areas, function(area, idx) { %>" +
                "  <div class='db-area-col db-area-title' style='width: <%= width %>%;' data-db-area='<%= idx %>'>" +
                "    <h3><%= area[0] %></h3>" +
                "  </div>" +
                "<% }); %>" +
                "</div>" +
                "<div class='db-area-row'>" +
                "<% _.each(areas, function(area, idx) { %>" +
                "  <div class='db-area-col' style='width: <%= width %>%;' data-db-area='<%= idx %>'>" +
                "    <div class='db-area-icon'></div>" +
                "    <div class='db-area-value'></div>" +
                "  </div>" +
                "<% }); %>" +
                "</div>"

      t.html(_.template(tpl, { activeArea: self.areas[tierId], areas: data, width: w }))
    }

    // Update values
    var valEls = t.find('.db-area-value')
    _.each(data, function (area, idx) {
      valEls.eq(idx).text(formatCurrency(tax * area[1], 2))
    })

    t.show()
  }

  this.taxAndDataForTier = function (tierId) {
    var data = self.data
    var tax = self.taxVal
    var areaId

    for (var i = 0, tot = tierId; i < tierId; i += 1) {
      areaId = self.areas[i]
      if (data[areaId]) {
        tax = tax * data[areaId][1]
        data = data[areaId][2]
      } else {
        return null
      }
    }
    return [tax, data]
  }

  this.init()
  return this
}

data = [ [ "Social Protection",                0.000969904666453826, [ [ "Old Age",                                    0.366666666666667,  [] ]
                                                                     , [ "Sickness and Disability",                    0.161020833333333,  [] ]
                                                                     , [ "Family and Children",                        0.1439375,          [] ]
                                                                     , [ "Social Exclusion N.E.C",                     0.0708125,          [] ]
                                                                     , [ "Unemployment",                               0.0254791666666667, [ [ "Jobseekers allowance", 0.66, [] ]
                                                                                                                                          ,  [ "HR incentive schemes", 0.34, [] ]
                                                                                                                                           ] ]
                                                                     , [ "Social Protection N.E.C",                    0.0245833333333333, [] ]
                                                                     , [ "Housing",                                    0.0168333333333333, [] ]
                                                                     , [ "Survivors",                                  0.0118333333333333, [] ]
                                                                     , [ "R&D Social Protection",                      0.0,                [] ]
                                                                     ] ]
       , [ "Health",                           0.000466766620730904, [ [ "Medical Products, Appliances and Equipment", 0.96969696969697,    [] ]
                                                                     , [ "Public Health Services",                     0.02004329004329,    [] ]
                                                                     , [ "R&D Health",                                 0.00627705627705628, [] ]
                                                                     ] ]
       , [ "Education",                        0.000379879327694415, [ [ "Schools",                                    0.96969696969697,    [] ]
                                                                     , [ "Youth projects",                             0.02004329004329,    [] ]
                                                                     , [ "University subsidy",                         0.00627705627705628, [] ]
                                                                     ] ]
       , [ "General Public Services",          0.000232372993004563, [] ]
       , [ "Economic Affairs",                 0.000206104741621438, [] ]
       , [ "Defence",                          0.000179654633113354, [] ]
       , [ "Public Order and Safety",          0.000162984396658678, [] ]
       , [ "Recreation, Culture and Religion", 0.000060073470278484, [] ]
       , [ "Housing and Community Amenities",  0.000041786726046386, [] ]
       , [ "Environmental Protection",         0.000038735567616500, [] ]
       ]

$(function () {
  var db = new WDMMG.DailyBread($('#dailybread'))
  db.setData(data)
  db.draw()
})

})(jQuery)