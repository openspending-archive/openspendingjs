(function() {
  var $, ajaxError,
    __hasProp = Object.prototype.hasOwnProperty;

  $ = OpenSpending.$;

  ajaxError = function(msg) {
    return function(rq, _, status) {
      return console.error("OpenSpending Ajax Error: " + msg + " (" + status + ")", rq);
    };
  };

  OpenSpending.DataTable = (function() {

    DataTable.prototype.options = {
      source: '/api/2/search',
      columnDefs: [],
      defaultParams: {}
    };

    function DataTable(element, options) {
      var _this = this;
      this.options = $.extend(true, {}, this.options, options);
      this.element = $(element);
      this.filters = {};
      this.table = this.element.dataTable({
        bDestroy: true,
        bProcessing: true,
        bServerSide: true,
        aoColumnDefs: this.options.columnDefs,
        aaSorting: this.options.sorting,
        sAjaxSource: this.options.source,
        fnServerData: function() {
          return _this._serverData.apply(_this, arguments);
        }
      });
    }

    DataTable.prototype.addFilter = function(key, value) {
      return this.filters[key] = value;
    };

    DataTable.prototype.removeFilter = function(key) {
      return delete this.filters[key];
    };

    DataTable.prototype.draw = function() {
      return this.table.fnDraw();
    };

    DataTable.prototype._serverData = function(src, params, callback, conf) {
      var col, dir, i, k, newparams, o, p, rq, v, _i, _len, _ref, _ref2,
        _this = this;
      p = {};
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        o = params[_i];
        p[o.name] = o.value;
      }
      params = p;
      newparams = $.extend(true, {}, this.options.defaultParams);
      newparams.page = (params.iDisplayStart / params.iDisplayLength) + 1;
      newparams.pagesize = params.iDisplayLength;
      newparams.order = [];
      for (i = 0, _ref = params.iSortingCols; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        col = this.element.find('th').eq(params["iSortCol_" + i]).data('field');
        dir = params["sSortDir_" + i];
        newparams.order.push("" + col + ":" + dir);
      }
      newparams.order = newparams.order.join("|");
      newparams.filter = [];
      _ref2 = this.filters;
      for (k in _ref2) {
        if (!__hasProp.call(_ref2, k)) continue;
        v = _ref2[k];
        newparams.filter.push("" + k + ":" + v);
      }
      newparams.filter = newparams.filter.join("|");
      newparams.q = params.sSearch;
      rq = $.get(this.options.source, newparams);
      rq.fail(ajaxError("Source request failed. Params: " + (JSON.stringify(params))));
      rq.then(function(data) {
        $(conf.oInstance).trigger('xhr', conf);
        return callback(_this._parseResponse(data, params.sEcho));
      });
      return conf.jqXHR = rq;
    };

    DataTable.prototype._parseResponse = function(data, echo) {
      return {
        sEcho: echo,
        iTotalRecords: data.stats.results_count_query,
        iTotalDisplayRecords: data.stats.results_count_query,
        aaData: data.results
      };
    };

    return DataTable;

  })();

}).call(this);
