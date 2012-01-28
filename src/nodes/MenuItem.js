'use strict'

var util = require('util'),
    Node = require('./Node').Node,
    Sprite = require('./Sprite').Sprite,
    rectMake = require('geometry').rectMake,
    ccp = require('geometry').ccp

/**
 * @class
 * Base class for any buttons or options in a menu
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 *
 * @opt {Function} callback Function to call when menu item is activated
 */
function MenuItem (opts) {
    MenuItem.superclass.constructor.call(this, opts)

    var callback = opts.callback

    this.anchorPoint = ccp(0.5, 0.5)
    this.callback = callback
}

MenuItem.inherit(Node, /** @lends cocos.nodes.MenuItem# */ {
    _isEnabled: true,
    isSelected: false,
    callback: null,

    activate: function () {
        if (this.isEnabled && this.callback) {
            this.callback(this)
        }
    },

    /**
     * @getter rect
     * @type geometry.Rect
     */
    get rect () {
        return rectMake(
            this.position.x - this.contentSize.width  * this.anchorPoint.x,
            this.position.y - this.contentSize.height * this.anchorPoint.y,
            this.contentSize.width,
            this.contentSize.height
        )
    },

    get isEnabled () {
        return this._isEnabled
    },

    set isEnabled (enabled) {
        this._isEnabled = enabled
    },

    selected: function () {
        this.isSelected = true
    },

    unselected: function () {
        this.isSelected = false
    }
})

/**
 * @class
 * A menu item that accepts any cocos.nodes.Node
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.MenuItem
 *
 * @opt {cocos.nodes.Node} normalImage Main Node to draw
 * @opt {cocos.nodes.Node} selectedImage Node to draw when menu item is selected
 * @opt {cocos.nodes.Node} disabledImage Node to draw when menu item is disabled
 */
function MenuItemSprite (opts) {
    MenuItemSprite.superclass.constructor.call(this, opts)

    var normalImage   = opts.normalImage,
        selectedImage = opts.selectedImage,
        disabledImage = opts.disabledImage

    this.normalImage = normalImage
    this.selectedImage = selectedImage
    this.disabledImage = disabledImage

    this.contentSize = normalImage.contentSize
}

MenuItemSprite.inherit(MenuItem, /** @lends cocos.nodes.MenuItemSprite# */ {
    _normalImage: null,
    _selectedImage: null,
    _disabledImage: null,

    get normalImage () {
        return this._normalImage
    },

    set normalImage (image) {
        if (image != this.normalImage) {
            image.anchorPoint = ccp(0, 0)
            image.visible = true
            this.removeChild({child: this.normalImage, cleanup: true})
            this.addChild(image)

            this._normalImage = image
        }
    },

    get selectedImage () {
        return this._selectedImage
    },

    set selectedImage (image) {
        if (image != this.selectedImage) {
            image.anchorPoint = ccp(0, 0)
            image.visible = false
            this.removeChild({child: this.selectedImage, cleanup: true})
            this.addChild(image)

            this._selectedImage = image
        }
    },

    get disabledImage () {
        return this._disabledImage
    },

    set disabledImage (image) {
        if (image != this.disabledImage) {
            image.anchorPoint = ccp(0, 0)
            image.visible = false
            this.removeChild({child: this.disabledImage, cleanup: true})
            this.addChild(image)

            this._disabledImage = image
        }
    },

    selected: function () {
        MenuItemSprite.superclass.selected.call(this)

        if (this.selectedImage) {
            this.normalImage.visible =   false
            this.selectedImage.visible = true
            if (this.disabledImage) this.disabledImage.visible = false
        } else {
            this.normalImage.visible =   true
            if (this.disabledImage) this.disabledImage.visible = false
        }
    },

    unselected: function () {
        MenuItemSprite.superclass.unselected.call(this)

        this.normalImage.visible =   true
        if (this.selectedImage) this.selectedImage.visible = false
        if (this.disabledImage) this.disabledImage.visible = false
    },

    get isEnabled () {
        return this._isEnabled
    },

    set isEnabled (enabled) {
        this._isEnabled = enabled

        if (enabled) {
            this.normalImage.visible =   true
            if (this.selectedImage) this.selectedImage.visible = false
            if (this.disabledImage) this.disabledImage.visible = false
        } else {
            if (this.disabledImage) {
                this.normalImage.visible =   false
                if (this.selectedImage) this.selectedImage.visible = false
                this.disabledImage.visible = true
            } else {
                this.normalImage.visible =   true
                if (this.selectedImage) this.selectedImage.visible = false
            }
        }
    }
})

/**
 * @class
 * MenuItem that accepts image files
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.MenuItemSprite
 *
 * @opt {String} normalImage Main image file to draw
 * @opt {String} selectedImage Image file to draw when menu item is selected
 * @opt {String} disabledImage Image file to draw when menu item is disabled
 */
function MenuItemImage (opts) {
    var normalI   = opts.normalImage,
        selectedI = opts.selectedImage,
        disabledI = opts.disabledImage,
        callback  = opts.callback

    var normalImage = new Sprite({file: normalI}),
        selectedImage = new Sprite({file: selectedI}),
        disabledImage = null

    if (disabledI) {
        disabledImage = new Sprite({file: disabledI})
    }

    MenuItemImage.superclass.constructor.call(this, {normalImage: normalImage, selectedImage: selectedImage, disabledImage: disabledImage, callback: callback})
}

MenuItemImage.inherit(MenuItemSprite)

exports.MenuItem = MenuItem
exports.MenuItemImage = MenuItemImage
exports.MenuItemSprite = MenuItemSprite

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
