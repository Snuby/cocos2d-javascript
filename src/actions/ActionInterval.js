'use strict'

var util = require('util'),
    actions = require('./Action'),
    geo = require('geometry'),
    ccp = geo.ccp

/**
 * @ignore
 *
 * Creates multiple instances of actionType each given one action plus the next
 * actionType instance
 */
function initWithActions (actionType, actions) {
    var prev = actions[0].copy()
      , now
      , i
    for (i=1; i<actions.length; i++) {
        now = actions[i].copy()
        if (now) {
            prev = new actionType({one: prev, two: now})
        } else {
            break
        }
    }

    return prev
}

/**
 * @ignore
 *
 * Bezier cubic formula
 * ((1 - t) + t)3 = 1
 */
function bezierat (a, b, c, d, t) {
   return Math.pow(1-t, 3) * a +
        3 * t * Math.pow(1-t, 2) * b +
        3 * Math.pow(t, 2) * (1 - t) * c +
        Math.pow(t, 3) * d
}

/**
 * @class
 * Base class actions that do have a finite time duration.
 *
 * Possible actions:
 *
 * - An action with a duration of 0 seconds
 * - An action with a duration of 35.5 seconds Infinite time actions are valid
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.FiniteTimeAction
 *
 * @opt {Float} duration Number of seconds to run action for
 */
function ActionInterval (opts) {
    ActionInterval.superclass.constructor.apply(this, arguments)

    var dur = opts.duration || 0
    if (dur === 0) {
        dur = 0.0000001
    }

    this.duration = dur
    this.elapsed = 0
    this._firstTick = true
}

ActionInterval.inherit(actions.FiniteTimeAction, /** @lends cocos.actions.ActionInterval# */ {
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    _firstTick: true,

    get isDone () {
        return (this.elapsed >= this.duration)
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false
            this.elapsed = 0
        } else {
            this.elapsed += dt
        }

        this.update(Math.min(1, this.elapsed / this.duration))
    },

    startWithTarget: function (target) {
        ActionInterval.superclass.startWithTarget.call(this, target)

        this.elapsed = 0.0
        this._firstTick = true
    },

    copy: function() {
        throw "copy() not implemented"
    },

    reverse: function () {
        throw "Reverse Action not implemented"
    }
})

/**
 * @class
 * Delays the action a certain amount of seconds
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 */
function DelayTime () {
    DelayTime.superclass.constructor.apply(this, arguments)
}

DelayTime.inherit(ActionInterval, /** @lends cocos.actions.DelayTime# */ {
    update: function (t) {
        if (t === 1.0) {
            this.stop()
        }
    },

    copy: function () {
        return new DelayTime({duration: this.duration})
    },

    reverse: function () {
        return new DelayTime({duration: this.duration})
    }
})


/**
 * @class
 * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {Float} duration Number of seconds to run action for
 * @opt {Float} [scale] Size to scale Node to
 * @opt {Float} [scaleX] Size to scale width of Node to
 * @opt {Float} [scaleY] Size to scale height of Node to
 */
function ScaleTo (opts) {
    ScaleTo.superclass.constructor.call(this, opts)

    if (opts.scale !== undefined) {
        this.endScaleX = this.endScaleY = opts.scale
    } else {
        this.endScaleX = opts.scaleX
        this.endScaleY = opts.scaleY
    }
}

ScaleTo.inherit(ActionInterval, /** @lends cocos.actions.ScaleTo# */ {
    /**
     * Current X Scale
     * @type Float
     */
    scaleX: 1,

    /**
     * Current Y Scale
     * @type Float
     */
    scaleY: 1,

    /**
     * Initial X Scale
     * @type Float
     */
    startScaleX: 1,

    /**
     * Initial Y Scale
     * @type Float
     */
    startScaleY: 1,

    /**
     * Final X Scale
     * @type Float
     */
    endScaleX: 1,

    /**
     * Final Y Scale
     * @type Float
     */
    endScaleY: 1,

    /**
     * Delta X Scale
     * @type Float
     * @private
     */
    deltaX: 0.0,

    /**
     * Delta Y Scale
     * @type Float
     * @private
     */
    deltaY: 0.0,

    startWithTarget: function (target) {
        ScaleTo.superclass.startWithTarget.call(this, target)

        this.startScaleX = this.target.scaleX
        this.startScaleY = this.target.scaleY
        this.deltaX = this.endScaleX - this.startScaleX
        this.deltaY = this.endScaleY - this.startScaleY
    },

    update: function (t) {
        if (!this.target) {
            return
        }

        this.target.scaleX = this.startScaleX + this.deltaX * t
        this.target.scaleY = this.startScaleY + this.deltaY * t
    },

    copy: function () {
        return new ScaleTo({duration: this.duration,
                                 scaleX: this.endScaleX,
                                 scaleY: this.endScaleY})
    }
})

