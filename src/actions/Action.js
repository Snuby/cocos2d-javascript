'use strict'

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp

/**
 * @class
 * Base class for Actions
 *
 * @memberOf cocos.actions
 */
function Action () {
}

Action.inherit(Object, /** @lends cocos.actions.Action# */ {
    /**
     * The Node the action is being performed on
     * @type cocos.nodes.Node
     */
    target: null,
    originalTarget: null,

    /**
     * Unique tag to identify the action
     * @type *
     */
    tag: null,

    /**
     * Called every frame with it's delta time.
     *
     * @param {Float} dt The delta time
     */
    step: function (dt) {
        console.warn("Action.step() Override me")
    },

    /**
     * Called once per frame.
     *
     * @param {Float} time How much of the animation has played. 0.0 = just started, 1.0 just finished.
     */
    update: function (time) {
        console.warn("Action.update() Override me")
    },

    /**
     * Called before the action start. It will also set the target.
     *
     * @param {cocos.nodes.Node} target The Node to run the action on
     */
    startWithTarget: function (target) {
        this.target = this.originalTarget = target
    },

    /**
     * Called after the action has finished. It will set the 'target' to nil.
     * <strong>Important</strong>: You should never call cocos.actions.Action#stop manually.
     * Instead, use cocos.nodes.Node#stopAction(action)
     */
    stop: function () {
        this.target = null
    },

    /**
     * @getter isDone
     * @type {Boolean}
     */
    get isDone (key) {
        return true
    },


    /**
     * Returns a copy of this Action but in reverse
     *
     * @returns {cocos.actions.Action} A new Action in reverse
     */
    reverse: function () {
    }
})

/**
 * @class
 * Repeats an action forever. To repeat the an action for a limited number of
 * times use the cocos.actions.Repeat action.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.Action
 *
 * @param {cocos.actions.Action} action An action to repeat forever
 */
function RepeatForever (action) {
    RepeatForever.superclass.constructor.call(this)

    this.other = action
}

RepeatForever.inherit(Action, /** @lends cocos.actions.RepeatForever# */ {
    other: null,

    startWithTarget: function (target) {
        RepeatForever.superclass.startWithTarget.call(this, target)

        this.other.startWithTarget(this.target)
    },

    step: function (dt) {
        this.other.step(dt)
        if (this.other.isDone) {
            var diff = dt - this.other.duration - this.other.elapsed
            this.other.startWithTarget(this.target)

            this.other.step(diff)
        }
    },

    get isDone () {
        return false
    },

    reverse: function () {
        return new RepeatForever(this.other.reverse())
    },

    copy: function () {
        return new RepeatForever(this.other.copy())
    }
})

/**
 * @class
 * Repeats an action a number of times. To repeat an action forever use the
 * cocos.RepeatForever action.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.Action
 */
function FiniteTimeAction () {
    FiniteTimeAction.superclass.constructor.call(this)
}

FiniteTimeAction.inherit(Action, /** @lends cocos.actions.FiniteTimeAction# */ {
    /**
     * Number of seconds to run the Action for
     * @type Float
     */
    duration: 2,

    /** @ignore */
    reverse: function () {
        console.log('FiniteTimeAction.reverse() Override me')
    }
})

/**
 * @class
 * Changes the speed of an action, making it take longer (speed>1)
 * or less (speed<1) time.
 * Useful to simulate 'slow motion' or 'fast forward' effect.
 * @warning This action can't be Sequenceable because it is not an IntervalAction
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.Action
 */
function Speed () {
    Speed.superclass.constructor.call(this, opts)

    this.other = opts.action
    this.speed = opts.speed
}

