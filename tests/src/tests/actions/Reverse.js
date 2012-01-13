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
  , JumpBy   = actions.JumpBy
  , Sequence = actions.Sequence
//}}} Imports

/**
 * @class
 * Test Reverse Action
 */
function ReverseTest () {
    ReverseTest.superclass.constructor.call(this)
}

ReverseTest.inherit(TestCase, /** @lends ReverseTest# */ {
    title: 'Reverse an action'

  , onEnter: function () {
        ReverseTest.superclass.onEnter.call(this)

        this.alignSpritesLeft(1)

        var jump = new JumpBy({ duration: 2, delta: new Point(300, 0), height: 50, jumps: 4 })
        var action = new Sequence({ actions: [jump, jump.reverse()] })

        this.grossini.runAction(action)
    }
})

module.exports = ReverseTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
