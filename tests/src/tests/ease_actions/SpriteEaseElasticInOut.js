'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase         = require('./ActionTestCase')
  , Director         = cocos.Director
  , Scheduler        = cocos.Scheduler
  , Point            = geo.Point
  , MoveBy           = actions.MoveBy
  , EaseElasticInOut = actions.EaseElasticInOut
  , Sequence         = actions.Sequence
  , DelayTime        = actions.DelayTime
  , RepeatForever    = actions.RepeatForever
//}}} Imports

/**
 * @class
 */
function SpriteEaseElasticInOutTest () {
    SpriteEaseElasticInOutTest.superclass.constructor.call(this)
}

SpriteEaseElasticInOutTest.inherit(TestCase, /** @lends SpriteEaseElasticInOutTest# */ {
    title: 'EaseElasticInOut action'

  , onEnter: function () {
        SpriteEaseElasticInOutTest.superclass.onEnter.call(this)

        var s = Director.sharedDirector.winSize

        var move = new MoveBy({ duration: 3, position: new Point(s.width - 130, 0) })

          , move_ease_inout1 = new EaseElasticInOut({ action: move.copy(), period: 0.3 })
          , move_ease_inout_back1 = move_ease_inout1.reverse()

          , move_ease_inout2 = new EaseElasticInOut({ action: move.copy(), period: 0.45 })
          , move_ease_inout_back2 = move_ease_inout2.reverse()

          , move_ease_inout3 = new EaseElasticInOut({ action: move.copy(), period: 0.6 })
          , move_ease_inout_back3 = move_ease_inout3.reverse()

          , delay = new DelayTime({ duration: 0.25 })

        var seq1 = new Sequence({ actions: [move_ease_inout1, delay, move_ease_inout_back1, delay.copy()] })
          , seq2 = new Sequence({ actions: [move_ease_inout2, delay.copy(), move_ease_inout_back2, delay.copy()] })
          , seq3 = new Sequence({ actions: [move_ease_inout3, delay.copy(), move_ease_inout_back3, delay.copy()] })

        this.tamara.runAction(new RepeatForever(seq1))
        this.kathia.runAction(new RepeatForever(seq2))
        this.grossini.runAction(new RepeatForever(seq3))
    }
})

module.exports = SpriteEaseElasticInOutTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