Speed.inherit(Action, /** @lends cocos.actions.Speed# */ {
    other: null,

    /**
     * speed of the inner function
     * @type Float
     */
    speed: 1.0,

    startWithTarget: function(target) {
        Speed.superclass.startWithTarget.call(this, target)
        this.other.startWithTarget(this.target)
    },

    setSpeed: function(speed) {
        this.speed = speed
    },

    stop: function() {
        this.other.stop()
        Speed.superclass.stop.call(this)
    },

    step: function(dt) {
        this.other.step(dt * this.speed)
    },

    get isDone() {
        return this.other.get_isDone()
    },

    copy: function() {
        return new Speed({action: this.other.copy(), speed: this.speed})
    },

    reverse: function() {
        return new Speed({action: this.other.reverse(), speed: this.speed})
    }
})

/**
 * @class
 * An action that "follows" a node.
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.Action
 *
 * @example layer.runAction(new cocos.actions.Follow({target: hero}))
 *
 * @opt {cocos.nodes.Node} target
 * @opt {geometry.Rect} worldBoundary
 */
function Follow (opts) {
    Follow.superclass.constructor.call(this, opts)

    this.followedNode = opts.target

    var s = require('../Director').Director.sharedDirector.winSize
    this.fullScreenSize = geo.ccp(s.width, s.height)
    this.halfScreenSize = geo.ccpMult(this.fullScreenSize, geo.ccp(0.5, 0.5))

    if (opts.worldBoundary !== undefined) {
        this.boundarySet = true
        this.leftBoundary = -((opts.worldBoundary.origin.x + opts.worldBoundary.size.width) - this.fullScreenSize.x)
        this.rightBoundary = -opts.worldBoundary.origin.x
        this.topBoundary = -opts.worldBoundary.origin.y
        this.bottomBoundary = -((opts.worldBoundary.origin.y+opts.worldBoundary.size.height) - this.fullScreenSize.y)

        if (this.rightBoundary < this.leftBoundary) {
            // screen width is larger than world's boundary width
            //set both in the middle of the world
            this.rightBoundary = this.leftBoundary = (this.leftBoundary + this.rightBoundary) / 2
        }

        if (this.topBoundary < this.bottomBoundary) {
            // screen width is larger than world's boundary width
            //set both in the middle of the world
            this.topBoundary = this.bottomBoundary = (this.topBoundary + this.bottomBoundary) / 2
        }

        if ((this.topBoundary == this.bottomBoundary) && (this.leftBoundary == this.rightBoundary)) {
            this.boundaryFullyCovered = true
        }
    }
}

Follow.inherit(Action, /** @lends cocos.actions.Follow# */ {
    /**
     * node to follow
     */
    followedNode: null,

    /**
     * whether camera should be limited to certain area
     * @type Boolean
     */
    boundarySet: false,

    /**
     * if screensize is bigger than the boundary - update not needed
     * @type Boolean
     */
    boundaryFullyCovered: false,

    /**
     * fast access to the screen dimensions
     * @type geometry.Point
     */
    halfScreenSize: null,
    fullScreenSize: null,

    /**
     * world boundaries
     * @type Float
     */
    leftBoundary: 0,
    rightBoundary: 0,
    topBoundary: 0,
    bottomBoundary: 0,

    step: function (dt) {
        if (this.boundarySet) {
            // whole map fits inside a single screen, no need to modify the position - unless map boundaries are increased
            if (this.boundaryFullyCovered) {
                return
            }
            var tempPos = geo.ccpSub(this.halfScreenSize, this.followedNode.position)
            this.target.set('position', ccp(
                Math.min(Math.max(tempPos.x, this.leftBoundary), this.rightBoundary),
                Math.min(Math.max(tempPos.y, this.bottomBoundary), this.topBoundary))
            )
        } else {
            this.target.position = geo.ccpSub(this.halfScreenSize, this.followedNode.position)
        }
    },

    get isDone() {
        return !this.followedNode.isRunning
    }
})


exports.Action = Action
exports.RepeatForever = RepeatForever
exports.FiniteTimeAction = FiniteTimeAction
exports.Speed = Speed
exports.Follow = Follow

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
