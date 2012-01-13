'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase = require('./ActionTestCase')
  , Director = cocos.Director
  , Point    = geo.Point
  , RotateTo = actions.RotateTo
  , Sequence = actions.Sequence
  , Repeat   = actions.Repeat
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 */
function RotateToRepeatTest () {
    RotateToRepeatTest.superclass.constructor.call(this)
}

RotateToRepeatTest.inherit(TestCase, /** @lends RotateToRepeatTest# */ {
    title: 'Repeat/RepeatForever + RotateTo'
  , subtitle: 'You should see smooth movements'

  , onEnter: function () {
        RotateToRepeatTest.superclass.onEnter.call(this)

        this.centerSprites(2)

        var act1 = new RotateTo({ duration: 1, angle: 90 })
          , act2 = new RotateTo({ duration: 1, angle: 0 })
          , seq  = new Sequence({ actions: [act1, act2] })
          , rep1 = new RepeatForever(seq)
          , rep2 = new Repeat({ action: seq, times: 10 })

        this.tamara.runAction(rep1)
        this.kathia.runAction(rep2)
    }
})

module.exports = RotateToRepeatTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
