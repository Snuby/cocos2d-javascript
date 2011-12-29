/*globals module exports resource require window*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var container = parent.window.document.getElementById('cocos2d-application');
container.className = 'logs';

var logNum = 0;
window.print = function (msg, tag) {
    logNum++;
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(logNum + '. [' + currentTest.split('/').pop().toUpperCase() + '] ' + msg));
    div.className = 'log ' + tag;
    container.appendChild(div);
    container.scrollTop = container.offsetHeight;
};

while (container.firstChild) {
    container.removeChild(container.firstChild);
}

var tests = [
    '/commonjs/tests/modules/1.0/absolute',
    '/commonjs/tests/modules/1.0/cyclic',
    '/commonjs/tests/modules/1.0/determinism',
    '/commonjs/tests/modules/1.0/exactExports',
    '/commonjs/tests/modules/1.0/hasOwnProperty',
    '/commonjs/tests/modules/1.0/method',
    '/commonjs/tests/modules/1.0/missing',
    '/commonjs/tests/modules/1.0/monkeys',
    '/commonjs/tests/modules/1.0/nested',
    '/commonjs/tests/modules/1.0/relative',
    '/commonjs/tests/modules/1.0/transitive'
];

var i = 0
  , currentTest
function nextTest() {
    currentTest = tests[i];
    require.paths.push(currentTest);
    require('program');
    require.paths.splice(require.paths.indexOf(currentTest), 1);
    i++;
    if (i < tests.length) {
        setTimeout(nextTest, 0);
    }
}

exports.main = function () {
    nextTest();
}
