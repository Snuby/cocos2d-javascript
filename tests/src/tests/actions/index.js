'use strict'

//{{{ Imports
var events    = require('events')
  , Director  = require('cocos2d').Director
  , TestSuite = require('../TestSuite')
//}}} Imports

//{{{ Test List
var testList = [ 'Manual'
               , 'Move'
               , 'Jump'
               , 'Bezier'
               , 'Blink'
               , 'Sequence'
               , 'Sequence2'
               , 'Spawn'
               , 'Reverse'
               , 'Delay'
               , 'Repeat'
               , 'RepeatForever'
               , 'RotateToRepeat'
               , 'RotateJerk'
               , 'ReverseSequence'
               , 'ReverseSequence2'
               , 'Speed'
               , 'Follow'
               ]
//}}}

exports.main = function () {
    var director = Director.sharedDirector
    director.displayFPS = true

    // Start the first test when everything has loaded
    events.addListener(director, 'ready', function () {
        var testSuite = new TestSuite()

        // Import all the tests
        testList.forEach(function (testName) {
            testSuite.tests.push(require('./' + testName))
        })

        testSuite.run()
    })

    // Load everything
    director.runPreloadScene()
}

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
