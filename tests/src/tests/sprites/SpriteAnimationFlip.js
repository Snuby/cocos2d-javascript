'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions
  , ccp       = geo.ccp

var TestCase      = require('../TestCase')
  , Director      = cocos.Director
  , Texture2D     = cocos.Texture2D
  , SpriteFrame   = cocos.SpriteFrame
  , Animation     = cocos.Animation
  , Rect          = geo.Rect
  , Sprite        = nodes.Sprite
  , Sequence      = actions.Sequence
  , RepeatForever = actions.RepeatForever
  , Animate       = actions.Animate
  , FlipX         = actions.FlipX
//}}} Imports

/**
 * @class
 *
 * Example Sprite Animation and flip
 */
function SpriteAnimationFlip () {
    SpriteAnimationFlip.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    var texture = new Texture2D({ file: path.join(__dirname, '../resources/animations/dragon_animation.png') })

    var animFrames = [ new SpriteFrame({ texture: texture, rect: new Rect(132 * 0, 132 * 0, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 1, 132 * 0, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 2, 132 * 0, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 3, 132 * 0, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 0, 132 * 1, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 1, 132 * 1, 132, 132) })
                     ]

    var sprite = this.sprite = new Sprite({ frame: animFrames[0] })
    sprite.position = ccp(s.width / 2 - 80, s.height / 2)

    this.addChild(sprite)

    var animation = new Animation({ frames: animFrames, delay: 0.2 })
      , animate   = new Animate({ animation: animation, restoreOriginalFrame: false })
      , seq       = new Sequence({ actions: [ animate
                                            , new FlipX({flipX: true})
                                            , animate.copy()
                                            , new FlipX({flipX: false})
                                            ]
                                 })

    sprite.runAction(new RepeatForever(seq))

}

SpriteAnimationFlip.inherit(TestCase, /** @lends SpriteAnimationFlip# */ {
    title: 'Sprite Animation + Flip'
  , adjustPositions: function () {
        SpriteAnimationFlip.superclass.adjustPositions.call(this)
        var s = Director.sharedDirector.winSize
        this.sprite.position = ccp(s.width / 2 - 80, s.height / 2)
  }
})

module.exports = SpriteAnimationFlip

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
