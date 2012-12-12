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

  OpenSpending.scriptRoot = "http://localhost/openspendingjs";

  OpenSpending.WidgetLink = Backbone.Router.extend({
    routes: {
        "": "home",
        "*args": "drilldown"
    },

    home: function() {
      this.setFilters(this.filters);
    },

    drilldown: function(args) {
      var router = this;
      var currentFilters = this.getFilters();
      var currentDrilldown = _.find(this.drilldowns, function(d) {
        return -1 == _.indexOf(_.keys(currentFilters), d);
      });

      var state = {
        drilldowns: [currentDrilldown],
        cuts: currentFilters
      };

      this.render(state, function(name) {
        if (_.indexOf(router.drilldowns, currentDrilldown) >= router.drilldowns.length-1) {
          router.context.callback(name);
        } else {
          var filters = _.extend({}, currentFilters);
          filters[currentDrilldown] = name
          router.setFilters(filters);
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
      this.context = context;
      this.filters = filters;
      this.drilldowns = drilldowns;
      this.treemapElem = $('<div id="vis_widget" />').appendTo(elem);
      this.aggregateTableElem = $('<div id="table_widget" />').appendTo(elem);
    },

    render: function(state, callback) {
      var treemap_ctx = _.extend(context, {
        click: function(node) { callback(node.data.name); }
      });
      this.context.render(this, state);

      new OpenSpending.Treemap(this.treemapElem, treemap_ctx, state);
      new OpenSpending.AggregateTable(this.aggregateTableElem, context, state).then(function(widget) {
        widget.$e.unbind('click', 'td a');
        widget.$e.on('click', 'td a', function(e) {
          var name = $(e.target).data('name') + '';
          callback(name);
          return false;
        });
      });
    }
  });

  OpenSpending.app = new OpenSpending.WidgetLink($('#treetable_widget'), context, {'kontotyp': 'Ertrag', 'year': '2012'}, ['teilhaushalt', 'kostentraeger']);
});
