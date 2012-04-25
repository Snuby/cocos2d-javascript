'use strict'

var util = require('util'),
    console = require('system').console,
    Director = require('../Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp

/**
 * @class
 * Renders a simple text label
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 *
 * @opt {String} [string=""] The text string to draw
 * @opt {Float} [fontSize=16] The size of the font
 * @opt {String} [fontName="Helvetica"] The name of the font to use
 * @opt {String} [fontColor="white"] The color of the text
 */
function Label (opts) {
    Label.superclass.constructor.call(this, opts)
    this.anchorPoint = ccp(0.5, 0.5)

    'fontSize fontName fontColor string'.w.forEach(function (name) {
        // Set property on init
        if (opts[name]) {
            this[name] = opts[name]
        }
    }.bind(this))

    // Update content size
    this._updateLabelContentSize()
}

Label.inherit(Node, /** @lends cocos.nodes.Label# */ {
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'white',

    /**
     * String of the font name and size to use in a format &lt;canvas&gt; understands
     *
     * @type String
     */
    get font () {
        return this.fontSize + 'px __cc2d_' + this.fontName + ',' + this.fontName
    },

    draw: function (context) {
        if (FLIP_Y_AXIS) {
            context.save()

            // Flip Y axis
            context.scale(1, -1)
            context.translate(0, -this.fontSize)
        }


        context.fillStyle = this.fontColor
        context.font = this.font
        context.textBaseline = 'top'
        if (context.fillText) {
            context.fillText(this.string, 0, 0)
        } else if (context.mozDrawText) {
            context.mozDrawText(this.string)
        }

        if (FLIP_Y_AXIS) {
            context.restore()
        }
    },

    /**
     * @private
     */
    _updateLabelContentSize: function () {
        var ctx = Director.sharedDirector.context
        var size = {width: 0, height: this.fontSize}

        var prevFont = ctx.font
        ctx.font = this.font

        if (ctx.measureText) {
            var txtSize = ctx.measureText(this.string)
            size.width = txtSize.width
        } else if (ctx.mozMeasureText) {
            size.width = ctx.mozMeasureText(this.string)
        }

        ctx.font = prevFont

        this.contentSize = size
    }
})

module.exports.Label = Label

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
