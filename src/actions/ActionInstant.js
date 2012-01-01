'use strict'

var util = require('util'),
    action = require('./Action'),
    ccp = require('geometry').ccp

/**
 * @class
 * Base class for actions that triggers instantly. They have no duration.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.FiniteTimeAction
 */
function ActionInstant (opts) {
    ActionInstant.superclass.constructor.call(this, opts)

    this.duration = 0
}

ActionInstant.inherit(action.FiniteTimeAction, /** @lends cocos.actions.ActionInstant */ {
    get isDone () {
        return true
    },

    step: function (dt) {
        this.update(1)
    },

    update: function (t) {
        // ignore
    },

    copy: function() {
        return this
    },

    reverse: function () {
        return this.copy()
    }
})

/**
 * @class
 * Show a node
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInstant
 */
function Show (opts) {
    Show.superclass.constructor.call(this, opts)
}

Show.inherit(ActionInstant, /** @lends cocos.actions.Show# */ {
    startWithTarget: function(target) {
        Show.superclass.startWithTarget.call(this, target)
        this.target.visible = true
    },

    copy: function() {
        return new Show()
    },

    reverse: function() {
        return new exports.Hide()
    }
})

/**
 * @class
 * Hide a node
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInstant
 */
function Hide (opts) {
    Hide.superclass.constructor.call(this, opts)
}

Hide.inherit(ActionInstant, /** @lends cocos.actions.Hide# */ {
    startWithTarget: function(target) {
        Hide.superclass.startWithTarget.call(this, target)
        this.target.visible = false
    },

    copy: function() {
        return new Hide()
    },

    reverse: function() {
        return new exports.Show()
    }
})

/**
 * @class
 * Toggles the visibility of a node
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInstant
 */
function ToggleVisibility (opts) {
    ToggleVisibility.superclass.constructor.call(this, opts)
}

ToggleVisibility.inherit(ActionInstant, /** @lends cocos.actions.ToggleVisibility# */ {
    startWithTarget: function(target) {
        ToggleVisibility.superclass.startWithTarget.call(this, target)
        var vis = this.target.visible
        this.target.visible = !vis
    },

    copy: function() {
        return new ToggleVisibility()
    }
})

/**
 * @class
 * Flips a sprite horizontally
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInstant
 *
 * @opt {Boolean} flipX Should the sprite be flipped
 */
function FlipX (opts) {
    FlipX.superclass.constructor.call(this, opts)
    this.flipX = opts.flipX
}

FlipX.inherit(ActionInstant, /** @lends cocos.actions.FlipX# */ {
    flipX: false,

    startWithTarget: function (target) {
        FlipX.superclass.startWithTarget.call(this, target)

        target.flipX = this.flipX
    },

    reverse: function () {
        return new FlipX({flipX: !this.flipX})
    },

    copy: function () {
        return new FlipX({flipX: this.flipX})
    }
})

/**
 * @class
 * Flips a sprite vertically
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInstant
 *
 * @opt {Boolean} flipY Should the sprite be flipped
 */
function FlipY (opts) {
    FlipY.superclass.constructor.call(this, opts)

    this.flipY = opts.flipY
}

FlipY.inherit(ActionInstant, /** @lends cocos.actions.FlipY# */ {
    flipY: false,

    startWithTarget: function (target) {
        FlipY.superclass.startWithTarget.call(this, target)

        target.flipY = this.flipY
    },

    reverse: function () {
        return new FlipY({flipY: !this.flipY})
    },

    copy: function () {
        return new FlipY({flipY: this.flipY})
    }
})

/**
 * @class
 * Places the node in a certain position
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInstant
 *
 * @opt {geometry.Point} position
 */
function Place (opts) {
    Place.superclass.constructor.call(this, opts)
    this.position = util.copy(opts.position)
}

Place.inherit(ActionInstant, /** @lends cocos.actions.Place# */ {
    position: null,

    startWithTarget: function(target) {
        Place.superclass.startWithTarget.call(this, target)
        this.target.position = this.position
    },

    copy: function() {
        return new Place({position: this.position})
    }
})

/**
 * @class
 * Calls a 'callback'
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInstant
 *
 * @opt {Object} target
 * @opt {String|Function} method
 */
function CallFunc (opts) {
    CallFunc.superclass.constructor.call(this, opts)

    // Save target & method so that copy() can recreate callback
    this.target = opts.target
    this.method = (typeof opts.method == 'function') ? opts.method : this.target[opts.method]
    this.callback = this.method.bind(this.target)
}

CallFunc.inherit(ActionInstant, /** @lends cocos.actions.CallFunc# */ {
    callback: null,
    target: null,
    method: null,

    startWithTarget: function(target) {
        CallFunc.superclass.startWithTarget.call(this, target)
        this.execute(target)
    },

    execute: function(target) {
        // Pass target to callback
        this.callback.call(this, target)
    },

    copy: function() {
        return new CallFunc({target: this.target, method: this.method})
    }
})

exports.ActionInstant = ActionInstant
exports.Show = Show
exports.Hide = Hide
exports.ToggleVisibility = ToggleVisibility
exports.FlipX = FlipX
exports.FlipY = FlipY
exports.Place = Place
exports.CallFunc = CallFunc

// vim:et:st=4:fdm=marker:fdl=0:fdc=1

