OpenSpending = "OpenSpending" in window ? OpenSpending : {}

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

OpenSpending.DailyBread = function (elem, initialIncome) {
  var self = this

  this.$e = $(elem)
  this.$e.data('wdmmg.dailybread', this)

  this.tiers = []
  this.areas = []

  this.init = function (income) {
    this.$e.find('.wdmmg-slider').slider({
      value: income,
      min: 10000,
      max: 500000,
      step: 100,
      animate: true,
      slide: function () {
        self.sliderUpdated.apply(self, arguments)
      }
    })
    self.salaryVal = income;
    this.calculateTax(income, function() {
      self.draw();
    })
  }

  this.sliderUpdated = function (evt, sld) {
    self.salaryVal = sld.value;
    self.calculateTax(self.salaryVal, function() {
      self.draw()
    })
  }

  this.calculateTax = function (salary, callback) {
    var url = 'http://openspending.org/api/mytax?callback=?&income=' + salary;
    $.getJSON(url, function(data) {
      self.taxVal = parseFloat(data['tax']);
      var _tmp = $.extend(true, {}, data);
      self.taxInfo = {
        'explanation': data['explanation'],
        'total': parseFloat(data['tax']),
        'tree': self.makeTree(data)
      }
      callback();
    });
  }

  this.makeTree = function(data) {
    var color = '90';
    var tmpl = {
      "id": "root",
      "name": 'Total tax',
      "data": { "$area": data['tax'], "$color": color },
      "children": []
    };
    function makeNode(name, amount) {
      var _node = $.extend(true, {}, tmpl);
      _node.id = '__treemap__' + name.replace(' ', '-');
      _node.name = name + ' ' + formatCurrency(parseFloat(amount));
      _node.data.$area = amount;
      return _node;
    }
    var root = makeNode('Total Tax', data['tax']);
    var direct = makeNode('Direct Tax', data['total_direct_tax']);
    root.children.push(direct);
    var indirect = makeNode('Indirect Tax', data['total_indirect_tax']);
    root.children.push(indirect);
    var extra_indirect = data['total_indirect_tax'];
    $.each(['vat', 'alcohol_tax', 'tobacco_tax', 'car_related_tax'], function(idx, item) {
        indirect.children.push(makeNode(item.replace(/_/g, ' '), data[item]));
        extra_indirect += -data[item];
    });
    indirect.children.push(makeNode('Other Indirect', extra_indirect));
    return root;
  }

  this.draw = function () {
    $('#salary p').text(formatCurrency(self.salaryVal, 0))
    $('#tax p').text(formatCurrency(self.taxVal, 0))
    var expl = $('.explanation');
    expl.html('');
    $.each(self.taxInfo.explanation, function(idx, item) {
      expl.append($('<p></p>').html(item));
    });
    createTreeMap(self.taxInfo.tree, 'infovis', 'Amount');
  }

  this.init(initialIncome)
  return this
}

$(function () {
  var initialIncome = 22000;
  var tax = new OpenSpending.DailyBread($('#wrapper'), initialIncome)
})

})(jQuery)
