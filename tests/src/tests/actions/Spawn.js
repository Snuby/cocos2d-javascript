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
  , Spawn    = actions.Spawn
  , JumpBy   = actions.JumpBy
  , RotateBy = actions.RotateBy
  , Sequence = actions.Sequence
//}}} Imports

/**
 * @class
 * Test Spawn Action
 */
function SpawnTest () {
    SpawnTest.superclass.constructor.call(this)
}

SpawnTest.inherit(TestCase, /** @lends SpawnTest# */ {
    title: 'Spawn: Jump + Rotate'

  , onEnter: function () {
        SpawnTest.superclass.onEnter.call(this)

        this.alignSpritesLeft(1)

        var action = new Spawn({ actions: [ new JumpBy({ duration: 2, delta: new Point(300, 0), height: 50, jumps: 4 })
                                          , new RotateBy({ duration: 2, angle: 720 })
                                          ]})
        this.grossini.runAction(action)
    }
})

module.exports = SpawnTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
