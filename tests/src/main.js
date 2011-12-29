/*globals module exports resource require window*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var params = top.window.location.search;
if (params) {
    var mod = params.split('=')[1];
    require('./' + mod).main();
} else {
    var c = parent.document.getElementById('cocos2d-application');
    c.style.fontFamily = 'sans-serif';
    c.style.textAlign = 'center';
    c.style.fontSize = '20pt';
    c.style.lineHeight = c.clientHeight + 'px';
    c.innerHTML = '\u2190 Select a test to run'
}
