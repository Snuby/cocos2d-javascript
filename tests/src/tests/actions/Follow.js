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
  , Rect      = geo.Rect
  , MoveBy    = actions.MoveBy
  , Follow    = actions.Follow
  , Sequence  = actions.Sequence
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 */
function FollowTest () {
    FollowTest.superclass.constructor.call(this)
}

FollowTest.inherit(TestCase, /** @lends FollowTest# */ {
    title: 'Follow action'
  , subtitle: 'The sprite should be centered, even though it is being moved'

  , onEnter: function () {
        FollowTest.superclass.onEnter.call(this)

        this.centerSprites(1)
        var s = Director.sharedDirector.winSize

        this.grossini.position = new Point(-200, s.height / 2)

        var move = new MoveBy({ duration: 2, position: new Point(s.width * 3, 0) })
          , move_back = move.reverse()
          , seq = new Sequence({ actions: [move, move_back] })
          , rep = new RepeatForever(seq)

        this.grossini.runAction(rep)

        this.runAction(new Follow({ target: this.grossini
                                  , worldBoundary: new Rect(0, 0, s.width * 2 - 100, s.height)
                                  }))
    }

})

module.exports = FollowTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
