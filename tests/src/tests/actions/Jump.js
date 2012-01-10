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
  , JumpTo   = actions.JumpTo
  , JumpBy   = actions.JumpBy
  , Sequence = actions.Sequence
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 *
 * JumpTo and JumpBy actions
 */
function Jump () {
    Jump.superclass.constructor.call(this)
}

Jump.inherit(TestCase, /** @lends Jump# */ {
    title: 'JumpTo / JumpBy'

  , onEnter: function () {
        Jump.superclass.onEnter.call(this)

        var s = cocos.Director.sharedDirector.winSize

        var actionTo = new JumpTo({ duration: 2, delta: new Point(300, 300), height: 50, jumps: 4 })
          , actionBy = new JumpBy({ duration: 2, delta: new Point(300, 0),   height: 50, jumps: 4 })
          , actionUp = new JumpBy({ duration: 2, delta: new Point(0,   0),   height: 80, jumps: 4 })
          , actionByBack = actionBy.reverse()

        this.tamara.runAction(actionTo)
        this.grossini.runAction(new Sequence({actions: [actionBy, actionByBack]}))
        this.kathia.runAction(new RepeatForever(actionUp))

    }
})

module.exports = Jump

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