/**
 * @class
 * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ScaleTo
 *
 * @opt {Float} duration Number of seconds to run action for
 * @opt {Float} [scale] Size to scale Node by
 * @opt {Float} [scaleX] Size to scale width of Node by
 * @opt {Float} [scaleY] Size to scale height of Node by
 */
function ScaleBy (opts) {
    ScaleBy.superclass.constructor.call(this, opts)
}

ScaleBy.inherit(ScaleTo, /** @lends cocos.actions.ScaleBy# */ {
    startWithTarget: function (target) {
        ScaleBy.superclass.startWithTarget.call(this, target)

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY
    },

    copy: function () {
        return new ScaleBy({ duration: this.duration,
                                 scaleX: this.endScaleX,
                                 scaleY: this.endScaleY})
    },

    reverse: function () {
        return new ScaleBy({duration: this.duration, scaleX: 1 / this.endScaleX, scaleY: 1 / this.endScaleY})
    }
})


/**
 * @class
 * Rotates a cocos.Node object to a certain angle by modifying its rotation
 * attribute. The direction will be decided by the shortest angle.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {Float} duration Number of seconds to run action for
 * @opt {Float} angle Angle in degrees to rotate to
 */
function RotateTo (opts) {
    RotateTo.superclass.constructor.call(this, opts)

    this.dstAngle = opts.angle
}

RotateTo.inherit(ActionInterval, /** @lends cocos.actions.RotateTo# */ {
    /**
     * Final angle
     * @type Float
     */
    dstAngle: 0,

    /**
     * Initial angle
     * @type Float
     */
    startAngle: 0,

    /**
     * Angle delta
     * @type Float
     */
    diffAngle: 0,

    startWithTarget: function (target) {
        RotateTo.superclass.startWithTarget.call(this, target)

        this.startAngle = target.rotation

        if (this.startAngle > 0) {
            this.startAngle = (this.startAngle % 360)
        } else {
            this.startAngle = (this.startAngle % -360)
        }

        this.diffAngle = this.dstAngle - this.startAngle
        if (this.diffAngle > 180) {
            this.diffAngle -= 360
        } else if (this.diffAngle < -180) {
            this.diffAngle += 360
        }
    },

    update: function (t) {
        this.target.rotation = this.startAngle + this.diffAngle * t
    },

    copy: function () {
        return new RotateTo({duration: this.duration, angle: this.dstAngle})
    }
})

/**
 * @class
 * Rotates a cocos.Node object to a certain angle by modifying its rotation
 * attribute. The direction will be decided by the shortest angle.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.RotateTo
 *
 * @opt {Float} duration Number of seconds to run action for
 * @opt {Float} angle Angle in degrees to rotate by
 */
function RotateBy (opts) {
    RotateBy.superclass.constructor.call(this, opts)

    this.angle = opts.angle
}

RotateBy.inherit(RotateTo, /** @lends cocos.actions.RotateBy# */ {
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    startWithTarget: function (target) {
        RotateBy.superclass.startWithTarget.call(this, target)

        this.startAngle = this.target.rotation
    },

    update: function (t) {
        this.target.rotation = this.startAngle + this.angle * t
    },

    copy: function () {
        return new RotateBy({duration: this.duration, angle: this.angle})
    },

    reverse: function () {
        return new RotateBy({duration: this.duration, angle: -this.angle})
    }
})

/**
 * @class
 * Animates moving a cocos.nodes.Node object to a another point.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {Float} duration Number of seconds to run action for
 * @opt {geometry.Point} position Destination position
 */
function MoveTo (opts) {
    MoveTo.superclass.constructor.call(this, opts)

    this.endPosition = util.copy(opts.position)
}

