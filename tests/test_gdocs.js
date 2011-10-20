module("gdocs");

var sample_gdocs_spreadsheet_data = {
  "feed": {
    "category": [
      {
        "term": "http://schemas.google.com/spreadsheets/2006#list", 
        "scheme": "http://schemas.google.com/spreadsheets/2006"
      }
    ], 
    "updated": {
      "$t": "2010-07-12T18:32:16.200Z"
    }, 
    "xmlns": "http://www.w3.org/2005/Atom", 
    "xmlns$gsx": "http://schemas.google.com/spreadsheets/2006/extended", 
    "title": {
      "$t": "Sheet1", 
      "type": "text"
    }, 
    "author": [
      {
        "name": {
          "$t": "okfn.rufus.pollock"
        }, 
        "email": {
          "$t": "okfn.rufus.pollock@gmail.com"
        }
      }
    ], 
    "openSearch$startIndex": {
      "$t": "1"
    }, 
    "link": [
      {
        "href": "http://spreadsheets.google.com/pub?key=0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc", 
        "type": "text/html", 
        "rel": "alternate"
      }, 
      {
        "href": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values", 
        "type": "application/atom+xml", 
        "rel": "http://schemas.google.com/g/2005#feed"
      }, 
      {
        "href": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values?alt=json-in-script", 
        "type": "application/atom+xml", 
        "rel": "self"
      }
    ], 
    "xmlns$openSearch": "http://a9.com/-/spec/opensearchrss/1.0/", 
    "entry": [
      {
        "category": [
          {
            "term": "http://schemas.google.com/spreadsheets/2006#list", 
            "scheme": "http://schemas.google.com/spreadsheets/2006"
          }
        ], 
        "updated": {
          "$t": "2010-07-12T18:32:16.200Z"
        }, 
        "gsx$column-2": {
          "$t": "1"
        }, 
        "gsx$column-1": {
          "$t": "A"
        }, 
        "title": {
          "$t": "A", 
          "type": "text"
        }, 
        "content": {
          "$t": "column-2: 1", 
          "type": "text"
        }, 
        "link": [
          {
            "href": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values/cokwr", 
            "type": "application/atom+xml", 
            "rel": "self"
          }
        ], 
        "id": {
          "$t": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values/cokwr"
        }
      }, 
      {
        "category": [
          {
            "term": "http://schemas.google.com/spreadsheets/2006#list", 
            "scheme": "http://schemas.google.com/spreadsheets/2006"
          }
        ], 
        "updated": {
          "$t": "2010-07-12T18:32:16.200Z"
        }, 
        "gsx$column-2": {
          "$t": "2"
        }, 
        "gsx$column-1": {
          "$t": "b"
        }, 
        "title": {
          "$t": "b", 
          "type": "text"
        }, 
        "content": {
          "$t": "column-2: 2", 
          "type": "text"
        }, 
        "link": [
          {
            "href": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values/cpzh4", 
            "type": "application/atom+xml", 
            "rel": "self"
          }
        ], 
        "id": {
          "$t": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values/cpzh4"
        }
      }, 
      {
        "category": [
          {
            "term": "http://schemas.google.com/spreadsheets/2006#list", 
            "scheme": "http://schemas.google.com/spreadsheets/2006"
          }
        ], 
        "updated": {
          "$t": "2010-07-12T18:32:16.200Z"
        }, 
        "gsx$column-2": {
          "$t": "3"
        }, 
        "gsx$column-1": {
          "$t": "c"
        }, 
        "title": {
          "$t": "c", 
          "type": "text"
        }, 
        "content": {
          "$t": "column-2: 3", 
          "type": "text"
        }, 
        "link": [
          {
            "href": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values/cre1l", 
            "type": "application/atom+xml", 
            "rel": "self"
          }
        ], 
        "id": {
          "$t": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values/cre1l"
        }
      }
    ], 
    "openSearch$totalResults": {
      "$t": "3"
    }, 
    "id": {
      "$t": "http://spreadsheets.google.com/feeds/list/0Aon3JiuouxLUdDQwZE1JdV94cUd6NWtuZ0IyWTBjLWc/od6/public/values"
    }
  }, 
  "version": "1.0", 
  "encoding": "UTF-8"
}

test("gdocsToJavascript", function() {
  var res1 = gdocsToJavascript(sample_gdocs_spreadsheet_data);
  var out = res1.data;
  equals(res1.header[0], 'column-2', 'check header values');
  equals(res1.header[1], 'column-1', 'check header values');
  equals(out.length, 3, 'check length output');
  equals(out[0][0], '1', 'check first row of output');
  equals(out[0][1], 'A', 'check first row of output');

  res1 = gdocsToJavascript(sample_gdocs_spreadsheet_data,
    {'columnsToUse': ['column-1', 'column-2']}
    );
  out = res1.data;
  equals(res1.header[0], 'column-1', 'check header values');
  equals(res1.header[1], 'column-2', 'check header values');
  equals(out.length, 3, 'check length output');
  equals(out[0][0], 'A', 'check first row of output');
  equals(out[0][1], '1', 'check first row of output');
});

