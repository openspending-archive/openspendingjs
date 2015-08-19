/*global alert, jQuery, Handlebars, _ */
(function (global) {
  "use strict";
  var OpenSpending, $, getGlobal;

  global.OpenSpending = OpenSpending = {};

  // Return the global object. Probably 'window'.
  OpenSpending.getGlobal = function () { return global; };

  // OpenSpending's own copy of jQuery
  $ = OpenSpending.$ = OpenSpending.jQuery = jQuery.sub();

  // Handy ajax error handler
  OpenSpending.ajaxError = function (msg) {
    return function (rq, x, status) {
      var errmsg = "OpenSpending Ajax Error: " + msg + " (" + status + ")";
      if (OpenSpending.getGlobal().console!==undefined) {
        console.error(errmsg, rq);
      } else {
        alert(errmsg + ": " + rq);
      }
    };
  };

  // Moved from main.js:
  //   getCkanDatasetInfo
  //   setupImportOptions
  //   setupNewSource
  //   setupLocales
  //   updateDatasetListing
  //   setupDatasetListing
  // TODO: move into page-specific JS file

  function setupImportOptions() {
    var $datasetInfo = $('.dataset-info'),
      $importOptions = $('.import-options');
    // first the simpler one: the non-Datahub option
    // (just show the hidden form)
    $('.import-options .import-nondatahub a.btn').click(function (e) {
      $importOptions.hide();
      $datasetInfo.show();
    });
    $('.import-datahub form').submit(function (e) {
      e.preventDefault();
      var $form = $(e.target),
        datahubUrl;
      $form.find('input[type="submit"]').val('Loading, please wait ...');
      datahubUrl = $form.find('input[name="datahubUrl"]').val();
      getCkanDatasetInfo(datahubUrl)
        .then(function (data) {
          $datasetInfo.find('form input[name="label"]').val(data.title);
          $datasetInfo.find('form input[name="name"]').val(data.name);
          $datasetInfo.find('form input[name="ckan_uri"]').val(datahubUrl);
          $datasetInfo.find('form textarea[name="description"]').val(data.notes);
          $importOptions.hide();
          $datasetInfo.show();
        });
        // TODO: error handling
    });
  }

  function setupNewSource($els) {
    $els.each(function (idx, $el) {
      $el = $($el);
      var dataHubUri = $el.attr('ckan-uri');
      if (!dataHubUri) {
        return;
      } else {
        getCkanDatasetInfo(dataHubUri).then(function (data) {
          var $input = $el.find('input[name="url"]'),
            $select;
          $input.hide();
          $input.after($('<select name="url"></select>'));
          $select = $el.find('select');
          $.each(data.resources, function (idx, resource) {
            var _text = resource.name + ' -- ' + resource.description + ' -- ' + resource.url,
              _option = $('<option />').val(resource.url).text(_text);
            $select.append(_option);
          });
        });
      }
    });
  }

  function setupLocales() {
    $('.select-locale').click(function (event) {
      $.ajax({
        url: '/set-locale',
        data: {locale: $(this).data('locale')},
        type: 'POST',
        async: false
      });
      window.location.reload(true);
    });
  }

  function renderDatasetListingItems(datasets) {
    var $ul = $('#datasets-list');
    var item_template = Handlebars.compile($("#listing-item-template").html());
    var filter = $('#datasets-filter-query').val();
    if (filter && filter.length) {
      filter = filter.toLowerCase();
      datasets = _.filter(datasets, function(ds) {
        return _.indexOf(ds.name.toLowerCase(),filter) != -1 ||
            _.indexOf(ds.label.toLowerCase(),filter) != -1 ||
            _.indexOf(ds.description.toLowerCase(),filter) != - 1;
      });
    }
    $ul.empty();
    _.each(datasets, function(ds) {
      $ul.append(item_template(ds));
    });
  }

  function updateDatasetListing(params) {
    params = params || {};
    var $el, jqxhr, template;
    $el = $('#datasets');
    jqxhr = $.ajax({
      url: '/datasets.json',
      data: params
    });
    jqxhr.then(function (out) {
      var $list = $el.find('.listing').first();
      $list.empty();
      out.params = params;
      out.hasTerritories = out.territories.length > 0;
      out.territories = _.map(out.territories, function (t) {
        t.selected = t.code === params.territories;
        return t;
      });
      out.hasLanguages = out.languages.length > 0;
      out.languages = _.map(out.languages, function (t) {
        t.selected = t.code === params.languages;
        return t;
      });
      out.hasCategories = out.categories.length > 0;
      out.hasSelectedCategory = false;
      out.categories = _.map(out.categories, function (t) {
        t.selected = t.category === params.category;
        if (t.selected) out.hasSelectedCategory = true;
        return t;
      });
      out.datasets = _.map(out.datasets, function (t) {
        t.tagline = t.description.substring(0, 120);
        if (t.description.length > 120) {
          t.tagline += "...";
        }
        return t;
      });

      var filter = $('#datasets-filter-query').val();
      if (filter && filter.length) {
        out.datasets = _.filter(out.datasets, function(ds) {
          return ds.name.indefOf(filter) != -1 ||
            ds.label.indefOf(filter) != -1 ||
            ds.description.indefOf(filter) != - 1;
        });
      }

      var template = Handlebars.compile($("#listing-template").html());
      $list.append(template(out));
      $('.filter-datasets').change(function (event) {
        var $t = $(event.target);
        params['filter'] = $('#datasets-filter-query').val();
        params[$t.attr('name')] = $t.val().length ? $t.val() : undefined;
        updateDatasetListing(params);
      });
      $('#datasets-filter-query').val(params.filter);
      renderDatasetListingItems(out.datasets);
      $('#datasets-filter-query').keyup(function (e) {
        renderDatasetListingItems(out.datasets);
      });
      if ($el.is(':hidden')) {
        $el.modal({backdrop: true});
      }
    });
  }

  OpenSpending.getGlobal().updateDatasetListing = updateDatasetListing;

  function setupDatasetListing() {
    $('.list-datasets').click(function (event) {
      updateDatasetListing();
      return false;
    });

    $('.fp-map svg').click(function (event) {
      return false;
    });
  }

  $(function () {
    var isDatasetNew = $('.container .dataset.new').length > 0;
    if (isDatasetNew) {
      setupImportOptions();
    }
    // setup source dropdown if we have CKAN-URI
    setupNewSource($('#new-source'));

    setupLocales();
    setupDatasetListing();
  });
}(this));
