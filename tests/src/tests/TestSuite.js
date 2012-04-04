'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , events    = require('events')
  , cocos     = require('cocos2d')
  , nodes     = cocos.nodes

var Director = cocos.Director
  , Scene    = nodes.Scene
//}}} Imports

/**
 * @class
 * Runs a set of tests
 */
function TestSuite () {
    TestSuite.superclass.constructor.call(this)
    this.tests = []
}

TestSuite.inherit(Object, /** @lends TestSuite# */ {
    /**
     * Array of tests to run
     * @type TestCase[]
     */
    tests: null

    /**
     * Index of current test
     * @type Integer
     */
  , currentTest: 0

  , getTest: function () {
        return new this.tests[this.currentTest]
    }

    /**
     * Start running the tests
     */
  , run: function () {
        var test = this.getTest()

        events.addListener(test, 'next',    this.next.bind(this))
        events.addListener(test, 'back',    this.previous.bind(this))
        events.addListener(test, 'restart', this.restart.bind(this))


        var director = Director.sharedDirector
          , scene    = new Scene()

        scene.addChild(test)
        director.replaceScene(scene)

        return test
    }

    /**
     * Run the next test. Loops back to the first when reaching the end.
     */
  , next: function () {
        this.currentTest++
        this.currentTest = this.currentTest % this.tests.length

        this.run()
    }

    /**
     * Run the previous test. Loops back to the end when reaching the beginning.
     */
  , previous: function () {
        this.currentTest--
        if (this.currentTest < 0) {
            this.currentTest += this.tests.length
        }

        this.run()
    }

    /**
     * Restart the current test.
     */
  , restart: function () {
        this.run()
    }
})

module.exports = TestSuite

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
