$(function() {
  var context = {
    dataset: "de_he_giessen",
    siteUrl: "http://openspending.org",
    pagesize: 50,
    callback: function(name) {
      console.log("HUHU");
      },
    render: function(router, state) {
      $('.openspending-link-filter').each(function(i, el) {
        el = $(el);
        var cuts = state.cuts;
        if (el.data('year')) {
          if (el.data('year')==cuts.year) {
            el.addClass('disable');
          } else {
            el.removeClass('disable');
          }
        }
        if (el.data('kontotyp')) {
          if (el.data('kontotyp')==cuts.kontotyp) {
            el.addClass('disable');
          } else {
            el.removeClass('disable');
          }
        }
      });
      }
    };

  OpenSpending.scriptRoot = "/openspendingjs";

  OpenSpending.WidgetLink = Backbone.Router.extend({
    routes: {
        "": "home",
        "*args": "drilldown"
    },

    home: function() {
      this.setFilters(this.treetable.filters);
    },

    drilldown: function(args) {
      var widget = this.treetable;
      var currentFilters = this.getFilters();
      var currentDrilldown = _.find(widget.drilldowns, function(d) {
        return -1 == _.indexOf(_.keys(currentFilters), d);
      });

      var state = {
        drilldowns: [currentDrilldown],
        cuts: currentFilters
      };

      widget.context.render(this, state);
      widget.render(state, function(name) {
        if (_.indexOf(widget.drilldowns, currentDrilldown) >= widget.drilldowns.length-1) {
          widget.context.callback(name);
        } else {
          var filters = _.extend({}, currentFilters);
          filters[currentDrilldown] = name
          this.setFilters(filters);
        }
      });
    },

    getFragment: function(filters) {
      return _.map(_.keys(filters), function(k) {
        return k + ':' + filters[k];
      }).join('/');
    },

    setFilters: function(filters) {
      var newFilters = $.extend({}, this.getFilters(), filters);
      this.navigate(this.getFragment(newFilters), {trigger: true});
    },

    getFilters: function() {
      var filters = {};
      _.each(Backbone.history.fragment.split('/'), function(kv) {
        var kv_ = kv.split(':', 2);
        filters[kv_[0]] = kv_[1];
      });
      return filters;
    },

    initialize: function(elem, context, filters, drilldowns) {
      this.treetable = OpenSpending.Treetable(elem, context, filters, drilldowns);
    },
  });

  OpenSpending.app = new OpenSpending.WidgetLink($('#treetable_widget'), context, {'kontotyp': 'Ertrag', 'year': '2012'}, ['teilhaushalt', 'kostentraeger']);

  $('.openspending-link-filter').click(function () {
    var element = $(this);
    OpenSpending.app.setFilters(element.data());
    return false;
  });
});