MoveTo.inherit(ActionInterval, /** @lends cocos.actions.MoveTo# */ {
    delta: null,
    startPosition: null,
    endPosition: null,

    startWithTarget: function (target) {
        MoveTo.superclass.startWithTarget.call(this, target)

        this.startPosition = util.copy(target.position)
        this.delta = geo.ccpSub(this.endPosition, this.startPosition)
    },

    update: function (t) {
        var startPosition = this.startPosition,
            delta = this.delta
        this.target.position = ccp(startPosition.x + delta.x * t, startPosition.y + delta.y * t)
    },

    copy: function() {
        return new MoveTo({duration: this.duration, position: this.endPosition})
    }
})

/**
 * @class
 * Animates moving a cocos.node.Node object by a given number of pixels
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.MoveTo
 *
 * @opt {Float} duration Number of seconds to run action for
 * @opt {geometry.Point} position Number of pixels to move by
 */
function MoveBy (opts) {
    MoveBy.superclass.constructor.call(this, opts)

    this.delta = util.copy(opts.position)
}

MoveBy.inherit(MoveTo, /** @lends cocos.actions.MoveBy# */ {
    startWithTarget: function (target) {
        var dTmp = this.delta
        MoveBy.superclass.startWithTarget.call(this, target)
        this.delta = dTmp
    },

    copy: function() {
         return new MoveBy({duration: this.duration, position: this.delta})
    },

    reverse: function() {
        var delta = this.delta
        return new MoveBy({duration: this.duration, position: geo.ccp(-delta.x, -delta.y)})
    }
})

/**
 * @class
 * Moves a cocos.nodes.Node simulating a parabolic jump movement by modifying its position attribute.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {Float} duration Number of seconds to run action for
 * @opt {geometry.Point} startPosition Point at which jump starts
 * @opt {geometry.Point} delta Number of pixels to jump by
 * @opt {Float} height Height of jump
 * @opt {Integer} jumps Number of times to repeat
 */
function JumpBy (opts) {
    JumpBy.superclass.constructor.call(this, opts)

    this.delta  = util.copy(opts.delta)
    this.height = opts.height
    this.jumps  = opts.jumps
}

JumpBy.inherit(ActionInterval, /** @lends cocos.actions.JumpBy# */ {
    /**
     * Number of pixels to jump by
     * @type geometry.Point
     */
    delta: null,

    /**
     * Height of jump
     * @type Float
     */
    height: 0,

    /**
     * Number of times to jump
     * @type Integer
     */
    jumps: 0,

    /**
     * Starting point
     * @type geometry.Point
     */
    startPosition: null,

    copy: function() {
        return new JumpBy({duration: this.duration,
                                 delta: this.delta,
                                height: this.height,
                                 jumps: this.jumps})
    },

    startWithTarget: function(target) {
        JumpBy.superclass.startWithTarget.call(this, target)
        this.startPosition = target.position
    },

    update: function(t) {
        // parabolic jump
        var frac = (t * this.jumps) % 1.0
        var y = this.height * 4 * frac * (1 - frac)
        y += this.delta.y * t
        var x = this.delta.x * t
        this.target.position = geo.ccp(this.startPosition.x + x, this.startPosition.y + y)
    },

    reverse: function() {
        return new JumpBy({duration: this.duration,
                                 delta: geo.ccp(-this.delta.x, -this.delta.y),
                                height: this.height,
                                 jumps: this.jumps})
    }
})

/**
 * @class
 * Moves a Node to a parabolic position simulating a jump movement by modifying its position attribute.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.JumpBy
 */
function JumpTo (opts) {
    JumpTo.superclass.constructor.call(this, opts)
}

JumpTo.inherit(JumpBy, /** @lends cocos.actions.JumpTo# */ {
    startWithTarget: function(target) {
        JumpTo.superclass.startWithTarget.call(this, target)
        this.delta = geo.ccp(this.delta.x - this.startPosition.x, this.delta.y - this.startPosition.y)
    }
})

/**
 * @class
 * An action that moves the target with a cubic Bezier curve by a certain distance.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {geometry.BezierConfig} bezier Bezier control points object
 * @opt {Float} duration
 */
function BezierBy (opts) {
    BezierBy.superclass.constructor.call(this, opts)

    this.config = util.copy(opts.bezier)
}

