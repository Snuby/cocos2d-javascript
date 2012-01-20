'use strict'

var params = top.window.location.search
if (params) {
    var mod = params.split('=')[1]
    require('./tests/' + mod).main()
} else {
    var c = parent.document.getElementById('cocos2d-tests')
    c.style.fontFamily = 'sans-serif'
    c.style.textAlign = 'center'
    c.style.fontSize = '20pt'
    c.style.lineHeight = c.clientHeight + 'px'
    c.innerHTML = '\u2190 Select a test to run'
}
