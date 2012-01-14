'use strict'

var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , nodes     = cocos.nodes
  , actions   = cocos.actions
  , Texture2D = cocos.Texture2D
  , events    = require('events')
  , geo       = require('geometry')
  , ccp       = geo.ccp

var Director      = cocos.Director
  , Scene         = nodes.Scene
  , Layer         = nodes.Layer
  , Label         = nodes.Label
  , Menu          = nodes.Menu
  , MenuItemImage = nodes.MenuItemImage
  , Point         = geo.Point
  , TestCase      = require('../TestCase')
  , TestSuite     = require('../TestSuite')

var sceneIdx = -1
var transitions = [ 'TransitionRotoZoomTest'
                  , 'TransitionMoveInLTest'
                  , 'TransitionMoveInRTest'
                  , 'TransitionMoveInTTest'
                  , 'TransitionMoveInBTest'
                  , 'TransitionSlideInLTest'
                  , 'TransitionSlideInRTest'
                  , 'TransitionSlideInTTest'
                  , 'TransitionSlideInBTest'
                  ]
var transObjects = [ nodes.TransitionRotoZoom
                   , nodes.TransitionMoveInL
                   , nodes.TransitionMoveInR
                   , nodes.TransitionMoveInT
                   , nodes.TransitionMoveInB
                   , nodes.TransitionSlideInL
                   , nodes.TransitionSlideInR
                   , nodes.TransitionSlideInT
                   , nodes.TransitionSlideInB
                   ]
var tests = {}

function TransitionDemo () {
    TransitionDemo.superclass.constructor.call(this)

    this.isMouseEnabled = true
}

TransitionDemo.inherit(TestCase)


function TransitionRotoZoomTest () {
    TransitionRotoZoomTest.superclass.constructor.call(this)
}
TransitionRotoZoomTest.inherit(TransitionDemo, {
    title: 'TransitionRotoZoom Test',
    subtitle: 'rotates and zooms & reverse to next scene'
})

function TransitionMoveInLTest () {
    TransitionMoveInLTest.superclass.constructor.call(this)
}
TransitionMoveInLTest.inherit(TransitionDemo, {
    title: 'TransitionMoveInL Test',
    subtitle: 'next scene moves in from the left'
})

function TransitionMoveInRTest () {
    TransitionMoveInRTest.superclass.constructor.call(this)
}
TransitionMoveInRTest.inherit(TransitionDemo, {
    title: 'TransitionMoveInR Test',
    subtitle: 'next scene moves in from the right'
})

function TransitionMoveInTTest () {
    TransitionMoveInTTest.superclass.constructor.call(this)
}
TransitionMoveInTTest.inherit(TransitionDemo, {
    title: 'TransitionMoveInT Test',
    subtitle: 'next scene moves in from the top'
})

function TransitionMoveInBTest () {
    TransitionMoveInBTest.superclass.constructor.call(this)
}
TransitionMoveInBTest.inherit(TransitionDemo, {
    title: 'TransitionMoveInB Test',
    subtitle: 'next scene moves in from the bottom'
})

function TransitionSlideInLTest () {
    TransitionSlideInLTest.superclass.constructor.call(this)
}
TransitionSlideInLTest.inherit(TransitionDemo, {
    title: 'TransitionSlideInL Test',
    subtitle: 'next scene pans in from the left'
})

function TransitionSlideInRTest () {
    TransitionSlideInRTest.superclass.constructor.call(this)
}
TransitionSlideInRTest.inherit(TransitionDemo, {
    title: 'TransitionSlideInR Test',
    subtitle: 'next scene pans in from the right'
})

function TransitionSlideInTTest () {
    TransitionSlideInTTest.superclass.constructor.call(this)
}
TransitionSlideInTTest.inherit(TransitionDemo, {
    title: 'TransitionSlideInT Test',
    subtitle: 'next scene slides in from the top'
})

function TransitionSlideInBTest () {
    TransitionSlideInBTest.superclass.constructor.call(this)
}
TransitionSlideInBTest.inherit(TransitionDemo, {
    title: 'TransitionSlideInB Test',
    subtitle: 'next scene slides in from the bottom'
})

exports.main = function () {
    var director = Director.sharedDirector
    director.displayFPS = true

    // Start the first test when everything has loaded
    events.addListener(director, 'ready', function () {
        var testSuite = new TestSuite()


        testSuite.run = function () {
            var test = this.getTest()

            events.addListener(test, 'next',    this.next.bind(this))
            events.addListener(test, 'back',    this.previous.bind(this))
            events.addListener(test, 'restart', this.restart.bind(this))


            var director = Director.sharedDirector
              , scene    = new Scene()

            scene.addChild(test)

            var Trans = transObjects[this.currentTest]
            director.replaceScene(new Trans({ duration: 1.5, scene: scene }))

            return test
        }

        testSuite.tests.push( TransitionRotoZoomTest
                            , TransitionMoveInLTest
                            , TransitionMoveInRTest
                            , TransitionMoveInTTest
                            , TransitionMoveInBTest
                            , TransitionSlideInLTest
                            , TransitionSlideInRTest
                            , TransitionSlideInTTest
                            , TransitionSlideInBTest
                            )

        testSuite.run()
    })

    // Load everything
    director.runPreloadScene()
}
