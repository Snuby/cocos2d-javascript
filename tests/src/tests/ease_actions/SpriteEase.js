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
  , EaseIn    = actions.EaseIn
  , EaseOut   = actions.EaseOut
  , RotateBy  = actions.RotateBy
  , Sequence  = actions.Sequence
  , DelayTime = actions.DelayTime
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 */
function SpriteEaseTest () {
    SpriteEaseTest.superclass.constructor.call(this)
}

SpriteEaseTest.inherit(TestCase, /** @lends SpriteEaseTest# */ {
    title: 'EaseIn - EaseOut - Stop'

  , onEnter: function () {
        SpriteEaseTest.superclass.onEnter.call(this)

        var s = Director.sharedDirector.winSize

        var move               = new MoveBy({ duration: 3, position: new Point(s.width - 130, 0) })
          , move_back          = move.reverse()

          , move_ease_in       = new EaseIn({ action: move.copy(), rate: 3 })
          , move_ease_in_back  = move_ease_in.reverse()

          , move_ease_out      = new EaseOut({ action: move.copy(), rate: 3 })
          , move_ease_out_back = move_ease_out.reverse()

          , delay              = new DelayTime({ duration: 0.25 })

        var seq1 = new Sequence({ actions: [move, delay, move_back, delay.copy()] })
          , seq2 = new Sequence({ actions: [move_ease_in, delay.copy(), move_ease_in_back, delay.copy()] })
          , seq3 = new Sequence({ actions: [move_ease_out, delay.copy(), move_ease_out_back, delay.copy()] })

        var a2 = this.grossini.runAction(new RepeatForever(seq1))
          , a1 = this.tamara.runAction(new RepeatForever(seq2))
          , a  = this.kathia.runAction(new RepeatForever(seq3))

        Scheduler.sharedScheduler.schedule({ target: this
                                           , method: 'testStopAction'
                                           , interval: 6.25
                                           , paused: !this.isRunning
                                           })
    }

  , testStopAction: function (dt) {
        Scheduler.sharedScheduler.unschedule({ target: this
                                             , method: 'testStopAction'
                                             })
        this.tamara.stopAllActions()
        this.kathia.stopAllActions()
        this.grossini.stopAllActions()
    }
})

module.exports = SpriteEaseTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
