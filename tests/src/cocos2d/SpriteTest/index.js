'use strict'

//{{{ Imports
var events    = require('events')
  , cocos     = require('cocos2d')
  , Director  = cocos.Director
  , Scene     = cocos.nodes.Scene
//}}} Imports

//{{{ Test List
var testList = [ 'Sprite1'
               , 'SpriteBatchNode1'
               , 'SpriteAnchorPoint'
               , 'SpriteZOrder'
               , 'SpriteAnimationFlip'
               , 'SpriteColorOpacity'
               , 'SpriteAnimationCache'
               ]
//}}}

//{{{ Test Actions
var tests = {
    testIndex: -1

  , runTest: function () {
        var id = testList[this.testIndex]
          , Test = this[id]
          , t = new Test

        events.addListener(t, 'next',    this.next.bind(this))
        events.addListener(t, 'back',    this.back.bind(this))
        events.addListener(t, 'restart', this.restart.bind(this))


        var director = Director.sharedDirector
          , scene = new Scene()

        scene.addChild(t)
        director.replaceScene(scene)

        return t
    }

  , next: function () {
        this.testIndex++
        this.testIndex = this.testIndex % testList.length

        return this.runTest()
    }

  , back: function () {
        this.testIndex--
        if (this.testIndex < 0) {
            this.testIndex += testList.length
        }

        this.runTest()
    }

  , restart: function () {
        this.runTest()
    }
}
//}}} Test Actions

exports.main = function () {
    // Import all the tests
    testList.forEach(function (testName) {
        tests[testName] = require('./' + testName)
    })

    var director = Director.sharedDirector
    director.displayFPS = true

    // Start the first test when everything has loaded
    events.addListener(director, 'ready', tests.next.bind(tests))

    // Load everything
    director.runPreloadScene()
}

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
