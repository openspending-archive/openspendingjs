var OpenSpending = OpenSpending || {};
/*
    Abstract the WDMMG data store (accessed via its api).
    Sample use:
    
    var datastore = WDMMG.Datastore(other_config);
    datastore.list("entries", function(data){...});
    datastore.listEntries(function(data){...});
    datastore.filterDataset({key: value, foo: bar}, function(data){...});
    
*/

OpenSpending.Datastore = (function($){
    var defaultConfig = {
            // dataStoreApi: 'http://data.wheredoesmymoneygo.org/api',
            'endpoint': 'http://localhost:5000/'
    };
    return function(customConfig){
        var breakdown = {},
            keys = {},
            resources = ["Entry", "Entity", "Classifier", "Dataset"],
            resourceOperations = ["list", "get", "filter", "distinct"],
            CLB = "?callback=?";
        
        var d = {
            getData: function(path, data, callback){
                return $.ajax({
                  url: this.config.endpoint + path + CLB,
                  dataType: 'json',
                  data: data,
                  success: callback,
                  cache: true
                });
            },
            config: customConfig || defaultConfig,
            list: function(resource, callback){
                this.getData(resource, {}, callback);
            },
            get: function(resource, objectId, callback){
                this.getData(resource + "/" + objectId, {}, callback);
            },
            filter: function(resource, filters, callback){
                this.getData(resource, filters, callback);
            },
            distinct: function(resource, key, filters, callback){
                this.getData(resource + "/distinct/" + key, filters, callback);
            },
            aggregate: function(slice, breakdownKeys, callback) {
                var breakdown = {"slice": slice},
                    keys = [];
                if (breakdownKeys){
                    keys = breakdownKeys.slice();
                }
                // sort the keys as order does not matter for aggregation
                // canonical string for cache?
                keys.sort();

                for (var i=0; i< keys.length; i++){
                    breakdown["breakdown-"+keys[i]] = "yes";
                }
                // probably better API URL:
                // $.getJSON(this.config+resource+"/aggregate"+CLB, breakdown, callback);
                this.getData("api/aggregate", breakdown, callback);
            }
        };
        
        /* Curry fancy shortcut methods like getEntry, filterClassifier etc. */
        for(var i=0; i<resources.length; i++){
            for (var j=0; j<resourceOperations.length; j++){
                (function(resource, operation){
                    d[operation+resource] = function(){
                        return d[operation].apply(d, [resource.toLowerCase()].concat(Array.prototype.slice.call(arguments)));
                    };
                }(resources[i], resourceOperations[j]));
            }
        }
        return d;
    };
}(jQuery));


