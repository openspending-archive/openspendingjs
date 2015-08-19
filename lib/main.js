(function ($) {
  $(document).ready(function () {
    setupLocales();
    setupDatasetListing();
  });

function setupLocales() {
  $('.select-locale').click(function(event) {
      $.ajax({url: '/set-locale',
            data: {locale: $(this).data('locale')},
            type: 'POST',
            async: false,
            });
      window.location.reload();
    });
}

function updateDatasetListing(params) {
  params = params || {};
  var $el = $('#datasets');
  var jqxhr = $.ajax({
    url: '/datasets.json',
    data: params
    })
  jqxhr.then(function(out) {
    var $list = $el.find('.listing').first();
    $list.empty();
    out.hasTerritories = out.territories.length > 1;
    out.territories = _.map(out.territories, function(t) {
      t.selected = t.code == params.territories;
      return t;
    });
    out.hasLanguages = out.languages.length > 1;
    out.languages = _.map(out.languages, function(t) {
      t.selected = t.code == params.languages;
      return t;
    });
    out.datasets = _.map(out.datasets, function(t) {
      t.tagline = t.description.substring(0, 60);
      if (t.description.length > 60) {
        t.tagline += "...";
      }
      return t;
    });
    var template = Handlebars.compile($("#listing-template").html());
    $list.append(template(out));
    $('.filter-datasets').change(function(event) {
      var $t = $(event.target);
      params[$t.attr('name')] = $t.val().length ? $t.val() : undefined;
      updateDatasetListing(params);
    });
    if ($el.is(':hidden')) {
      $el.modal({backdrop: true});
    }
  });
}

window.updateDatasetListing = updateDatasetListing;

function setupDatasetListing() {
  $('.list-datasets').click(function(event) {
    updateDatasetListing();
    return false;
  });

  $('.fp-map svg').click(function(event) {
    console.log(event);
    return false;
  });
}

// end the local closure
}(jQuery));

