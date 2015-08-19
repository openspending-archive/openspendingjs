OpenSpending = "OpenSpending" in window ? OpenSpending : {};

(function ($) {

TAXMAN_URL = 'http://taxman.openspending.org';

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

OpenSpending.DailyBread = function (elem, opts) {
  var self = this

  this.opts = opts || {};

  this.$e = $(elem)
  this.$e.data('wdmmg.dailybread', this)

  this.tiers = []
  this.areas = []
  this.iconLookup = function (name) { return undefined; };

  this.init = function () {
    this.setSalary(self.opts.defaultsalary || 22000); // default starting salary

    this.$e.find('.wdmmg-slider').slider({
      value: this.salaryVal,
      min: self.opts.minimumsalary || 10000,
      max: self.opts.maximumsalary || 200000,
      step: self.opts.salarystep || 10,
      animate: true,
      slide: function () { self.sliderSlide.apply(self, arguments) },
      change: function () { self.sliderChange.apply(self, arguments) }
    })

    this.$e.delegate('.db-area-col', 'click', self.handleClick)
  }

  this.sliderSlide = function (evt, sld) {
    self.setSalary(sld.value);
    self.drawTotals();
  }

  this.sliderChange = function (evt, sld) {
    self.setSalary(sld.value);
    self.draw(true);
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

    // Simulate a click so that auto resize can happen on
    // wheredoesmymoneygo.com. Sadly custom events won't work here, and only
    // click appears to do the trick.
    $(self.$e).click();
  }

  this.setData = function (data) {
    self.data = data
  }

  this.setDataFromAggregator = function (data, skip) {
    handleChildren = function(node, absolute) {
      return _.map(
        _.filter(node.children, function(child) {
          return _.indexOf(skip, child.name);
        }),
        function(child) {
          var daily = (child.amount / node.amount);
          if (absolute) daily = daily / 365.0;
          return [child.name, child.label, daily, handleChildren(child, false)];
        });
    }
    self.setData(handleChildren(data, true));
  }

  this.setIconLookup = function(lookup) {
    self.iconLookup = lookup;
  }

  this.setSalary = function (salary) {
    self.salaryVal = salary;
  }

  this.getTaxVal = function () {
      var rq = $.getJSON(TAXMAN_URL + '/'+(self.opts.country || 'gb')+'?callback=?', $.extend({
	  year: 2010,
	  indirects: true,
	  income: self.salaryVal
      }, self.opts.taxman));

    rq.then(function (data) {
      self.taxVal = data.calculation.total;
    })

    return rq;
  }

  this.draw = function (sliderUpdate) {
    var _draw = function _draw () {
      self.drawTotals();
      if (self.tiers.length === 0) {
        self.drawTier(0, sliderUpdate);
      } else {
        for (var i = 0, tot = self.tiers.length; i < tot; i += 1) {
          self.drawTier(i, sliderUpdate);
        }
      }
    };

    var taxUndef = (typeof self.taxVal === 'undefined' || self.taxVal == null);

    if (sliderUpdate || taxUndef) {
      self.getTaxVal().then(_draw);
    } else {
      _draw();
    }
  }

  this.drawTotals = function () {
      $('#db-salary p').text(formatCurrency(self.salaryVal, 0, self.opts.symbol))
      $('#db-tax p').text(formatCurrency(self.taxVal, 0, self.opts.symbol))
  }

  this.drawTier = function (tierId, sliderUpdate) {
    var tdAry = self.taxAndDataForTier(tierId)
    if (!tdAry) { return } // No child tier for selected area.
    var tax = tdAry[0], data = tdAry[1]

    var t = self.tiers[tierId] = self.tiers[tierId] || $("<div class='db-tier' data-db-tier='" + tierId + "'></div>").appendTo(self.$e)
    var n = data.length
    var w = 100.0 / n

    var icons = _.map(data, function(d) { return self.iconLookup(d[0]); });

    if (!sliderUpdate) {
      var tpl = "<div class='db-area-row'>" +
                "<% _.each(areas, function(area, idx) { %>" +
                "  <div class='db-area-col db-area-title' style='width: <%= width %>%;' data-db-area='<%= idx %>'>" +
                "    <h3><%= area[1] %></h3>" +
                "  </div>" +
                "<% }); %>" +
                "</div>" +
                "<div class='db-area-row'>" +
                "<% _.each(areas, function(area, idx) { %>" +
                "  <div class='db-area-col' style='width: <%= width %>%;' data-db-area='<%= idx %>'>" +
                "    <div class='db-area-icon' data-svg-url='<%= icons[idx] %>'></div>" +
                "    <div class='db-area-value'></div>" +
                "  </div>" +
                "<% }); %>" +
                "</div>"

      t.html(_.template(tpl, { activeArea: self.areas[tierId], areas: data, width: w, icons: icons }))

      self.drawIcons(t);
    }

    // Update values
    var valEls = t.find('.db-area-value')
    _.each(data, function (area, idx) {
	valEls.eq(idx).text(formatCurrency(tax * area[2], 2, self.opts.symbol))
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
        tax = tax * data[areaId][2]
        data = data[areaId][3]
      } else {
        return null
      }
    }
    return [tax, data]
  }

  this.drawIcons = function(t) {
    var iconRad = 35;
    $('.db-area-icon svg', t).remove();
    $('.db-area-icon', t).each(function(i,e) {
      var iconUrl, paper;
      iconUrl = $(e).data('svg-url');
      paper = Raphael(e, iconRad+iconRad,iconRad+iconRad+5);
      paper.circle(iconRad,iconRad,iconRad).attr({ fill: '#830242', stroke: 'none' });
      paper.circle(iconRad,iconRad,iconRad-2).attr({ fill: 'none', stroke: '#eee', opacity: .8, 'stroke-dasharray': '- ' });
      $.get(iconUrl, function(svg) {
        if (typeof(svg) == "string") {
          svg = $(svg);
          svg = svg[svg.length-1];
        }
        if (!svg.getElementsByTagName) return;
        var j, icon,
        joined='',
        paths = svg.getElementsByTagName('path');
        for (j=0;j<paths.length;j++) joined += paths[j].getAttribute('d')+' ';
        icon = paper.path(joined);
        icon.attr({ fill: 'white', stroke: 'none' });
        icon.scale(iconRad/50, iconRad/50, 0, 0);
      });
    });
  }

  this.init()
  return this
}

})(jQuery)

