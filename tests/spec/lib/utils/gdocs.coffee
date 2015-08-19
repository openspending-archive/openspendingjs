sample_gdocs_spreadsheet_data = {
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

describe 'lib/utils/gdocs', ->
  describe 'gdocsToJavascript', ->
    it 'should parse GDocs json', ->
      res = gdocsToJavascript(sample_gdocs_spreadsheet_data)
      expect(res.header[0]).to.equal('column-2')
      expect(res.header[1]).to.equal('column-1')
      expect(res.data.length).to.equal(3)
      expect(res.data[0][0]).to.equal('1')
      expect(res.data[0][1]).to.equal('A')

    it 'should use options.columnsToUse as column names', ->
      res = gdocsToJavascript(sample_gdocs_spreadsheet_data, columnsToUse: ['column-1', 'column-2'])
      expect(res.header[0]).to.equal('column-1')
      expect(res.header[1]).to.equal('column-2')
      expect(res.data.length).to.equal(3)
      expect(res.data[0][0]).to.equal('A')
      expect(res.data[0][1]).to.equal('1')

