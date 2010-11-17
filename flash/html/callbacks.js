jQuery.noConflict()
var WDMMG = WDMMG || {}

WDMMG.PopupBox = function () {
  var $ = jQuery, self = this

  this.$elem = $('<div class="wdmmg-popupbox"><div class="head"><a class="close" title="Close this box" href="#"></a><h3></h3></div><div class="content"></div></div>')

  // Init
  ;(function () {
    self.$elem.appendTo(document.body)
    // Draggable from title bar
    self.$elem.draggable({ handle: '.head' })
    // Resizable
    self.$elem.resizable()
    // Close on click of cross
    self.$elem.delegate('.close', 'click', function () {
      self.hide()
      return false
    })
  })()

  this.setTitle = function (title) {
    self.$elem.find('h3').text(title)
  }

  this.setContent = function (html) {
    self.$elem.find('.content').html(html)
  }

  this.setPos = function (x, y) {
    self.$elem.css({
      left: x,
      top: y
    })
  }

  this.setPosViewportCentre = function () {
    self.setPos( ($(window).width() - self.$elem.width()) / 2
               , ($(window).height() - self.$elem.height()) / 2 + $(window).scrollTop() )
  }

  this.show = function () { self.$elem.show() }
  this.hide = function () { self.$elem.hide() }

  return this
}

// Dashboard
WDMMG.Dashboard = function () {
  var $ = jQuery, self = this

  this.helperFileLocation = '/_dashboard' // Assumed to be an absolute path.

  // Init: set up dashboard.
  this.init = function () {
    if (self.helperFileLocation) {
      self.helperFileLocation = 'http://' + document.domain + self.helperFileLocation
    } else {
      self.helperFileLocation = self.currentLocation()
    }

    self.swf = swfobject.getObjectById("wdmmg")

    self.swf.removeHeader()
    self.swf.removeFooter()
    self.swf.disableUrls()

    self.$menu         = $('#dashboard-menu')
    self.$title        = $('#dashboard-title')
    self.$intro        = $('#dashboard-intro')

    self.$menu.find('a').click(function () {
      self.changeView(this.id)
      return false
    })
  }

  // Choose view from URL params, if available.
  this.ready = function () {
    var urlParams = getViewParameters()
    var viewName = urlParams.view

    delete urlParams.view

    self.changeView(viewName || "uk-bubble-chart", urlParams)
  }

  // Change view and update navigation, title.
  this.changeView = function (viewName, params) {
    self.$menu
      .find('a').removeClass('active').end()
      .find('a#' + viewName).addClass('active')

    self.introText( self.$menu.find('.active')[0].id )

    params = params || {}

    self.swf.changeView(viewName, params)
    self.updateEmbed($.param(params))
  }

  this.currentLocation = function () {
    var loc = window.location.href

    var qs = loc.indexOf("?")
    if (qs !== -1) {
      loc = loc.slice(0, qs)
    }

    var hs = loc.indexOf("#")
    if (hs !== -1) {
      loc = loc.slice(0, hs)
    }

    if (loc.slice(-1) === "/") {
      loc = loc.slice(0,-1)
    }

    return loc
  }

  // Called when visualisation parameters change.
  this.visCallback = function (page, params) {
    params.view = page
    var uid = $.param(params)

    window.location.hash = uid
    self.updateEmbed(uid)

    //reload iframe with comments
    $('#commentframe').attr('src', self.helperFileLocation + "/comments.html?" + uid)
  }

  // Called when "more info" is clicked
  this.infoboxCallback = function(code, classificationName, link) {
    if (!("infobox" in self)) {
      self.infobox = new WDMMG.PopupBox()
      self.infobox.$elem.addClass('wdmmg-infobox')
      self.infobox.setPosViewportCentre()
    }

    self.infobox.setTitle("A title")
    // TODO: get sensible content
    self.infobox.setContent(code + ":" + classificationName + ":" + link + link + link + link + link + link + link + link + link + link + link + link + link + link + link + link)
    self.infobox.show()

    return false
  }

  // Called when help button is clicked
  this.helpCallback = function(id, params) {
    console.log("Help: ", arguments)

    if (!("helpbox" in self)) {
      self.helpbox = new WDMMG.PopupBox()
      self.helpbox.$elem.addClass('wdmmg-helpbox')
      self.helpbox.setPosViewportCentre()
    }

    self.helpbox.setTitle("Help")
    // TODO: get sensible content
    self.helpbox.setContent("You need some help?")
    self.helpbox.show()

    return false
  }

  this.updateEmbed = function (uid) {
    $('#iframecode').val("<iframe src='" + self.helperFileLocation
                         + "/iframe.html#" + uid
                         + "' height='600' width='1000'></iframe>")
  }

  this.introText = function(id) {
    var text = $($('script[type=text/dashboard-intro]#dashboard-intro-'+id)[0]).text() || ''
    $(self.$intro[0])[0].innerHTML = text
  }

  return this
}

// For temporary backwards compatibility, bring these functions into the
// global namespace
var changeView, wdmmgReady, wdmmgCallback,  wdmmgInfobox, wdmmgHelp

var wdmmgInit = function () {
  var d = new WDMMG.Dashboard()
  d.init()

  changeView         = d.changeView
  wdmmgReady         = d.ready
  wdmmgCallback      = d.visCallback
  wdmmgInfobox       = d.infoboxCallback
  wdmmgHelp          = d.helpCallback
}

var adjustIframeHeight = function() {
  var $cf = jQuery('#commentframe')
  $cf.height(($cf[0].scrollHeight + 10).toString() + "px")
}

// Get URL parameters:
// - works for hash urls and querystrings
function getViewParameters() {
  var location = window.location.href
  var query_string = ''

  if (location.indexOf("?") > -1) {
    query_string = location.substr(location.indexOf("?")).toLowerCase()
  } else if (location.indexOf("#") > -1) {
    query_string = window.location.hash
  }

  var get_params = {}

  if (query_string) {
    query_string = query_string.substr(1)
    var params = query_string.split("&")

    for (var i=0, len=params.length; i<len; ++i){
      var p = params[i].split("=")
      get_params[p[0]] = p[1]
    }
  }

  return get_params
}

