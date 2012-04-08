'use strict'

var util = require('util'),
    Layer = require('./Layer').Layer,
    Director = require('../Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    geom = require('geometry'), ccp = geom.ccp

var TouchDispatcher = require('../TouchDispatcher').TouchDispatcher

/**
 * @private
 * @constant
 */
var kMenuStateWaiting = 0

/**
 * @private
 * @constant
 */
var kMenuStateTrackingTouch = 1

var kMenuTouchPriority = -128

/**
 * @class
 * A fullscreen node used to render a selection of menu options
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Layer
 *
 * @opt {cocos.nodes.MenuItem[]} items An array of MenuItems to draw on the menu
 */
function Menu (opts) {
    Menu.superclass.constructor.call(this, opts)

    var items = opts.items

    if (Director.sharedDirector.isTouchScreen) {
        this.isTouchEnabled = true
    } else {
        this.isMouseEnabled = true
    }

    var s = Director.sharedDirector.winSize

    this.isRelativeAnchorPoint = false
    this.anchorPoint = ccp(0.5, 0.5)
    this.contentSize = s

    this.position = ccp(s.width / 2, s.height / 2)


    if (items) {
        var z = 0
        items.forEach(function (item) {
            this.addChild({child: item, z: z++})
        }.bind(this))
    }
}

Menu.inherit(Layer, /** @lends cocos.nodes.Menu# */ {
    mouseDelegatePriority: (-Number.MAX_VALUE + 1),
    state: kMenuStateWaiting,
    selectedItem: null,
    color: null,

    addChild: function (opts) {
        if (!opts.child instanceof MenuItem) {
            throw "Menu only supports MenuItem objects as children"
        }

        Menu.superclass.addChild.call(this, opts)
    },

    // Touch Events
    registerWithTouchDispatcher: function () {
        TouchDispatcher.sharedDispatcher.addTargetedDelegate(this, kMenuTouchPriority, true)
    },

    itemForTouch: function (event) {
        var location = Director.sharedDirector.convertTouchToCanvas(event.touch)

        var children = this.children
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i]

            if (item.visible && item.isEnabled) {
                var local = item.convertToNodeSpace(location)

                var r = item.rect
                r.origin = ccp(0, 0)

                if (geom.rectContainsPoint(r, local)) {
                    return item
                }

            }
        }

        return null
    },

    touchBegan: function (evt) {
        if (this.state != kMenuStateWaiting || !this.visible) {
            return false
        }

        for (var c = this.parent; c; c = c.parent) {
            if (!c.visible)
                return false
        }

        var selectedItem = this.itemForTouch(evt)
        this.selectedItem = selectedItem
        if (selectedItem) {
            selectedItem.selected()
            this.state = kMenuStateTrackingTouch

            return true
        }

        return false
    },

    touchEnded: function (evt) {
        var selItem = this.selectedItem

        if (selItem) {
            selItem.unselected()
            selItem.activate()
        }

        if (this.state != kMenuStateWaiting) {
            this.state = kMenuStateWaiting
        }
    },

    touchCancelled: function (evt) {
        var selItem = this.selectedItem

        if (selItem) {
            selItem.unselected()
        }

        if (this.state != kMenuStateWaiting) {
            this.state = kMenuStateWaiting
        }
    },

    touchMoved: function (evt) {
        var currentItem = this.itemForTouch(evt)

        if (currentItem != this.selectedItem) {
            if (this.selectedItem) {
                this.selectedItem.unselected()
            }
            this.selectedItem = currentItem
            if (this.selectedItem) {
                this.selectedItem.selected()
            }
        }
    },


    // Mouse Events
    itemForMouseEvent: function (event) {
        var location = event.locationInCanvas

        var children = this.children
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i]

            if (item.visible && item.isEnabled) {
                var local = item.convertToNodeSpace(location)

                var r = item.rect
                r.origin = ccp(0, 0)

                if (geom.rectContainsPoint(r, local)) {
                    return item
                }

            }
        }

        return null
    },

    mouseUp: function (event) {
        var selItem = this.selectedItem

        if (selItem) {
            selItem.unselected()
            selItem.activate()
        }

        if (this.state != kMenuStateWaiting) {
            this.state = kMenuStateWaiting
        }
        if (selItem) {
            return true
        }
        return false

    },
    mouseDown: function (event) {
        if (this.state != kMenuStateWaiting || !this.visible) {
            return false
        }

        var selectedItem = this.itemForMouseEvent(event)
        this.selectedItem = selectedItem
        if (selectedItem) {
            selectedItem.selected()
            this.state = kMenuStateTrackingTouch

            return true
        }

        return false
    },

    mouseDragged: function (event) {
        var currentItem = this.itemForMouseEvent(event)

        if (currentItem != this.selectedItem) {
            if (this.selectedItem) {
                this.selectedItem.unselected()
            }
            this.selectedItem = currentItem
            if (this.selectedItem) {
                this.selectedItem.selected()
            }
        }

        if (currentItem && this.state == kMenuStateTrackingTouch) {
            return true
        }

        return false

    }

})

exports.Menu = Menu

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
