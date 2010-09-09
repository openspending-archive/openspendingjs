var disqus_identifier;
var disqus_developer = true;

// Called by the dashboard after basic initialisation is done.
// 
function wdmmgInit() {
    var m = swfobject.getObjectById("wdmmg");
    m.removeHeader();
    m.removeFooter();
    m.disableUrls();
}

// Called by the dashboard when the user makes changes within the visualisation
// 
function wdmmgCallback(page, params) {
	alert('wdmmgCallback');
    var txt = 'Page:' + page + "\n";
    var p;
    for (p in params) {
        txt = txt + "param:" + p + ", " + params[p] + "\n";
    }
    var uid = page + "/";
    for (p in params) {
        uid = uid + "&" + p + "=" + params[p];
    }    
    var disqus_thread = document.getElementById('disqus_thread');
    disqus_thread.innerHTML = '';
    disqus_identifier = uid;
	(function() {
	   var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
	   dsq.src = 'http://wdmmg-phase2.disqus.com/embed.js';
	   (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
	  })();
    //alert("ID = " + disqus_identifier);
    window.location.hash = "/" + uid;
}


// Changes the current dashboard view
//
function changeView(viewName, params) {
    var m = swfobject.getObjectById("wdmmg");
    m.changeView(viewName, params);
}