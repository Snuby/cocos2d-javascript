'use strict'

var util   = require('util')
  , events = require('events')
  , ccp    = require('geometry').ccp

var Node            = require('./Node').Node
  , Director        = require('../Director').Director
  , EventDispatcher = require('../EventDispatcher').EventDispatcher

/**
 * @class
 * A fullscreen Node. You need at least 1 layer in your app to add other nodes to.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 */
function Layer () {
    Layer.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    this.isRelativeAnchorPoint = false
    this.anchorPoint = ccp(0.5, 0.5)
    this.contentSize = s

    events.addPropertyListener(this, 'isMouseEnabled', 'change', function () {
        if (this.isRunning) {
            if (this.isMouseEnabled) {
                EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.mouseDelegatePriority})
            } else {
                EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this})
            }
        }
    }.bind(this))


    events.addPropertyListener(this, 'isKeyboardEnabled', 'change', function () {
        if (this.isRunning) {
            if (this.isKeyboardEnabled) {
                EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.keyboardDelegatePriority})
            } else {
                EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this})
            }
        }
    }.bind(this))
}

Layer.inherit(Node, /** @lends cocos.nodes.Layer# */ {
    isMouseEnabled: false
  , isKeyboardEnabled: false
  , mouseDelegatePriority: 0
  , keyboardDelegatePriority: 0

  , onEnter: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.mouseDelegatePriority})
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.keyboardDelegatePriority})
        }

        Layer.superclass.onEnter.call(this)
    }

  , onExit: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this})
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this})
        }

        Layer.superclass.onExit.call(this)
    }
})

module.exports.Layer = Layer
