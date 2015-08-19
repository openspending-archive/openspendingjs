OpenSpending = "OpenSpending" in window ? OpenSpending : {};

$(function() {
  var context = {
    dataset: "kosice",
    siteUrl: "http://openspending.org",
    pagesize: 50,
    callback: function(name) {
      console.log("HUHU");
    }
  };

  OpenSpending.WidgetLink = Backbone.Router.extend({
    routes: {
        "": "home",
        "*args": "drilldown"
    },

    home: function() {
      this.setFilters(this.initialFilters);
    },

    drilldown: function(args) {
      var router = this;
      var currentFilters = this.getFilters();
      router.treetable.drilldown(currentFilters, function (name, filters, drilldown) {
        var filters = _.extend({}, filters);
        filters[drilldown] = name;
        this.setFilters(filters);
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

    setupYearsLinks: function(yearsContainer) {
      var router = this;

      function fetchDistinct(dimension, attribute, query) {
        var dfd = $.ajax({
            url: context.siteUrl + '/' + context.dataset + '/' + dimension + '.distinct',
            data: {attribute: attribute, q: query, limit: 20},
            dataType: 'jsonp',
            cache: true,
            jsonpCallback: 'distinct_' + btoa(dimension + '__' + attribute + '__' + query).replace(/\=/g, '')
            });
        return dfd.promise();
      }

      function renderYears(years) {
        _.each(years.sort(), function (year) {
          yearsContainer.append("<a class='btn' data-year='"+year+"' href='#'>"+year+"</a>");
        });
      }

      function setupYearsEvents() {
        yearsContainer.find('a').click(function () {
          var element = $(this);
          element.siblings().removeClass('disable')
          element.addClass('disable');
          router.setFilters(element.data());
          return false;
        });
      }

      return fetchDistinct("time", "year").then(function (distinct) {
        var years = _.map(distinct.results, function (result) {
          return result.year;
        });

        renderYears(years);
        setupYearsEvents();
      }).promise();
    },

    initialize: function(elem, context, filters, drilldowns) {
      this.treetable = OpenSpending.Treetable(elem, context, drilldowns);
      this.initialFilters = filters;

      var yearsContainer = $('<div class="openspending-link-filter" />').insertBefore(elem);
      this.setupYearsLinks(yearsContainer).then(function () {
        yearsContainer.find(':last').click();
      });
    },
  });

  OpenSpending.app = new OpenSpending.WidgetLink($('#treetable_widget'), context, {'year': '2012'}, ['group']);
});
