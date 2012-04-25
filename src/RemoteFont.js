var events = require('events')
  , remote_resources = require('remote_resources')

var fontTestElement
  , ctx
/**
 * Very crude way to test for when a font has loaded
 *
 * While a font is loading they will be drawn as blank onto a canvas.
 * This function  creates a small canvas and tests the pixels to see if the
 * given font draws. If it does then we can assume the font loaded.
 */
function hasFontLoaded (window, fontName) {
    var testSize = 16
    if (!fontTestElement) {
        fontTestElement = window.document.createElement('canvas')
        fontTestElement.width = testSize
        fontTestElement.height = testSize
        fontTestElement.style.display = 'none'

        ctx = fontTestElement.getContext('2d')
        window.document.body.appendChild(fontTestElement)
    }

    fontTestElement.width = testSize
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.fillRect(0, 0, testSize, testSize)
    ctx.font = testSize + "px __cc2d_" + fontName
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'
    ctx.fillText("M", 0, testSize);

    var pixels = ctx.getImageData(0, 0, testSize, testSize).data

    for (var i = 0; i < testSize * testSize; i++) {
        if (pixels[i * 4] != 0) {
            fontTestElement.parentNode.removeChild(fontTestElement)
            fontTestElement = null
            return true
        }
    }

    return false
}

/**
 * @class
 * @memberOf cocos
 * @extends remote_resources.RemoteResource
 */
function RemoteFont(url, path) {
    remote_resources.RemoteResource.apply(this, arguments)
}

RemoteFont.prototype = Object.create(remote_resources.RemoteResource.prototype)

RemoteFont.prototype.load = function () {
    var window = require('./Director').Director.sharedDirector.window

    var fontName = this.path.split('/').pop().split('.')[0]
    var fontFace = "@font-face { \
                        font-family: '__cc2d_" + fontName + "'; \
                        src: url(" + this.url + "); \
                    }"

    var t = document.createElement('style')
    t.appendChild(document.createTextNode(fontFace))
    window.document.body.appendChild(t)

    var ticker = setInterval(function () {
        if (hasFontLoaded(window, fontName)) {
            __jah__.resources[this.path].loaded = true
            events.trigger(this, 'load', this)
            clearInterval(ticker)
        }
    }.bind(this), 100)
}

exports.RemoteFont = RemoteFont
