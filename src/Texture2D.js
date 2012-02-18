'use strict'

var util = require('util'),
    events = require('events'),
    RemoteResource = require('remote_resources').RemoteResource

/**
 * @class
 *
 * @memberOf cocos
 *
 * @opt {String} [file] The file path of the image to use as a texture
 * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
 */
function Texture2D (opts) {
    var file = opts.file,
        data = opts.data,
        texture = opts.texture

    if (file) {
        this.name = file
        data = resource(file)
    } else if (texture) {
        this.name = texture.name
        data = texture.imgElement
    }

    this.size = {width: 0, height: 0}

    if (data instanceof RemoteResource) {
        events.addListenerOnce(data, 'load', this.dataDidLoad.bind(this))
        this.imgElement = data.load()
    } else {
        this.imgElement = data
        this.dataDidLoad(data)
    }
}

Texture2D.inherit(Object, /** @lends cocos.Texture2D# */ {
    imgElement: null,
    size: null,
    name: null,
    isLoaded: false,

    dataDidLoad: function (data) {
        this.isLoaded = true
        this.size = {width: this.imgElement.width, height: this.imgElement.height}
        events.trigger(this, 'load', this)
    },

    drawAtPoint: function (ctx, point) {
        if (!this.isLoaded) {
            return
        }
        ctx.drawImage(this.imgElement, point.x, point.y)
    },
    drawInRect: function (ctx, rect) {
        if (!this.isLoaded) {
            return
        }
        ctx.drawImage(this.imgElement,
            rect.origin.x, rect.origin.y,
            rect.size.width, rect.size.height
        )
    },

    /**
     * @getter data
     * @type {String} Base64 encoded image data
     */
    get data () {
        return this.imgElement ? this.imgElement.src : null
    },

    /**
     * @getter contentSize
     * @type {geometry.Size} Size of the texture
     */
    get contentSize () {
        return this.size
    },

    get pixelsWide () {
        return this.size.width
    },

    get pixelsHigh () {
        return this.size.height
    }
})

exports.Texture2D = Texture2D

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
