function testing() {
  return {};
}

function calculateSetChecked() {
  var results = {};
  $.each($('[type=checkbox]'), function(index,item) {
      if ($(item).is(':checked')) {
        debug('in here');
        results[$(item).attr('name')] = '';
      }
  });
  return results;
}

// create the json node data for treemap
function loadTreeData(data, deficit, selectedCuts) {
  function make_label(name, amount) {
      return name + " (&pound;" + amount + "bn)";
  }

  var total = 0;
  var _treedata = {
    "id": "root",
    "name": make_label("Total Deficit to Fill", deficit),
    "data": { "$area": 0 },
    "children": []
  };
  $.each(data.feed.entry, function(i,entry) {
    var desc = entry.gsx$description.$t;
    // only add selected cuts
    if ( desc in selectedCuts) {
      var amount = parseFloat(entry.gsx$amountbn.$t);
      var color = "0"; 
      var increaseorcut = entry.gsx$increaseorcut.$t.toLowerCase();
      if (increaseorcut == "cut") {
        color = "20"; 
      }
      var newnode = {
        "id": i,
        "name": make_label(entry.gsx$description.$t, amount),
        "data": { "$area": amount, "$color": color},
        "children": []
      };
      // ensure we never over-fill
      if (total < deficit) {
        _treedata.children.push(newnode);
        total = total + amount;
      } else {
        alert('Deficit already filled');
      }
    }
  });
  // add a child to represent the area not there ...
    var notyetfilled1 = Math.max(deficit-total,0);
    var notyetfilled = notyetfilled1.toFixed(1);
  var newnode = {
    "id": 'thehole',
    "name": make_label('Yet to be filled...', notyetfilled),
    "data": { "$area": notyetfilled, "$color": "50"},
    "children": []
  };
  _treedata.children.push(newnode);
  _treedata.data['$area'] = Math.max(deficit, total);
  return $.toJSON(_treedata);
}

function makeTable(data) {
  var _tbody = $('<tbody></tbody>');
  $.each(data.feed.entry, function(i,entry){
    var _newrow = $("<tr></tr>");
    _newrow.append($('<td></td>').append('<input type="checkbox" name="' + entry.gsx$description.$t + '" />'));
    _newrow.append($('<td></td>').append('' + entry.gsx$description.$t));
      var amount = parseFloat(entry.gsx$amountbn.$t);
      _newrow.append($('<td class="amount"></td>').append('' + amount.toFixed(1)));
    _newrow.append($('<td></td>').append('' + entry.gsx$increaseorcut.$t));
    _tbody.append(_newrow);
  });
  return _tbody;
}
