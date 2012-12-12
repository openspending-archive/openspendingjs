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
        var f = $.extend({}, state.cuts);
        if (el.data('year')) {
          if (el.data('year')==f.year) {
            el.addClass('disable');
          } else {
            f.year = el.data('year');
            el.removeClass('disable');
          }
        }
        if (el.data('art')) {
          if (el.data('art')==f.kontotyp) {
            el.addClass('disable');
          } else {
            f.kontotyp = el.data('art');
            el.removeClass('disable');
          }
        }
        el.prop('href', '#' + router.getFragment(f));
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
      this.navigate(this.getFragment(filters), {trigger: true});
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
});
