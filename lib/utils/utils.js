(function(global) {
var DEBUG;

var DEFAULT_PALETTE = ["#CA221D", "#C22769", "#3F93E1", "#481B79", "#6AAC32",
    "#42928F", "#D32645", "#CD531C", "#EDC92D", "#A5B425", "#211D79",
    "#449256", "#7A2077", "#CA221D", "#E29826", "#44913D", "#2458A3",
    "#2458A3", "#14388C"];

function debug(message) {
  var console = window['console'];
  if (console && console.log) {
    console.log(message);
  }
}

global.OpenSpending = global.OpenSpending || {};
OpenSpending.Utils = OpenSpending.Utils || {};

OpenSpending.Utils.formatAmount = function (num) {
  var billion = 1000000000;
  var million = 1000000;
  var thousand = 1000;
  var numabs = Math.abs(num);
  if (numabs > billion) {
    return OpenSpending.Utils.formatAmountWithCommas(num / billion) + 'bn';
  } if (numabs > (million / 2)) {
    return OpenSpending.Utils.formatAmountWithCommas(num / million) + 'm';
  } if (numabs > thousand) {
    return OpenSpending.Utils.formatAmountWithCommas(num / thousand) + 'k';
  } else {
    return OpenSpending.Utils.formatAmountWithCommas(num, 2);
  }
};

OpenSpending.Utils.formatAmountWithCommas = function (num, decimalPlaces, currency) {
  currency = OpenSpending.Utils.currencySymbol(currency);
  return accounting.formatMoney(num, currency, decimalPlaces||0,
    OpenSpending.localeGroupSeparator,
    OpenSpending.localeDecimalSeparator);
};

OpenSpending.Utils.currencySymbol = function (currency) {
  if(currency) {
    return OpenSpending.Utils.CurrencySymbols[currency] || currency;
  } else {
    return '';
  }
};

OpenSpending.Utils.getColorPalette = function (num) {
  var colors = [];
  for (var i = 0; i < num; i++) {
    colors.push(DEFAULT_PALETTE[i % (DEFAULT_PALETTE.length-1)]);
  }
  return colors;
}

/*
	Parse a URL query string (?xyz=abc...) into a dictionary.
*/

function parseQueryString() {
  var q = arguments.length > 0 ? arguments[0] : window.location.search.substring(1);
  var urlParams = [],
    e, d = function (s) {
      return unescape(s.replace(/\+/g, " "));
    },
    r = /([^&=]+)=?([^&]*)/g;

  while (e = r.exec(q)) {
    urlParams.push([d(e[1]), d(e[2])]);
  }
  return urlParams;
}

/*
Write tabular data as HTML table.

	:tabular: tabular data object (dict with header and data keys).
	:options: optional keyword arguments:
		colTypes: types of columns keyed by column name
		displayNames: ditto for display names for columns
*/
writeTabularAsHtml = function (tabular) {
  var options = {};
  if (arguments.length > 1) {
    options = arguments[1];
  }
  var colTypes = {};
  var displayNames = {};
  if (options.colTypes) {
    colTypes = options.colTypes;
  }
  if (options.displayNames) {
    displayNames = options.displayNames;
  }
  // knows how to format and justify based on combination of col type labelling (via colTypes)
  // and value based logic
  var _ColType = [];
  var _thead = $('<thead></thead>');
  $.each(tabular.header, function (i, col) {
    var tempDisplayName = displayNames[col] ? displayNames[col] : col;
    _thead.append($('<th></th>').append(tempDisplayName));
    if (colTypes[col]) {
      _ColType[i] = colTypes[col];
    }
  });
  var _tbody = $('<tbody></tbody>');
  // var red = /^(19|20)\d{2}$/; - replaced by _ColType
  // var rep = /^([\d\.\-]+)\%$/; - replaced by _ColType
  var ren = /^[\d\.\-]+$/;
  var reb = /^$/;
  $.each(tabular.data, function (i, row) {
    var _newrow = $('<tr></tr>');
    $.each(row, function (j, cell) {
      // decide action depending on type
      var cell2;
      if (_ColType[j] == 'range') {
        // year range
        var cell3 = parseFloat(cell);
        cell3++;
        cell2 = cell + '-' + cell3;
        _newrow.append($('<td></td>').append(cell2));
      } else if (reb.test(cell)) {
        // blank
        cell2 = '';
        _newrow.append($('<td></td>').append(cell2));
      } else if (_ColType[j] == 'percent') {
        // percent
        // 20.5% saved as 0.205. Converted back here to 20.5%
        var cell3 = cell * 100;
        cell2 = cell3.toFixed(1) + '%';
        _newrow.append($('<td class="amount"></td>').append(cell2));
      } else if (ren.test(cell)) {
        // number
        var cell3 = parseFloat(cell);
        cell2 = cell3.toFixed(0);
        _newrow.append($('<td class="amount"></td>').append(cell2));
      } else {
        // other
        cell2 = cell;
        _newrow.append($('<td></td>').append(cell2));
      }
    });
    _tbody.append(_newrow);
  });
  return {
    'thead': _thead,
    'tbody': _tbody
  };
}

function loadingMessage() {
  $.blockUI({
    message: 'Please wait, loading ...',
    timeout: 30000,
    css: {
      border: 'none',
      padding: '15px',
      backgroundColor: '#000',
      '-webkit-border-radius': '10px',
      '-moz-border-radius': '10px',
      opacity: .5,
      color: '#fff'
    }
  });
  $('.blockMsg').attr('title', 'Click to unblock').click($.unblockUI);
}

OpenSpending.Utils.CurrencySymbols = {
    "AED": "د.إ", 
    "AFN": "؋",
    "ALL": "L",
    "AMD": "դր.",
    "ANG": "ƒ",
    "AOA": "Kz",
    "ARS": "$",
    "AUD": "$",
    "AWG": "ƒ",
    "AZN": "m",
    "BAM": "KM",
    "BBD": "$",
    "BDT": "৳",
    "BGN": "лв",
    "BHD": "ب.د",
    "BIF": "Fr",
    "BMD": "$",
    "BND": "$",
    "BOB": "Bs.",
    "BRL": "R$",
    "BSD": "$",
    "BTN": "Nu",
    "BWP": "P",
    "BYR": "Br",
    "BZD": "$",
    "CAD": "$",
    "CDF": "Fr",
    "CHF": "Fr",
    "CLP": "$",
    "CNY": "¥",
    "COP": "$",
    "CRC": "₡",
    "CUP": "$",
    "CVE": "$, Esc",
    "CZK": "Kč",
    "DJF": "Fr",
    "DKK": "kr",
    "DOP": "$",
    "DZD": "د.ج",
    "EEK": "KR",
    "EGP": "£,ج.م",
    "ERN": "Nfk",
    "ETB": "Br",
    "EUR": "€",
    "FJD": "$",
    "FKP": "£",
    "GBP": "£",
    "GEL": "ლ",
    "GHS": "₵",
    "GIP": "£",
    "GMD": "D",
    "GNF": "Fr",
    "GTQ": "Q",
    "GYD": "$",
    "HKD": "$",
    "HNL": "L",
    "HRK": "kn",
    "HTG": "G",
    "HUF": "Ft",
    "IDR": "Rp",
    "ILS": "₪",
    "INR": "₨",
    "IQD": "ع.د",
    "IRR": "﷼",
    "ISK": "kr",
    "JMD": "$",
    "JOD": "د.ا",
    "JPY": "¥",
    "KES": "KSh",
    "KGS": "лв",
    "KHR": "៛",
    "KMF": "Fr",
    "KPW": "₩",
    "KRW": "₩",
    "KWD": "د.ك",
    "KYD": "$",
    "KZT": "Т",
    "LAK": "₭",
    "LBP": "ل.ل",
    "LKR": "ரூ",
    "LRD": "$",
    "LSL": "L",
    "LTL": "Lt",
    "LVL": "Ls",
    "LYD": "ل.د",
    "MAD": "د.م.",
    "MDL": "MDL",
    "MGA": "Ar",
    "MKD": "ден",
    "MMK": "K",
    "MNT": "₮",
    "MOP": "P",
    "MRO": "UM",
    "MUR": "₨",
    "MVR": "ރ.",
    "MWK": "MK",
    "MXN": "$",
    "MYR": "RM",
    "MZN": "MT",
    "NAD": "$",
    "NGN": "₦",
    "NIO": "C$",
    "NOK": "kr",
    "NPR": "₨",
    "NZD": "$",
    "OMR": "ر.ع.",
    "PAB": "B/.",
    "PEN": "S/.",
    "PGK": "K",
    "PHP": "₱",
    "PKR": "₨",
    "PLN": "zł",
    "PYG": "₲",
    "QAR": "ر.ق",
    "RON": "RON",
    "RSD": "RSD",
    "RUB": "р.",
    "RWF": "Fr",
    "SAR": "ر.س",
    "SBD": "$",
    "SCR": "₨",
    "SDG": "S$",
    "SEK": "kr",
    "SGD": "$",
    "SHP": "£",
    "SLL": "Le",
    "SOS": "Sh",
    "SRD": "$",
    "STD": "Db",
    "SYP": "£, ل.س",
    "SZL": "L",
    "THB": "฿",
    "TJS": "ЅМ",
    "TMT": "m",
    "TND": "د.ت",
    "TOP": "T$",
    "TRY": "₤",
    "TTD": "$",
    "TWD": "$",
    "TZS": "Sh",
    "UAH": "₴",
    "UGX": "Sh",
    "USD": "$",
    "UYU": "$",
    "UZS": "лв",
    "VEF": "Bs",
    "VND": "₫",
    "VUV": "Vt",
    "WST": "T",
    "XAF": "Fr",
    "XCD": "$",
    "XOF": "Fr",
    "XPF": "Fr",
    "YER": "﷼",
    "ZAR": "R",
    "ZMK": "ZK",
    "ZWL": "$"
};

})(this);