// Javascript library for OpenSpending search.
//
// OpenSpending's search interface mimics that of Solr, see
// http://openspending.org/api.
//
// This JS library's API is therefore also similar to Solr.
//
// Simple usage example can be found in app/spend-browser
//
//
OpenSpending.Search = (function($, my) {
  // default config
  my._config = {
    endpoint: 'http://openspending.org/'
  }

  my.Manager = new AjaxSolr.Manager({
    servlet: ''
  });

  my.configure = function(config) {
    my._config = config;
    my._config.searchApi = my._config.endpoint + 'api/search';
    // slight hack here is AjaxSolr expects base solr url and then appends servlet (defaults to 'select')
    my.Manager.solrUrl = my._config.searchApi;
  }

  my.search = function(params) {
    _params = $.extend(true, {}, params);
    _params.q = _params.q || '';
    if ('qparams' in _params) {
      for (var k in _params.qparams) {
        _params.q += ' ' + k + ':' + _params.qparams[k];
      }
    }
    delete _params['qparams'];
    for (var name in _params) {
      my.Manager.store.addByValue(name, _params[name]);
    }
    my.Manager.doRequest();
  };

  my.entryUrl = function(entry) {
    if ('name' in entry) {
      var entry_id = entry.name;
    } else {
      var entry_id = entry._id;
    }
    return my._config.endpoint + 'entry/' + entry_id;
  };

  my.entityUrl = function(entity) {
    if ('name' in entity) {
      var entity_id = entity.name;
    } else {
      var entity_id = entity._id;
    }
    return my._config.endpoint + 'entity/' + entity_id;
  };

  my.entityLink = function(entity) {
    var out = $('<div />').append(
        $('<a />').text(entity.label).attr('href', my.entityUrl(entity))
      ).html();
    return out
  };

  my.formatCurrency = function(currency) {
    if(currency == 'GBP') {
      return '&pound;';
    } else if (currency == 'USD') {
      return '$';
    } else if (currency == 'EUR') {
      return '&euro;';
    } else {
      return currency;
    }
  }

  my.ResultWidget = AjaxSolr.AbstractWidget.extend({
    init: function () {
      this.$target = $(this.target);
      this.$messages = this.$target.find('.messages');
      this.$resultlist = this.$target.find('.result-list');
    },

    beforeRequest: function () {
      this.$messages.html($('<img/>').attr('src', 'http://assets.okfn.org/images/icons/ajaxload-circle.gif'));
    },

    afterRequest: function () {
      var self = this;
      this.$messages.empty();
      var data = this.manager.response;

      this.$target.find('.num-entries span').html(data.response.numFound + ' entries.');

      // unflatten entries from solr response
      var entries = $.map(data.response.docs, function(item, idx) {
        // deep copy
        var entry = $.extend(true, {}, item);
        entry.from = {};
        entry.to = {};
        for (key in item) {
          if (key.indexOf('from.') === 0) {
            entry.from[key.slice(5)] = item[key];
          }
          if (key.indexOf('to.') === 0) {
            entry.to[key.slice(3)] = item[key];
          }
        }
        return entry;
      });
      var out = $.tmpl(this.tmplEntriesList, {docs: entries});
      this.$resultlist.empty().append(out);

      // Sorting ...
      var headers = this.$resultlist.find('table thead th');
      var currentSort = self.manager.store.values('sort');
      var sortCSS = ['sort-asc', 'sort-desc'];
      headers.removeClass(sortCSS);
      $.each(currentSort, function(idx, item) {
        var parts = item.split(' ');
        self.$resultlist.find('th[column="' + parts[0] + '"]').addClass('sort-' + parts[1]);
        });
      headers.click(function(e) {
        var _el = $(e.target);
        var sortCol = _el.attr('column');
        // set sort direction
        var sortDirection = 'desc'
        $.each(currentSort, function(idx, item) {
          var parts = item.split(' ');
          // is current sort direction for this col desc?
          if (parts[0] == sortCol && parts[1] == 'desc') {
            sortDirection = 'asc';
          }
        });
        self.manager.store.addByValue('sort', sortCol + " " + sortDirection);
        self.manager.doRequest();
      });
    },

    tmplEntriesList: ' \
      <table> \
        <thead> \
          <tr> \
            <th column="time.unparsed" class="sortable">Date</th> \
            <th column="from.label" class="sortable">Spender</th> \
            <th column="to.label" class="sortable">Recipient</th> \
            <th column="amount" class="num sortable">Amount</th> \
            <th>&nbsp;</th> \
          </tr> \
        </thead> \
        <tbody> \
          {{each(index, entry) docs}} \
          <tr> \
            <td>${entry["time.unparsed"]}</td> \
            <td> \
              {{html OpenSpending.Search.entityLink(entry.from)}} \
            </td> \
            <td> \
              {{html OpenSpending.Search.entityLink(entry.to)}} \
            </td> \
            <td class="num"> \
              ${OpenSpending.Search.formatCurrency(entry.currency)}${OpenSpending.Utils.formatAmountWithCommas(entry.amount, 2)} \
            </td> \
            <td> \
              <a href="${OpenSpending.Search.entryUrl(entry)}">full entry &raquo;</a> \
            </td> \
          </tr> \
          {{/each}} \
        </tbody> \
        <tfoot> \
          <tr> \
            <th colspan="5"> \
              <div class="pager"> \
              </div> \
            </th> \
          </tr> \
        </tfoot> \
      </table> \
      '
  });

  my.PagerWidget = AjaxSolr.PagerWidget.extend({
    innerWindow: 2,
    outerWindow: 1,
    renderHeader: function (perPage, offset, total) {
      $('#pager-header').html($('<span/>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total));
    },
    renderLinks: function(links) {
      if (this.totalPages) {
        links.unshift(this.pageLinkOrSpan(this.previousPage(), [ 'pager-disabled', 'pager-prev' ], this.prevLabel));
        links.push(this.pageLinkOrSpan(this.nextPage(), [ 'pager-disabled', 'pager-next' ], this.nextLabel));

        var res = $('<ul />');
        $.each(links, function(idx, link) {
          var _li = $('<li />');
          _li.append(link);
          res.append(_li);
          });
        $(this.target).append(res);
      }
    }
  });

  // Provides drop down selection box based on facet field
  my.DropDownFacetWidget = AjaxSolr.AbstractFacetWidget.extend({
    afterRequest: function() {
      if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
          $(this.target).html('No items found');
          return;
        }

      var maxCount = 0;
      var objectedItems = [
        {
          facet: '--All--',
          count: this.manager.response.response.numFound
        }
      ];
      for (var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
        var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
        objectedItems.push({ facet: facet, count: count });
      }

      $(this.target).empty();
      var _t = $(this.target);
      _t.append('<h4>Filter by ' + this.id.slice(0,1).toUpperCase() + this.id.slice(1) + '</h4>');
      var select = $('<select name="' + this.id + '"></select>');
      var _tmpl = '<option value="${facet}">${facet} (${count})</option>';
      var out = $.tmpl(_tmpl, objectedItems);
      select.append(out);
      _t.append(select);
      var self = this;
      select.change(function(e) {
        meth = self.multivalue ? 'add' : 'set';
        var value = $(e.target).attr('value');
        if (self[meth].call(self, value)) {
          self.manager.doRequest(0);
        }
      });
    }
  });

  my.CurrentSearchWidget =  AjaxSolr.AbstractWidget.extend({
    afterRequest: function () {
      var self = this;
      var links = [];

      var fq = this.manager.store.values('fq');

      var data = $.map(fq, function(facet, idx) {
        return {
          facet: facet,
          name: facet.split(':')[1]
          };
      });
      var tmpl = '<a href="#${name}" facet="${facet}">[x] ${name}</a>';
      $(this.target).html($.tmpl(tmpl, data));
      if (fq.length == 0) {
        $(this.target).html('<div>No filters applied.</div>');
      }
      var self = this;
      $('.filters-current .list a').click(function(e) {
        e.preventDefault();
        facet = $(e.target).attr('facet');
        if (self.manager.store.removeByValue('fq', facet)) {
          self.manager.doRequest(0);
        }
      });
    },

    removeFacet: function (facet) {
      var self = this;
      return function () {
        if (self.manager.store.removeByValue('fq', facet)) {
          self.manager.doRequest(0);
        }
        return false;
      };
    }
  });

  return my;
})(jQuery, OpenSpending.Search || {});
