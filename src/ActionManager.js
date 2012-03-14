'use strict'

var util = require('util'),
    Timer = require('./Scheduler').Timer,
    Scheduler = require('./Scheduler').Scheduler


/**
 * @class
 * A singleton that manages all the actions. Normally you
 * won't need to use this singleton directly. 99% of the cases you will use the
 * cocos.nodes.Node interface, which uses this singleton. But there are some cases where
 * you might need to use this singleton. Examples:
 *
 * * When you want to run an action where the target is different from a cocos.nodes.Node
 * * When you want to pause / resume the actions
 *
 * @memberOf cocos
 * @singleton
 */
function ActionManager () {
    ActionManager.superclass.constructor.call(this)

    Scheduler.sharedScheduler.scheduleUpdate({target: this, priority: 0, paused: false})
    this.targets = []
}

ActionManager.inherit(Object, /** @lends cocos.ActionManager# */ {
    targets: null,
    currentTarget: null,
    currentTargetSalvaged: null,

    /**
     * Adds an action with a target. If the target is already present, then the
     * action will be added to the existing target. If the target is not
     * present, a new instance of this target will be created either paused or
     * paused, and the action will be added to the newly created target. When
     * the target is paused, the queued actions won't be 'ticked'.
     *
     * @opt {cocos.nodes.Node} target Node to run the action on
     */
    addAction: function (opts) {

        var targetID = opts.target.id
        var element = this.targets[targetID]

        if (!element) {
            element = this.targets[targetID] = {
                paused: false,
                target: opts.target,
                actions: []
            }
        }

        element.actions.push(opts.action)

        opts.action.startWithTarget(opts.target)
    },

    /**
     * Remove an action
     *
     * @param {cocos.actions.Action} action Action to remove
     */
    removeAction: function (action) {
        var targetID = action.originalTarget.id,
            element = this.targets[targetID]

        if (!element) {
            return
        }

        var actionIndex = element.actions.indexOf(action)

        if (actionIndex == -1) {
            return
        }

        if (this.currentTarget == element) {
            element.currentActionSalvaged = true
        }

        element.actions[actionIndex] = null
        element.actions.splice(actionIndex, 1); // Delete array item

        if (element.actions.length === 0) {
            if (this.currentTarget == element) {
                this.currentTargetSalvaged = true
            }
        }

    },

    /**
     * Fetch an action belonging to a cocos.nodes.Node
     *
     * @returns {cocos.actions.Action}
     *
     * @opts {cocos.nodes.Node} target Target of the action
     * @opts {String} tag Tag of the action
     */
    getActionFromTarget: function(opts) {
        var tag = opts.tag,
            targetID = opts.target.id

        var element = this.targets[targetID]
        if (!element) {
            return null
        }
        for (var i = 0; i < element.actions.length; i++ ) {
            if (element.actions[i] &&
                (element.actions[i].tag === tag)) {
                return element.actions[i]
            }
        }
        // Not found
        return null
    },

    /**
     * Remove all actions for a cocos.nodes.Node
     *
     * @param {cocos.nodes.Node} target Node to remove all actions for
     */
    removeAllActionsFromTarget: function (target) {
        var targetID = target.id

        var element = this.targets[targetID]
        if (!element) {
            return
        }

        delete this.targets[targetID]
        // Delete everything in array but don't replace it incase something else has a reference
        element.actions.splice(0, element.actions.length)
    },

    /**
     * @private
     */
    update: function (dt) {
        var self = this
        util.each(this.targets, function (currentTarget, i) {

            if (!currentTarget) {
                return
            }
            self.currentTarget = currentTarget

            if (!currentTarget.paused) {
                util.each(currentTarget.actions, function (currentAction, j) {
                    if (!currentAction) {
                        return
                    }

                    currentTarget.currentAction = currentAction
                    currentTarget.currentActionSalvaged = false

                    currentTarget.currentAction.step(dt)

                    if (currentTarget.currentAction.isDone) {
                        currentTarget.currentAction.stop()

                        var a = currentTarget.currentAction
                        currentTarget.currentAction = null
                        self.removeAction(a)
                    }

                    currentTarget.currentAction = null

                })
            }

            if (self.currentTargetSalvaged && currentTarget.actions.length === 0) {
                self.targets[i] = null
                delete self.targets[i]
            }
        })
    },

    pauseTarget: function (target) {
    },

    resumeTarget: function (target) {
        // TODO
    }
})

Object.defineProperty(ActionManager, 'sharedManager', {
    /**
     * A shared singleton instance of cocos.ActionManager
     *
     * @memberOf cocos.ActionManager
     * @getter {cocos.ActionManager} sharedManager
     */
    get: function () {
        if (!ActionManager._instance) {
            ActionManager._instance = new this()
        }

        return ActionManager._instance
    }

  , enumerable: true
})

exports.ActionManager = ActionManager

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