BezierBy.inherit(ActionInterval, /** @lends cocos.actions.BezierBy# */ {
    /**
     * @type {geometry.BezierConfig}
     */
    config: null,

    startPosition: null,

    startWithTarget: function(target) {
        BezierBy.superclass.startWithTarget.call(this, target)
        this.startPosition = this.target.position
    },

    update: function(t) {
        var c = this.config
        var xa = 0,
            xb = c.controlPoint1.x,
            xc = c.controlPoint2.x,
            xd = c.endPosition.x,
            ya = 0,
            yb = c.controlPoint1.y,
            yc = c.controlPoint2.y,
            yd = c.endPosition.y

        var x = bezierat(xa, xb, xc, xd, t)
        var y = bezierat(ya, yb, yc, yd, t)

        this.target.position = geo.ccpAdd(this.startPosition, geo.ccp(x, y))
    },

    copy: function() {
        return new BezierBy({bezier: this.config, duration: this.duration})
    },

    reverse: function() {
        var c = this.config,
            bc = new geo.BezierConfig()

        bc.endPosition = geo.ccpNeg(c.endPosition)
        bc.controlPoint1 = geo.ccpAdd(c.controlPoint2, geo.ccpNeg(c.endPosition))
        bc.controlPoint2 = geo.ccpAdd(c.controlPoint1, geo.ccpNeg(c.endPosition))

        return new BezierBy({bezier: bc, duration: this.duration})
    }
})

/**
 * @class
 * An action that moves the target with a cubic Bezier curve to a destination point.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.BezierBy
 */
function BezierTo (opts) {
    BezierTo.superclass.constructor.call(this, opts)
}

BezierTo.inherit(BezierBy, /** @lends cocos.actions.BezierTo# */ {
    startWithTarget: function(target) {
        BezierTo.superclass.startWithTarget.call(this, target)

        var c = this.config
        c.controlPoint1 = geo.ccpSub(c.controlPoint1, this.startPosition)
        c.controlPoint2 = geo.ccpSub(c.controlPoint2, this.startPosition)
        c.endPosition = geo.ccpSub(c.endPosition, this.startPosition)
    }
})

/**
 * @class
 * Blinks a Node object by modifying it's visible attribute
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {Integer} blinks Number of times to blink
 * @opt {Float} duration
 */
function Blink (opts) {
    Blink.superclass.constructor.call(this, opts)
    this.times = opts.blinks
}

Blink.inherit(ActionInterval, /** @lends cocos.actions.Blink# */ {
    /**
     * @type {Integer}
     */
    times: 1,

    update: function(t) {
        if (!this.isDone) {
            var slice = 1 / this.times
            var m = t % slice
            this.target.visible = (m > slice/2)
        }
    },

    copy: function() {
        return new Blink({duration: this.duration, blinks: this.times})
    },

    reverse: function() {
        return this.copy()
    }
})

/**
 * @class
 * Fades out a cocos.nodes.Node to zero opacity
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 */
function FadeOut (opts) {
    FadeOut.superclass.constructor.call(this, opts)
}

FadeOut.inherit(ActionInterval, /** @lends cocos.actions.FadeOut# */ {
    update: function (t) {
        var target = this.target
        if (!target) return
        target.opacity = 255 - (255 * t)
    },

    copy: function () {
        return new FadeOut({duration: this.duration})
    },

    reverse: function () {
        return new exports.FadeIn({duration: this.duration})
    }
})


/**
 * @class
 * Fades in a cocos.nodes.Node to 100% opacity
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 */
function FadeIn (opts) {
    FadeIn.superclass.constructor.call(this, opts)
}

FadeIn.inherit(ActionInterval, /** @lends cocos.actions.FadeIn# */ {
    update: function (t) {
        var target = this.target
        if (!target) return
        target.opacity = t * 255
    },

    copy: function () {
        return new FadeIn({duration: this.duration})
    },

    reverse: function () {
        return new exports.FadeOut({duration: this.duration})
    }
})

/**
 * @class
 * Fades a cocos.nodes.Node to a given opacity
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 */
function FadeTo (opts) {
    FadeTo.superclass.constructor.call(this, opts)
    this.toOpacity = opts.toOpacity
}

