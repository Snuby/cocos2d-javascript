'use strict'

var util   = require('util')
  , events = require('events')
  , ccp    = require('geometry').ccp

var Node            = require('./Node').Node
  , Director        = require('../Director').Director
  , EventDispatcher = require('../EventDispatcher').EventDispatcher
  , TouchDispatcher = require('../TouchDispatcher').TouchDispatcher

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

    if (!Director.sharedDirector.isTouchScreen) {
        events.addPropertyListener(this, 'isMouseEnabled', 'change', function () {
            if (this.isRunning) {
                if (this.isMouseEnabled) {
                    EventDispatcher.sharedDispatcher.addMouseDelegate({delegate: this, priority: this.mouseDelegatePriority})
                } else {
                    EventDispatcher.sharedDispatcher.removeMouseDelegate({delegate: this})
                }
            }
        }.bind(this))

        events.addPropertyListener(this, 'isKeyboardEnabled', 'change', function () {
            if (this.isRunning) {
                if (this.isKeyboardEnabled) {
                    EventDispatcher.sharedDispatcher.addKeyboardDelegate({delegate: this, priority: this.keyboardDelegatePriority})
                } else {
                    EventDispatcher.sharedDispatcher.removeKeyboardDelegate({delegate: this})
                }
            }
        }.bind(this))
    }
}

Layer.inherit(Node, /** @lends cocos.nodes.Layer# */ {
    /**
     * When true causes this layer to receive mouse events
     * @type Boolean
     */
    isMouseEnabled: false

    /**
     * When true causes this layer to receive keyboard events
     * @type Boolean
     */
  , isKeyboardEnabled: false
  , mouseDelegatePriority: 0
  , keyboardDelegatePriority: 0

    /**
     * When true on touch screen devices causes this layer to receive touch events
     * @type Boolean
     */
  , get isTouchEnabled () {
        return this._isTouchEnabled
    }
  , set isTouchEnabled (enabled) {
        if (!Director.sharedDirector.isTouchScreen) {
            throw new Error("Only touch screen devices can listen for touch events")
        }

        if (this._isTouchEnabled != enabled) {
            this._isTouchEnabled = enabled
            if (this.isRunning) {
                if (enabled) {
                    this.registerWithTouchDispatcher()
                } else {
                    TouchDispatcher.sharedDispatcher.removeDelegate(this)
                }
            }
        }
    }
  , _isTouchEnabled: false

    /**
     * Override this method in your layer if you wish to change the type of
     * touch event dispatchment you want
     */
  , registerWithTouchDispatcher: function () {
        TouchDispatcher.sharedDispatcher.addStandardDelegate(this, 0)
    }

  , onEnter: function () {
        if (Director.sharedDirector.isTouchScreen) {
            if (this._isTouchEnabled) {
                this.registerWithTouchDispatcher()
            }
        } else {
            if (this.isMouseEnabled) {
                EventDispatcher.sharedDispatcher.addMouseDelegate({delegate: this, priority: this.mouseDelegatePriority})
            }
            if (this.isKeyboardEnabled) {
                EventDispatcher.sharedDispatcher.addKeyboardDelegate({delegate: this, priority: this.keyboardDelegatePriority})
            }
        }

        Layer.superclass.onEnter.call(this)
    }

  , onExit: function () {
        if (Director.sharedDirector.isTouchScreen) {
            TouchDispatcher.sharedDispatcher.removeDelegate(this)
        } else {
            if (this.isMouseEnabled) {
                EventDispatcher.sharedDispatcher.removeMouseDelegate({delegate: this})
            }
            if (this.isKeyboardEnabled) {
                EventDispatcher.sharedDispatcher.removeKeyboardDelegate({delegate: this})
            }
        }

        Layer.superclass.onExit.call(this)
    }
})

module.exports.Layer = Layer
