'use strict'

var util = require('util'),
    Plist = require('Plist').Plist

/**
 * @class
 *
 * @memberOf cocos
 * @singleton
 */
function AnimationCache () {
    AnimationCache.superclass.constructor.call(this)

    this.animations = {}
}

AnimationCache.inherit(Object, /** @lends cocos.AnimationCache# */ {
    /**
     * Cached animations
     * @type Object
     */
    animations: null,

    /**
     * Add an animation to the cache
     *
     * @opt {String} name Unique name of the animation
     * @opt {cocos.Animcation} animation Animation to cache
     */
    addAnimation: function (opts) {
        var name = opts.name,
            animation = opts.animation

        this.animations[name] = animation
    },

    /**
     * Remove an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     */
    removeAnimation: function (opts) {
        var name = opts.name

        delete this.animations[name]
    },

    /**
     * Get an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     * @returns {cocos.Animation} Cached animation
     */
    getAnimation: function (opts) {
        var name = opts.name

        return this.animations[name]
    }
})

Object.defineProperty(AnimationCache, 'sharedAnimationCache', {
    /**
     * A shared singleton instance of cocos.AnimationCache
     *
     * @memberOf cocos.AnimationCache
     * @getter {cocos.AnimationCache} sharedAnimationCache
     */
    get: function () {
        if (!AnimationCache._instance) {
            AnimationCache._instance = new this()
        }

        return AnimationCache._instance
    }

  , enumerable: true
})

exports.AnimationCache = AnimationCache

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
