'use strict'

var geo             = require('geometry'),
    util            = require('util'),
    actions         = require('../actions')

var Scene           = require('./Scene').Scene,
    Director        = require('../Director').Director,
    EventDispatcher = require('../EventDispatcher').EventDispatcher,
    Scheduler       = require('../Scheduler').Scheduler

/** @ignore
 * Orientation Type used by some transitions
 */
var tOrientation = {
    kOrientationLeftOver: 0,
    kOrientationRightOver: 1,
    kOrientationUpOver: 0,
    kOrientationDownOver: 1
}

/**
 * @class
 * Base class for Transition scenes
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Scene
 *
 * @opt {Float} duration How long the transition should last
 * @opt {cocos.nodes.Scene} scene Income scene
 */
function TransitionScene (opts) {
    TransitionScene.superclass.constructor.call(this, opts)

    this.duration = opts.duration
    if (!opts.scene) {
        throw "TransitionScene requires scene property"
    }
    this.inScene = opts.scene
    this.outScene = Director.sharedDirector._runningScene

    if (this.inScene == this.outScene) {
        throw "Incoming scene must be different from the outgoing scene"
    }
    EventDispatcher.sharedDispatcher.dispatchEvents = false
    this.sceneOrder()
}

TransitionScene.inherit(Scene, /** @lends cocos.nodes.TransitionScene# */ {
    /**
     * Incoming scene
     * @type {cocos.nodes.Scene}
     */
    inScene: null,

    /**
     * Outgoing (current) scene
     * @type {cocos.nodes.Scene}
     */
    outScene: null,

    /**
     * transition duration
     * @type Float
     */
    duration: null,

    inSceneOnTop: null,
    sendCleanupToScene: null,

    /**
     * Called after the transition finishes
     */
    finish: function () {
        var is = this.inScene,
            os = this.outScene

        /* clean up */
        is.visible = true
        is.position = geo.PointZero()
        is.scale = 1.0
        is.rotation = 0

        os.visible = false
        os.position = geo.PointZero()
        os.scale = 1.0
        os.rotation = 0

        Scheduler.sharedScheduler.schedule({
            target: this,
            method: this.setNewScene,
            interval: 0
        })
    },

    /**
     * Used by some transitions to hide the outer scene
     */
    hideOutShowIn: function () {
        this.inScene.visible = true
        this.outScene.visible = false
    },

    setNewScene: function (dt) {
        var dir = Director.sharedDirector

        this.unscheduleSelector(this.setNewScene)
        // Save 'send cleanup to scene'
        // Not sure if it's cool to be accessing all these Director privates like this...
        this.sendCleanupToScene = dir._sendCleanupToScene

        dir.replaceScene(this.inScene)

        // enable events while transitions
        EventDispatcher.sharedDispatcher.dispatchEvents = true

        // issue #267
        this.outScene.visible = true
    },

    sceneOrder: function () {
        this.inSceneOnTop = true
    },

    draw: function (context, rect) {
        if (this.inSceneOnTop) {
            this.outScene.visit(context, rect)
            this.inScene.visit(context, rect)
        } else {
            this.inScene.visit(context, rect)
            this.outScene.visit(context, rect)
        }
    },

    onEnter: function () {
        TransitionScene.superclass.onEnter.call(this)
        this.inScene.onEnter()
        // outScene_ should not receive the onEnter callback
    },

    onExit: function () {
        TransitionScene.superclass.onExit.call(this)
        this.outScene.onExit()
        // inScene_ should not receive the onExit callback
        // only the onEnterTransitionDidFinish
        if (this.inScene.hasOwnProperty('onEnterTransitionDidFinish')) {
            this.inScene.onEnterTransitionDidFinish()
        }
    },

    cleanup: function () {
        TransitionScene.superclass.cleanup.call(this)

        if (this.sendCleanupToScene) {
            this.outScene.cleanup()
        }
    }
})

