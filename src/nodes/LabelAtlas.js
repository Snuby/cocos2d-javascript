'use strict'

var AtlasNode = require('./AtlasNode').AtlasNode,
    Sprite = require('./Sprite').Sprite,
    geo   = require('geometry'),
    events = require('events')

/**
 * @class
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.BatchNode
 *
 * @opt {String} [string=] Initial text to draw
 * @opt {String} charMapFile
 * @opt {Integer} itemWidth
 * @opt {Integer} itemHeight
 * @opt {String} startCharMap Single character
 */
function LabelAtlas (opts) {
    LabelAtlas.superclass.constructor.call(this, {
        file: opts.charMapFile,
        itemWidth: opts.itemWidth,
        itemHeight: opts.itemHeight,
        itemsToRender: opts.string.length,
        size: new geo.Size(opts.itemWidth * opts.string.length, opts.itemHeight)
    })

    events.addPropertyListener(this, 'string', 'change', this.updateAtlasValue.bind(this))

    this.mapStartChar = opts.startCharMap.charCodeAt(0)
    this.string = opts.string

    this.contentSize = new geo.Size(opts.itemWidth * this.string.length, opts.itemHeight)
}

LabelAtlas.inherit(AtlasNode, /** @lends cocos.nodes.LabelAtlas# */ {
    string: '',

    mapStartChar: '',

    updateAtlasValue: function () {
        var n = this.string.length,
            s = this.string

        // FIXME this should reuse children to improve performance
        while (this.children.length > 0) {
            this.removeChild(this.children[0])
        }

        for (var i = 0; i < n; i++) {
            var a = s.charCodeAt(i) - this.mapStartChar,
                row = (a % this.itemsPerRow),
                col = Math.floor(a / this.itemsPerRow)

            var left = row * this.itemWidth,
                top  = col * this.itemHeight

            var tile = new Sprite({rect: new geo.Rect(left, top, this.itemWidth, this.itemHeight),
                              textureAtlas: this.textureAtlas})

            tile.position = new geo.Point(i * this.itemWidth, 0)
            tile.anchorPoint = new geo.Point(0, 0)
            tile.opacity = this.opacity

            this.addChild({child: tile})
        }
    }
})

exports.LabelAtlas = LabelAtlas

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