FadeTo.inherit(ActionInterval, /** @lends cocos.actions.FadeTo# */ {
    /**
     * The final opacity
     * @type Float
     */
    toOpacity: null,

    /**
     * The initial opacity
     * @type Float
     */
    fromOpacity: null,

    startWithTarget: function (target) {
        FadeTo.superclass.startWithTarget.call(this, target)
        this.fromOpacity = this.target.opacity
    },

    update: function (t) {
        var target = this.target
        if (!target) return

        target.opacity = this.fromOpacity + ( this.toOpacity - this.fromOpacity ) * t
    },

    copy: function() {
        return new FadeTo({duration: this.duration, toOpacity: this.toOpacity})
    }
})

/**
 * @class
 * Runs a pair of actions sequentially, one after another
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {cocos.actions.FiniteTimeAction} one 1st action to run
 * @opt {cocos.actions.FiniteTimeAction} two 2nd action to run
 */
function Sequence (opts) {
    if (opts.actions) {
        return initWithActions(Object.getPrototypeOf(this).constructor, opts.actions)
    }

    if (!opts.one) {
        throw "Sequence argument one must be non-nil"
    }
    if (!opts.two) {
        throw "Sequence argument two must be non-nil"
    }
    this.actions = []

    var d = opts.one.duration + opts.two.duration

    Sequence.superclass.constructor.call(this, {duration: d})

    this.actions[0] = opts.one
    this.actions[1] = opts.two
}

Sequence.inherit(ActionInterval, /** @lends cocos.actions.Sequence# */ {
    /**
     * Array of actions to run
     * @type cocos.nodes.Node[]
     */
    actions: null,

    split: 0,
    last: 0,

    startWithTarget: function (target) {
        Sequence.superclass.startWithTarget.call(this, target)
        this.split = this.actions[0].duration / this.duration
        this.last = -1
    },

    stop: function () {
        this.actions[0].stop()
        this.actions[1].stop()
        Sequence.superclass.stop.call(this)
    },

    update: function (t) {
        // This is confusing but will hopefully work better in conjunction
        // with modifer actions like Repeat & Spawn...
        var found = 0
        var new_t = 0

        if (t >= this.split) {
            found = 1
            if (this.split == 1) {
                new_t = 1
            } else {
                new_t = (t - this.split) / (1 - this.split)
            }
        } else {
            found = 0
            if (this.split != 0) {
                new_t = t / this.split
            } else {
                new_t = 1
            }
        }
        if (this.last == -1 && found == 1) {
            this.actions[0].startWithTarget(this.target)
            this.actions[0].update(1)
            this.actions[0].stop()
        }
        if (this.last != found) {
            if (this.last != -1) {
                this.actions[this.last].update(1)
                this.actions[this.last].stop()
            }
            this.actions[found].startWithTarget(this.target)
        }
        this.actions[found].update(new_t)
        this.last = found
    },

    copy: function () {
        // Constructor will copy actions
        return new Sequence({actions: this.actions})
    },

    reverse: function() {
        return new Sequence({actions: [this.actions[1].reverse(), this.actions[0].reverse()]})
    }
})

/**
 * @class
 * Repeats an action a number of times.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {cocos.actions.ActionInterval} action Action to repeat
 * @opt {Integer} times Number of times to repeat
 */
function Repeat (opts) {
    var d = opts.action.duration * opts.times

    Repeat.superclass.constructor.call(this, {duration: d})

    this.times = opts.times
    this.other = opts.action.copy()
    this.total = 0
}

Repeat.inherit(ActionInterval, /** @lends cocos.actions.Repeat# */ {
    times: 1,
    total: 0,
    other: null,

    startWithTarget: function(target) {
        this.total = 0
        Repeat.superclass.startWithTarget.call(this, target)
        this.other.startWithTarget(target)
    },

    stop: function() {
        this.other.stop()
        Repeat.superclass.stop.call(this)
    },

    update: function(dt) {
        var t = dt * this.times

        if (t > (this.total+1)) {
            this.other.update(1)
            this.total += 1
            this.other.stop()
            this.other.startWithTarget(this.target)

            // If repeat is over
            if (this.total == this.times) {
                // set it in the original position
                this.other.update(0)
            } else {
                // otherwise start next repeat
                this.other.update(t - this.total)
            }
        } else {
            var r = t % 1.0

            // fix last repeat position otherwise it could be 0
            if (dt == 1) {
                r = 1
                this.total += 1
            }
            this.other.update(Math.min(r, 1))
        }
    },

    get isDone() {
        return this.total == this.times
    },

    copy: function() {
        // Constructor copies action
        return new Repeat({action: this.other, times: this.times})
    },

    reverse: function() {
        return new Repeat({action: this.other.reverse(), times: this.times})
    }
})