/**
 * @class
 * Rotate and zoom out the outgoing scene, and then rotate and zoom in the incoming
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionScene
 */
function TransitionRotoZoom (opts) {
    TransitionRotoZoom.superclass.constructor.call(this, opts)
}

TransitionRotoZoom.inherit(TransitionScene, /** @lends cocos.nodes.TransitionRotoZoom# */ {
    onEnter: function() {
        TransitionRotoZoom.superclass.onEnter.call(this)

        var dur = this.duration
        this.inScene.scale = 0.001
        this.outScene.scale = 1.0

        this.inScene.anchorPoint = geo.ccp(0.5, 0.5)
        this.outScene.anchorPoint = geo.ccp(0.5, 0.5)

        var outzoom = [
            new actions.Spawn({actions: [
                new actions.ScaleBy({scale: 0.001, duration: dur/2}),
                new actions.RotateBy({angle: 360*2, duration: dur/2})
                ]}),
            new actions.DelayTime({duration: dur/2})]

        // Can't nest sequences or reverse them very easily, so incoming scene actions must be put
        // together manually for now...
        var inzoom = [
            new actions.DelayTime({duration: dur/2}),

            new actions.Spawn({actions: [
                new actions.ScaleTo({scale: 1.0, duration: dur/2}),
                new actions.RotateBy({angle: -360*2, duration: dur/2})
                ]}),
            new actions.CallFunc({
                target: this,
                method: this.finish
            })
        ]

        // Sequence init() copies actions
        this.outScene.runAction(new actions.Sequence({actions: outzoom}))
        this.inScene.runAction(new actions.Sequence({actions: inzoom}))
    }
})

/**
 * @class
 * Move in from to the left the incoming scene.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionScene
 */
function TransitionMoveInL (opts) {
    TransitionMoveInL.superclass.constructor.call(this, opts)
}

TransitionMoveInL.inherit(TransitionScene, /** @lends cocos.nodes.TransitionMoveInL# */ {
    onEnter: function () {
        TransitionMoveInL.superclass.onEnter.call(this)

        this.initScenes()

        this.inScene.runAction(new actions.Sequence({actions: [
            this.action(),
            new actions.CallFunc({
                target: this,
                method: this.finish
            })]
        }))
    },

    action: function () {
        return new actions.MoveTo({
            position: geo.ccp(0, 0),
            duration: this.duration
        })
    },

    initScenes: function () {
        var s = Director.sharedDirector.winSize
        this.inScene.position = geo.ccp(-s.width, 0)
    }
})

/**
 * @class
 * Move in from to the right the incoming scene.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionMoveInL
 */
function TransitionMoveInR (opts) {
    TransitionMoveInR.superclass.constructor.call(this, opts)
}

TransitionMoveInR.inherit(TransitionMoveInL, /** @lends cocos.nodes.TransitionMoveInR# */ {
    initScenes: function () {
        var s = Director.sharedDirector.winSize
        this.inScene.position = geo.ccp(s.width, 0)
    }
})

/**
 * @class
 * Move the incoming scene in from the top.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionMoveInL
 */
function TransitionMoveInT (opts) {
    TransitionMoveInT.superclass.constructor.call(this, opts)
}

TransitionMoveInT.inherit(TransitionMoveInL, /** @lends cocos.nodes.TransitionMoveInT# */ {
    initScenes: function () {
        var s = Director.sharedDirector.winSize
        this.inScene.position = geo.ccp(0, s.height)
    }
})

/**
 * @class
 * Move the incoming scene in from the bottom.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionMoveInL
 */
function TransitionMoveInB (opts) {
    TransitionMoveInB.superclass.constructor.call(this, opts)
}

TransitionMoveInB.inherit(TransitionMoveInL, /** @lends cocos.nodes.TransitionMoveInB# */ {
    initScenes: function () {
        var s = Director.sharedDirector.winSize
        this.inScene.position = geo.ccp(0, -s.height)
    }
})

