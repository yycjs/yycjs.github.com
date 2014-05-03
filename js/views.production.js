(function(window) {
 can.view.preload('views_about_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"container-fluid\">");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"group"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"  <div class=\"row-fluid\">\n      <div class=\"span12\">\n        <h1>About Us ");___v1ew.push(
can.view.txt(
1,
'h1',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"who"})}));
___v1ew.push(
"</h1>\n        <hr>\n    </div>\n    <div class=\"row-fluid\">\n      <div class=\"description\">\n        ");___v1ew.push(
can.view.txt(
0,
'div',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"description"})}));
___v1ew.push(
"\n      </div>\n    </div>\n    <div class=\"row-fluid\">\n      <div class=\"stats\">\n        <h3>Meet some of our <span class=\"bold\">");___v1ew.push(
can.view.txt(
1,
'span',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"members"})}));
___v1ew.push(
"</span> members</h3>\n      </div>\n    </div>\n    <div class=\"members\">");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"memberList"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"        ");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"if"},{get:"photo.thumb_link"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"\n        <a href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"link"})}));
___v1ew.push(
"\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"\" data-original-title=\"");___v1ew.push(
can.view.txt(
true,
'a',
'data-original-title',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"name"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"\n          <img class=\"img-circle member-photo\" ");___v1ew.push(
can.view.txt(0,'img',1,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"photo.thumb_link"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"");___v1ew.push(
can.view.txt(2,'img','src',this,function(){var ___v1ew = [];___v1ew.push(
"src=\"");___v1ew.push(
can.Mustache.txt(
{scope:scope,options:options},
null,{get:"."}));___v1ew.push(
"\"");return ___v1ew.join('')}));
return ___v1ew.join("");}}])}));___v1ew.push(
" alt=\"");___v1ew.push(
can.view.txt(
true,
'img',
'alt',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"name"})}));
___v1ew.push(
"\"",can.view.pending({scope: scope,options: options}),"/>");___v1ew.push(
"\n        </a>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"      ");return ___v1ew.join("");}}])}));___v1ew.push(
"\n    </div>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"  </div>\n</div>");; return ___v1ew.join('') }));
can.view.preload('views_blog_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"container-fluid\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <h1>Latest Posts</h1>\n      <hr>\n    </div>\n  </div>");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'/div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"posts"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"    <div class=\"post\">\n      <div class=\"row-fluid\">\n        <div class=\"summary span12\">\n          ");___v1ew.push(
can.view.txt(
0,
'div',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"markdown"},{get:"content"})}));
___v1ew.push(
"\n        </div>\n      </div>\n    </div>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"</div>");; return ___v1ew.join('') }));
can.view.preload('views_error_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"container-fluid\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <h1>");___v1ew.push(
can.view.txt(
1,
'h1',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"who"})}));
___v1ew.push(
" doesn't like us right now</h1>\n      <hr>\n  </div>\n  <div class=\"row-fluid\">\n    <div class=\"error\">\n      <p>");___v1ew.push(
can.view.txt(
1,
'p',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"message"})}));
___v1ew.push(
"</p>\n      <p>You can find what you need on <a target=\"_blank\" href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"fallback"})}));
___v1ew.push(
"\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"this page</a> though.</p>\n    </div>\n  </div>\n</div>");; return ___v1ew.join('') }));
can.view.preload('views_index_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"slideshow\">");___v1ew.push(
"\n</div>\n<div class=\"container-fluid\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <h1 class=\"text\" title=\"Upcoming Events\">Upcoming Events</h1>\n      <hr>\n    </div>\n  </div>\n  <div class=\"upcoming-events\">");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"upcoming"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"      ");___v1ew.push(
can.view.txt(
0,
'div',
0,
this,
function(){ return can.Mustache.renderPartial('upcoming_meetup',scope,options)}));
___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"  </div>\n</div>");; return ___v1ew.join('') }));
can.view.preload('views_loading_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"bubblingG\">\n  <span id=\"bubblingG_1\"></span>\n  <span id=\"bubblingG_2\"></span>\n  <span id=\"bubblingG_3\"></span>\n</div>\n");; return ___v1ew.join('') }));
can.view.preload('views_meetups_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"container-fluid\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <h1>Upcoming Events</h1>\n      <hr>\n    </div>\n  </div>");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'/div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"upcoming"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"    ");___v1ew.push(
can.view.txt(
0,
'/div',
0,
this,
function(){ return can.Mustache.renderPartial('views/upcoming_meetup',scope,options)}));
___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <h1>Past Events</h1>\n      <hr>\n    </div>\n  </div>");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'/div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"past"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"    ");___v1ew.push(
can.view.txt(
0,
'/div',
0,
this,
function(){ return can.Mustache.renderPartial('views/past_meetup',scope,options)}));
___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"</div>");; return ___v1ew.join('') }));
can.view.preload('views_past_meetup_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"meetup\">\n  <div class=\"row-fluid\">\n    <div class=\"span8\">\n      <h2>");___v1ew.push(
can.view.txt(
1,
'h2',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"name"})}));
___v1ew.push(
"</h2>\n      <h3>");___v1ew.push(
can.view.txt(
1,
'h3',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"prettyDate"},{get:"time"})}));
___v1ew.push(
"</h3>\n    </div>\n  </div>\n  <div class=\"row-fluid\">\n    <div class=\"description span10\">\n      <h3>Itinerary <a href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"event_url"})}));
___v1ew.push(
"\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"<i class=\"icon-meetup\"></i></a></h3>\n      ");___v1ew.push(
can.view.txt(
0,
'div',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"description"})}));
___v1ew.push(
"\n    </div>\n  </div>\n</div>");; return ___v1ew.join('') }));
can.view.preload('views_projects_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"container-fluid\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <h1>Our Projects</h1>\n      <hr>\n    </div>\n  </div>");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'/div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"projects"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"  <div class=\"project\">\n    <div class=\"row-fluid\">\n      <div class=\"span12\">\n        <h2>\n          ");___v1ew.push(
can.view.txt(
1,
'h2',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"description"})}));
___v1ew.push(
"\n        </h2>\n        <h1 class=\"project-links\">\n            <a href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"html_url"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"<i class=\"icon-github\"></i></a>");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'h1',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"if"},{get:"homepage"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"            <a href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"homepage"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"<i class=\"icon-home-1\"></i></a>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"        </h1>\n      </div>\n    </div>\n    <div class=\"row-fluid\">");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"readme"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"      <div class=\"project-description span9\">\n          ");___v1ew.push(
can.view.txt(
0,
'div',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"html"})}));
___v1ew.push(
"\n      </div>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"      <div class=\"span3\">\n        <a href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"homepage"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"\n          <img class=\"img-rounded\" ");___v1ew.push(
can.view.txt(2,'img','src',this,function(){var ___v1ew = [];___v1ew.push(
"src=\"");___v1ew.push(
can.Mustache.txt(
{scope:scope,options:options},
null,{get:"homepage"}));___v1ew.push(
"/screenshot.png\"");return ___v1ew.join('')}));
___v1ew.push(
"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"\n        </a>\n      </div>\n    </div>\n  </div>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"</div>");; return ___v1ew.join('') }));
can.view.preload('views_sponsors_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"container-fluid\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <h1>Meet Our Amazing Sponsors</h1>\n      <hr>\n    </div>\n  </div>\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div class=\"row-fluid\">\n        <div class=\"span6\">\n          <div class=\"center\">\n            <a href=\"http://www.assemblycs.com/\" target=\"_blank\">\n              <img class=\"assembly logo\" ");___v1ew.push(
can.view.txt(2,'img','src',this,function(){var ___v1ew = [];___v1ew.push(
"src=\"");___v1ew.push(
"img/assembly_logo.png\"");return ___v1ew.join('')}));
___v1ew.push(
" alt=\"Assembly Logo\" title=\"Assembly Co-working Space\" />\n            </a>\n            <h3>Co-Working Made Awesome</h3>\n            <div class=\"sponsor-description\">\n              <p>Assembly is Calgary's newest center for all that is tech. It is a place that fosters entrepreneurship in the purest sense, a place to call home. Whether you're working as a consultant or you've quit your day job and taken the plunge, the first thing you need is a place be grounded, filled with like minded go-getters. Assembly is the best place to be and we are very grateful to have them as a sponsor and a continual supporter of the Calgary tech community.\n              </p>\n              <h1 class=\"project-links\">\n                <a href=\"http://www.assemblycs.com/\" target=\"_blank\"><i class=\"icon-home-1\"></i></a>\n              </h1>\n            </div>\n          </div>\n        </div>\n        <div class=\"span6\">\n          <div class=\"center\">\n            <a href=\"http://www.villagebrewery.com/\" target=\"_blank\">\n              <img class=\"logo\" ");___v1ew.push(
can.view.txt(2,'img','src',this,function(){var ___v1ew = [];___v1ew.push(
"src=\"");___v1ew.push(
"img/village_brewery_logo.png\"");return ___v1ew.join('')}));
___v1ew.push(
" alt=\"Village Brewery Logo\" title=\"Village Brewery\" />\n            </a>\n            <h3>It Takes A Village</h3>\n            <div class=\"sponsor-description\">\n              <p>Some of the best things happen over beer. Ideas are born, friendships forged, deals struck, communities built. That’s how Village Brewery began, friends sharing beers and dreams.  Village Brewery proudly supports Calgary’s artists and craftspeople and their bold ideas. We are ecstatic to have such an amazing sponsor that shares many of the same values as us. Please join us, lift a pint and salute the Village of Calgary. It takes a Village to raise a beer. And a beer to raise a Village.</p>\n              <h1 class=\"project-links\">\n                <a href=\"http://www.villagebrewery.com/\" target=\"_blank\"><i class=\"icon-home-1\"></i></a>\n                <a href=\"https://twitter.com/villagebrewery\" target=\"_blank\"><i class=\"icon-twitter\"></i></a>\n                <a href=\"http://www.facebook.com/villagebrewery\" target=\"_blank\"><i class=\"icon-facebook\"></i></a>\n                <a href=\"http://pinterest.com/villagebrewery/\" target=\"_blank\"><i class=\"icon-pinterest\"></i></a>\n              </h1>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>");; return ___v1ew.join('') }));
can.view.preload('views_upcoming_meetup_mustache',can.Mustache(function(scope,options) { var ___v1ew = [];___v1ew.push(
"<div class=\"meetup\">\n  <div class=\"row-fluid\">\n    <div class=\"span12\">\n      <h2>");___v1ew.push(
can.view.txt(
1,
'h2',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"name"})}));
___v1ew.push(
"</h2>\n      <h3>");___v1ew.push(
can.view.txt(
1,
'h3',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"prettyDate"},{get:"time"})}));
___v1ew.push(
"</h3>\n    </div>\n  </div>\n  <div class=\"row-fluid\">\n    <div class=\"event-location span4\">\n      <div class=\"row-fluid\">\n        <div class=\"span6\">\n          <dl class=\"dl-horizontal\">\n            <dt>Starts:</dt>\n            <dd>");___v1ew.push(
can.view.txt(
1,
'dd',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"prettyTime"},{get:"time"})}));
___v1ew.push(
"</dd>\n            <dt>Ends:</dt>\n            <dd>");___v1ew.push(
can.view.txt(
1,
'dd',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"prettyTime"},{get:"time"},{get:"duration"})}));
___v1ew.push(
"</dd>\n          </dl>\n        </div>\n        <div class=\"span6\">\n          <address>\n            <strong>");___v1ew.push(
can.view.txt(
1,
'strong',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"venue.name"})}));
___v1ew.push(
"</strong><br>\n            ");___v1ew.push(
can.view.txt(
1,
'br',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"venue.address_1"})}));
___v1ew.push(
"<br>\n            ");___v1ew.push(
can.view.txt(
1,
'br',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"venue.city"})}));
___v1ew.push(
", ");___v1ew.push(
can.view.txt(
1,
'br',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"venue.state"})}));
___v1ew.push(
"<br>\n          </address>\n        </div>\n      </div>\n      <div class=\"row-fluid\">\n        <div id=\"map\">\n          <img class=\"img-rounded\" ");___v1ew.push(
can.view.txt(2,'img','src',this,function(){var ___v1ew = [];___v1ew.push(
"src=\"");___v1ew.push(
"http://maps.google.com/maps/api/staticmap?center=");___v1ew.push(
can.Mustache.txt(
{scope:scope,options:options},
null,{get:"venue.lat"}));___v1ew.push(
",");___v1ew.push(
can.Mustache.txt(
{scope:scope,options:options},
null,{get:"venue.lon"}));___v1ew.push(
"&amp;zoom=14&amp;format=png&amp;maptype=roadmap&amp;mobile=true&amp;markers=color:Yellow|");___v1ew.push(
can.Mustache.txt(
{scope:scope,options:options},
null,{get:"venue.lat"}));___v1ew.push(
",");___v1ew.push(
can.Mustache.txt(
{scope:scope,options:options},
null,{get:"venue.lon"}));___v1ew.push(
"&amp;size=480x320&amp;key=ABQIAAAAQ127-gVdIM3nq38RBYCN-RRrZQw2CF6YFdWEO75V5821rhw7fBTGniMwnKw_COoRSFJ3rNONzbqycw&amp;sensor=false\"");return ___v1ew.join('')}));
___v1ew.push(
"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"\n        </div>\n      </div>\n      <div class=\"row-fluid\">\n        <h3>Presenters</h3>\n      </div>");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'img',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"hosts"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"      <div class=\"row-fluid\">\n        <a class=\"pull-left\" href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"link"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"\n          <img class=\"img-circle member-photo\" ");___v1ew.push(
can.view.txt(0,'img',1,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"photo.thumb_link"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"");___v1ew.push(
can.view.txt(2,'img','src',this,function(){var ___v1ew = [];___v1ew.push(
"src=\"");___v1ew.push(
can.Mustache.txt(
{scope:scope,options:options},
null,{get:"."}));___v1ew.push(
"\"");return ___v1ew.join('')}));
return ___v1ew.join("");}}])}));___v1ew.push(
"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"\n        </a>\n        <div class=\"pull-left\">\n          <h4>");___v1ew.push(
can.view.txt(
1,
'h4',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"name"})}));
___v1ew.push(
"</h4>");___v1ew.push(
"\n");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"other_services"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"          ");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"twitter"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"\n          <a href=\"http://twitter.com/");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"identifier"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"<i class=\"icon-twitter\"></i></a>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"          ");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"linkedin"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"\n          <a href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"identifier"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"<i class=\"icon-linkedin\"></i></a>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"          ");___v1ew.push(
can.view.txt(0,'div',0,this,function(){ return can.Mustache.txt(
{scope:scope,options:options},
"#",{get:"facebook"},[

{fn:function(scope,options){var ___v1ew = [];___v1ew.push(
"\n          <a href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"identifier"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"<i class=\"icon-facebook\"></i></a>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"          ");return ___v1ew.join("");}}])}));___v1ew.push(
"\n        </div>\n      </div>");___v1ew.push(
"\n");return ___v1ew.join("");}}])}));___v1ew.push(
"    </div>\n    <div class=\"description span8\">\n      <h3>Itinerary</h3>\n      ");___v1ew.push(
can.view.txt(
0,
'div',
0,
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"description"})}));
___v1ew.push(
"\n      <h4>\n        <a href=\"");___v1ew.push(
can.view.txt(
true,
'a',
'href',
this,
function(){ return can.Mustache.txt(
{scope:scope,options:options},
null,{get:"event_url"})}));
___v1ew.push(
"\" target=\"_blank\"",can.view.pending({scope: scope,options: options}),">");___v1ew.push(
"RSVP on <i class=\"icon-meetup large\"></i></a>\n      </h4>\n    </div>\n  </div>\n</div> <!-- ./meetup -->");; return ___v1ew.join('') })); 
})(this);