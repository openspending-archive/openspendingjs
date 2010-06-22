function testing() {
  return {};
}

function calculateSetChecked(results,deficit,last_total) {
  var total = 0;
  $.each($('[type=checkbox]'), function(index,item) {
      if ($(item).is(':checked')) {
        results[$(item).attr('name')] = '';
        total=total+parseFloat($(item).attr('number'));
      }
  });
  //alert('total='+total+' llotal='+last_total);
  if(total>deficit && total>last_total && last_total>deficit){
    alert('Deficit already filled');
    return -last_total;
  }else{
    return total;
  }
}

// create the json node data for treemap
function loadTreeData(data, deficit, selectedCuts, last_total) {
  function make_label(name, amount) {
      return name + " (&pound;" + amount + "bn)";
  }
  var name=make_label("Total Deficit to Fill", deficit);
  // setting color on id: root has no effect - BUG
  var color="15";
  if(last_total>deficit){
    var excess=last_total-deficit;
    var name2=make_label(", EXCESS CUT", excess.toFixed(1));
    name=name+name2;
    color="90";
  }
  var total = 0;
  var _treedata = {
    "id": "root",
    "name": name,
    "data": { "$area": 0, "$color": color },
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
      // if (entry.gsx$use.$t.toLowerCase() == 'planned') {
      //  color = "30";
      // }
      var newnode = {
        "id": i,
        "name": make_label(entry.gsx$description.$t, amount),
        "data": { "$area": amount, "$color": color},
        "children": []
      };
      // ensure we never over-fill
      // (should no longer be needed)
      if (total < deficit) {
        _treedata.children.push(newnode);
        total = total + amount;
      } else {
        alert('Deficit already filled: bug');
      }
    }
  });
  if (last_total < deficit) {
    var name2=make_label(", TOTAL CUT", total.toFixed(1));
    _treedata['name'] = _treedata['name'] + name2;
  }
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
  _treedata.data['$area'] = Math.max(deficit, total.toFixed(1));
  return $.toJSON(_treedata);
}

function makeTable(_tbody,data) {
  var deficit=0;
  $.each(data.feed.entry, function(i,entry){
    if(entry.gsx$increaseorcut.$t == 'Deficit'){
      deficit=parseFloat(entry.gsx$amountbn.$t);
    }else if(entry.gsx$use.$t == 'FALSE'){
    }else{
      var checked='';
      var _newrow = $('<tr></tr>');
      if (entry.gsx$use.$t == 'PLANNED') {
        checked='checked';
        _newrow.addClass('darkrow');
      }
      if (entry.gsx$increaseorcut.$t.toLowerCase() == 'cut') {
        _newrow.addClass('cutrow');
      } else {
        _newrow.addClass('increaserow');
      }
      _newrow.append($('<td></td>').append('<input type="checkbox" name="' + entry.gsx$description.$t + '" number="' + entry.gsx$amountbn.$t + '" ' + checked + '/>'));
      _newrow.append($('<td></td>').append('' + entry.gsx$description.$t));
      var amount = parseFloat(entry.gsx$amountbn.$t);
      _newrow.append($('<td class="amount"></td>').append('' + amount.toFixed(1)));
      _newrow.append($('<td></td>').append('' + entry.gsx$increaseorcut.$t));
      _tbody.append(_newrow);
    }
  });
  return deficit;
}
