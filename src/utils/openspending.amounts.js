/*! openspending.amounts.js - Amount formatting for OpenSpending
 * ------------------------------------------------------------------------
 *
 * Copyright 2013 Open Knowledge Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Define OpenSpending object (if used as a separate module)
var OpenSpending = OpenSpending || {};
// Define Amounts property
OpenSpending.Amounts = OpenSpending.Amounts || {};

// Give a short hand version of the amount (with bn, m, k abbreviations)
OpenSpending.Amounts.shorthand = function (amount) {
    // Define supported amounts
    var billion = 1000000000;
    var million = 1000000;
    var thousand = 1000;

    // Get the absolute value (since negative numbers should work as well
    var absolute_amount = Math.abs(amount);

    // Billions get 'bn'
    if (absolute_amount > billion) {
	return OpenSpending.Amounts.format(amount / billion) + 'bn';
    }
    // Millions get 'm'
    else if (absolute_amount > million) {
	return OpenSpending.Amounts.format(amount / million) + 'm';
    }
    // Thousands get 'k'
    else if (absolute_amount > thousand) {
	return OpenSpending.Amounts.format(amount / thousand) + 'k';
    }
    // Anything less just returns the amount with two decimal places
    else {
	return OpenSpending.Amounts.format(amount, 2);
    }
};

// Format amount using accounting
OpenSpending.Amounts.format = function (amount, precision, currency) {
    // Get the currency symbol
    currency = OpenSpending.Amounts.currencySymbol(currency);
    // Use accounting.js to format the amount (default precision is 0)
    return accounting.formatMoney(amount, currency, precision||0,
				  OpenSpending.localeGroupSeparator,
				  OpenSpending.localeDecimalSeparator);
};

// Get the currency symbol
OpenSpending.Amounts.currencySymbol = function (currency) {
    // If currency is defined return currency symbol or currency
    if(currency) {
	return OpenSpending.Amounts.currencySymbols[currency] || currency;
    } else { // If not we just return an empty string
	return '';
    }
};

// All known currency symbols in openspendingjs
OpenSpending.Amounts.currencySymbols = {
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