/**
 * @class
 * Executes multiple actions simultaneously
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {cocos.actions.FiniteTimeAction} one: first action to spawn
 * @opt {cocos.actions.FiniteTimeAction} two: second action to spawn
 */
function Spawn (opts) {
    if (opts.actions) {
        return initWithActions(Object.getPrototypeOf(this).constructor, opts.actions)
    }

    var action1 = opts.one,
        action2 = opts.two

    if (!action1 || !action2) {
        throw "cocos.actions.Spawn: required actions missing"
    }
    var d1 = action1.duration,
        d2 = action2.duration

    Spawn.superclass.constructor.call(this, {duration: Math.max(d1, d2)})

    this.one = action1
    this.two = action2

    if (d1 > d2) {
        this.set('two', new Sequence({actions: [
            action2,
            new DelayTime({duration: d1-d2})
        ]}))
    } else if (d1 < d2) {
        this.set('one', new Sequence({actions: [
            action1,
            new DelayTime({duration: d2-d1})
        ]}))
    }
}

Spawn.inherit(ActionInterval, /** @lends cocos.actions.Spawn# */ {
    one: null,
    two: null,

    startWithTarget: function (target) {
        Spawn.superclass.startWithTarget.call(this, target)
        this.one.startWithTarget(this.target)
        this.two.startWithTarget(this.target)
    },

    stop: function () {
        this.one.stop()
        this.two.stop()
        Spawn.superclass.stop.call(this)
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false
            this.elapsed = 0
        } else {
            this.elapsed += dt
        }
        this.one.step(dt)
        this.two.step(dt)
    },

    update: function (t) {
        this.one.update(t)
        this.two.update(t)
    },

    copy: function () {
        return new Spawn({one: this.one.copy(), two: this.two.copy()})
    },

    reverse: function () {
        return new Spawn({one: this.one.reverse(), two: this.two.reverse()})
    }
})

/**
 * @class
 * Animates a sprite given the name of an Animation
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {Float} duration Number of seconds to run action for
 * @opt {cocos.Animation} animation Animation to run
 * @opt {Boolean} [restoreOriginalFrame=true] Return to first frame when finished
 */
function Animate (opts) {
    this.animation = opts.animation
    this.restoreOriginalFrame = opts.restoreOriginalFrame !== false
    opts.duration = this.animation.frames.length * this.animation.delay

    Animate.superclass.constructor.call(this, opts)
}

Animate.inherit(ActionInterval, /** @lends cocos.actions.Animate# */ {
    animation: null,
    restoreOriginalFrame: true,
    origFrame: null,

    startWithTarget: function (target) {
        Animate.superclass.startWithTarget.call(this, target)

        if (this.restoreOriginalFrame) {
            this.origFrame = this.target.displayedFrame
        }
    },

    stop: function () {
        if (this.target && this.restoreOriginalFrame) {
            var sprite = this.target
            sprite.displayFrame = this.origFrame
        }

        Animate.superclass.stop.call(this)
    },

    update: function (t) {
        var frames = this.animation.frames,
            numberOfFrames = frames.length,
            idx = Math.floor(t * numberOfFrames)

        if (idx >= numberOfFrames) {
            idx = numberOfFrames - 1
        }

        var sprite = this.target
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.displayFrame = frames[idx]
        }
    },

    copy: function () {
        return new Animate({animation: this.animation, restoreOriginalFrame: this.restoreOriginalFrame})
    }

})

exports.ActionInterval = ActionInterval
exports.DelayTime = DelayTime
exports.ScaleTo = ScaleTo
exports.ScaleBy = ScaleBy
exports.RotateTo = RotateTo
exports.RotateBy = RotateBy
exports.MoveTo = MoveTo
exports.MoveBy = MoveBy
exports.JumpBy = JumpBy
exports.JumpTo = JumpTo
exports.BezierBy = BezierBy
exports.BezierTo = BezierTo
exports.Blink = Blink
exports.FadeIn = FadeIn
exports.FadeOut = FadeOut
exports.FadeTo = FadeTo
exports.Spawn = Spawn
exports.Sequence = Sequence
exports.Repeat = Repeat
exports.Animate = Animate

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
