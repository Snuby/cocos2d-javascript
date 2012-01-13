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
  , Point     = geo.Point
  , MoveBy    = actions.MoveBy
  , Sequence  = actions.Sequence
  , DelayTime = actions.DelayTime
//}}} Imports

/**
 * @class
 * Test Delay Action
 */
function DelayTest () {
    DelayTest.superclass.constructor.call(this)
}

DelayTest.inherit(TestCase, /** @lends DelayTest# */ {
    title: 'DelayTime: m + delay + m'

  , onEnter: function () {
        DelayTest.superclass.onEnter.call(this)

        this.alignSpritesLeft(1)

        var move = new MoveBy({ duration: 1, position: new Point(150, 0) })
        var action = new Sequence({ actions: [move, new DelayTime({ duration: 2 }), move] })

        this.grossini.runAction(action)
    }
})

module.exports = DelayTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
