'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase  = require('./ActionTestCase')
  , Director  = cocos.Director
  , Scheduler = cocos.Scheduler
  , Point     = geo.Point
  , MoveBy    = actions.MoveBy
  , Sequence  = actions.Sequence
  , DelayTime = actions.DelayTime
  , EaseExponentialInOut = actions.EaseExponentialInOut
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 */
function SpriteEaseExponentialInOutTest () {
    SpriteEaseExponentialInOutTest.superclass.constructor.call(this)
}

SpriteEaseExponentialInOutTest.inherit(TestCase, /** @lends SpriteEaseExponentialInOutTest# */ {
    title: 'EaseExponentialInOut action'

  , onEnter: function () {
        SpriteEaseExponentialInOutTest.superclass.onEnter.call(this)

        var s = Director.sharedDirector.winSize

        var move           = new MoveBy({ duration: 3, position: new Point(s.width-130, 0) })
          , move_back      = move.reverse()

          , move_ease      = new EaseExponentialInOut({ action: move.copy() })
          , move_ease_back = move_ease.reverse()

          , delay          = new DelayTime({ duration: 0.25 })

        var seq1 = new Sequence({ actions: [move, delay, move_back, delay.copy()] })
          , seq2 = new Sequence({ actions: [move_ease, delay.copy(), move_ease_back, delay.copy()] })

        this.positionForTwo()

        this.grossini.runAction(new RepeatForever(seq1))
        this.tamara.runAction(new RepeatForever(seq2))
    }
})

module.exports = SpriteEaseExponentialInOutTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