/**
 * @class
 * Slide in the incoming scene from the left.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionScene
 */
function TransitionSlideInL (opts) {
    TransitionSlideInL.superclass.constructor.call(this, opts)
}

TransitionSlideInL.inherit(TransitionScene, /** @lends cocos.nodes.TransitionSlideInL# */ {
    onEnter: function () {
        TransitionSlideInL.superclass.onEnter.call(this)

        this.initScenes()

        var movein = this.action()
        var moveout = this.action()
        var outAction = new actions.Sequence({
            actions: [
            moveout,
            new actions.CallFunc({
                target: this,
                method: this.finish
            })]
        })
        this.inScene.runAction(movein)
        this.outScene.runAction(outAction)
    },

    sceneOrder: function () {
        this.inSceneOnTop = false
    },

    initScenes: function () {
        var s = Director.sharedDirector.winSize
        this.inScene.position = geo.ccp(-s.width, 0)
    },

    action: function () {
        var s = Director.sharedDirector.winSize
        return new actions.MoveBy({
            position: geo.ccp(s.width, 0),
            duration: this.duration
        })
    }
})

/**
 * @class
 * Slide in the incoming scene from the right.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionSlideInL
 */
function TransitionSlideInR (opts) {
    TransitionSlideInR.superclass.constructor.call(this, opts)
}

TransitionSlideInR.inherit(TransitionSlideInL, /** @lends cocos.nodes.TransitionSlideInR# */ {
    sceneOrder: function () {
        this.inSceneOnTop = true
    },

    initScenes: function () {
        var s = Director.sharedDirector.winSize
        this.inScene.position = geo.ccp(s.width, 0)
    },

    action: function () {
        var s = Director.sharedDirector.winSize
        return new actions.MoveBy({
            position: geo.ccp(-s.width, 0),
            duration: this.duration
        })
    }
})

/**
 * @class
 * Slide in the incoming scene from the top.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionSlideInL
 */
function TransitionSlideInT (opts) {
    TransitionSlideInT.superclass.constructor.call(this, opts)
}

TransitionSlideInT.inherit(TransitionSlideInL, /** @lends cocos.nodes.TransitionSlideInT# */ {
    sceneOrder: function () {
        this.inSceneOnTop = false
    },

    initScenes: function () {
        var s = Director.sharedDirector.winSize
        this.inScene.position = geo.ccp(0, s.height)
    },

    action: function () {
        var s = Director.sharedDirector.winSize
        return new actions.MoveBy({
            position: geo.ccp(0, -s.height),
            duration: this.duration
        })
    }
})

/**
 * @class
 * Slide in the incoming scene from the bottom.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionSlideInL
 */
function TransitionSlideInB (opts) {
    TransitionSlideInB.superclass.constructor.call(this, opts)
}

TransitionSlideInB.inherit(TransitionSlideInL, /** @lends cocos.nodes.TransitionSlideInB# */ {
    sceneOrder: function () {
        this.inSceneOnTop = true
    },

    initScenes: function () {
        var s = Director.sharedDirector.winSize
        this.inScene.position = geo.ccp(0, -s.height)
    },

    action: function () {
        var s = Director.sharedDirector.winSize
        return new actions.MoveBy({
            position: geo.ccp(0, s.height),
            duration: this.duration
        })
    }
})

exports.TransitionScene = TransitionScene
exports.TransitionRotoZoom = TransitionRotoZoom
exports.TransitionMoveInL = TransitionMoveInL
exports.TransitionMoveInR = TransitionMoveInR
exports.TransitionMoveInT = TransitionMoveInT
exports.TransitionMoveInB = TransitionMoveInB
exports.TransitionSlideInL = TransitionSlideInL
exports.TransitionSlideInR = TransitionSlideInR
exports.TransitionSlideInT = TransitionSlideInT
exports.TransitionSlideInB = TransitionSlideInB

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
