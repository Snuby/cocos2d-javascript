'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , events    = require('events')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions
  , ccp       = geo.ccp

var TestCase         = require('../TestCase')
  , Director         = cocos.Director
  , Director         = cocos.Director
  , Animation        = cocos.Animation
  , AnimationCache   = cocos.AnimationCache
  , SpriteFrameCache = cocos.SpriteFrameCache
  , Sprite           = nodes.Sprite
  , Sequence         = actions.Sequence
  , Animate          = actions.Animate
//}}} Imports

/**
 * @class
 *
 * Example using AnimationCache and loading from a Zwoptex .plist file
 */
function SpriteAnimationCache () {
    SpriteAnimationCache.superclass.constructor.call(this)

    var frameCache = SpriteFrameCache.sharedSpriteFrameCache
      , animCache  = AnimationCache.sharedAnimationCache

    frameCache.addSpriteFrames({ file: path.join(__dirname, '../resources/animations/grossini.plist') })
    frameCache.addSpriteFrames({ file: path.join(__dirname, '../resources/animations/grossini_gray.plist') })
    frameCache.addSpriteFrames({ file: path.join(__dirname, '../resources/animations/grossini_blue.plist') })


    // create 'dance' animation
    var animFrames = []
      , frame
      , i
    for (i = 1; i < 15; i++) {
        frame = frameCache.getSpriteFrame({ name: 'grossini_dance_' + (i >= 10 ? i : '0' + i) + '.png' })
        animFrames.push(frame)
    }

    var animation = new Animation({ frames: animFrames
                                  , delay: 0.2
                                  })

    // Add an animation to the Cache
    animCache.addAnimation({ animation: animation
                           , name: 'dance'
                           })


    // create animation 'dance gray'
    animFrames = []
    for (i = 1; i < 15; i++) {
        frame = frameCache.getSpriteFrame({ name: 'grossini_dance_gray_' + (i >= 10 ? i : '0' + i) + '.png' })
        animFrames.push(frame)
    }

    animation = new Animation({ frames: animFrames
                              , delay: 0.2
                              })

    // Add an animation to the Cache
    animCache.addAnimation({ animation: animation
                           , name: 'dance_gray'
                           })


    // create animation 'dance blue'
    animFrames = []
    for (i = 1; i < 4; i++) {
        frame = frameCache.getSpriteFrame({ name: 'grossini_blue_0' + i + '.png' })
        animFrames.push(frame)
    }

    animation = new Animation({ frames: animFrames
                              , delay: 0.2
                              })

    // Add an animation to the Cache
    animCache.addAnimation({ animation: animation
                           , name: 'dance_blue'
                           })


    var normal     = animCache.getAnimation({ name: 'dance' })
      , dance_gray = animCache.getAnimation({ name: 'dance_gray' })
      , dance_blue = animCache.getAnimation({ name: 'dance_blue' })

    var animN = new Animate({ animation: normal })
      , animG = new Animate({ animation: dance_gray })
      , animB = new Animate({ animation: dance_blue })

    var seq = new Sequence({ actions: [animN, animG, animB] })

    // create an sprite without texture
    var grossini = this.sprite = new Sprite()

    var winSize = Director.sharedDirector.winSize

    grossini.position = ccp(winSize.width / 2, winSize.height / 2)

    this.addChild({ child: grossini })


    // run the animation
    grossini.runAction(seq)
}

SpriteAnimationCache.inherit(TestCase, /** @lends SpriteAnimationCache# */ {
    title: 'AnimationCache'
  , subtitle: 'Sprite should be animated'

  , adjustPositions: function () {
        SpriteAnimationCache.superclass.adjustPositions.call(this)
        var s = Director.sharedDirector.winSize

        this.sprite.position = ccp(s.width / 2, s.height / 2)
  }

})


module.exports = SpriteAnimationCache

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
