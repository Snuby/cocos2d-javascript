'use strict'

var util = require('util')

/**
 * @class
 * A cocos.Animation object is used to perform animations on the Sprite objects.
 *
 * The Animation object contains cocos.SpriteFrame objects, and a possible delay between the frames.
 * You can animate a cocos.Animation object by using the cocos.actions.Animate action.
 *
 * @memberOf cocos
 *
 * @opt {cocos.SpriteFrame[]} frames Frames to animate
 * @opt {Float} [delay=0.0] Delay between each frame
 *
 * @example
 * var animation = new cocos.Animation({frames: [f1, f2, f3], delay: 0.1})
 * sprite.runAction(new cocos.actions.Animate({animation: animation}))
 */
function Animation (opts) {
    Animation.superclass.constructor.call(this, opts)

    this.frames = opts.frames || []
    this.delay  = opts.delay  || 0.0
}

Animation.inherit(Object, /** @lends cocos.Animation# */ {
    /**
     * Unique name for the animation
     * @type String
     */
    name: null

    /**
     * Delay between each frame
     * @type Float
     */
  , delay: 0.0

    /**
     * Array of frames to animate
     * @type cocos.SpriteFrame[]
     */
  , frames: null
})

exports.Animation = Animation

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
