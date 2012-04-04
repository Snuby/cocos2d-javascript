'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , events    = require('events')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , ccp       = geo.ccp

var Director      = cocos.Director
  , Layer         = nodes.Layer
  , Label         = nodes.Label
  , Menu          = nodes.Menu
  , MenuItemImage = nodes.MenuItemImage
  , Point         = geo.Point
//}}} Imports

/**
 * @class
 * Base class for all Cocos2D test layers.
 *
 * Draws the navigation buttons and labels for each test
 *
 * @extends cocos.nodes.Layer
 */
function TestCase () {
    TestCase.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    var label

    if (this.title) {
        label = new Label({ string:   this.title
                          , fontName: 'Helvetica'
                          , fontSize: 26
                          })

        label.position = new Point(s.width / 2, s.height - 50)

        this.addChild({ child: label
                      , z: 1
                      })

        this.titleLabel = label
    }


    if (this.subtitle) {
        label = new Label({ string:   this.subtitle
                          , fontName: 'Helvetica'
                          , fontSize: 16
                          })

        label.position = new Point(s.width / 2, s.height - 80)

        this.addChild({ child: label
                      , z: 1
                      })

        this.subtitleLabel = label
    }


    var item1 = new MenuItemImage({ normalImage: path.join(__dirname, 'resources/b1.png')
                                  , selectedImage: path.join(__dirname, 'resources/b2.png')
                                  , callback: function () { events.trigger(this, 'back') }.bind(this)
                                  })
    var item2 = new MenuItemImage({ normalImage: path.join(__dirname, 'resources/r1.png')
                                  , selectedImage: path.join(__dirname, 'resources/r2.png')
                                  , callback: function () { events.trigger(this, 'restart') }.bind(this)
                                  })
    var item3 = new MenuItemImage({ normalImage: path.join(__dirname, 'resources/f1.png')
                                  , selectedImage: path.join(__dirname, 'resources/f2.png')
                                  , callback: function () { events.trigger(this, 'next') }.bind(this)
                                  })

    var menu = new Menu({items: [item1, item2, item3]})

    menu.position  = new Point(0, 0)
    item1.position = new Point(s.width / 2 - 100, 30)
    item2.position = new Point(s.width / 2, 30)
    item3.position = new Point(s.width / 2 + 100, 30)

    this.addChild({ child: menu
                  , z: 1
                  })

    this.menu = menu
    events.addListener(Director.sharedDirector, 'resize', this.adjustPositions.bind(this))
}

TestCase.inherit(Layer, /** @lends TestCase# */ {
    /**
     * Main title for the test
     * @type String
     */
    title: null

    /**
     * Sub-title for the test
     * @type String
     */
  , subtitle: null


    /**
     * Repositions labels and menus when view resizes
     */
  , adjustPositions: function () {
        var s = Director.sharedDirector.winSize
        this.titleLabel.position = new Point(s.width / 2, s.height - 50)

        if (this.subtitleLabel) {
            this.subtitleLabel.position = new Point(s.width / 2, s.height - 80)
        }


        this.menu.children[0].position = new Point(s.width / 2 - 100, 30)
        this.menu.children[1].position = new Point(s.width / 2, 30)
        this.menu.children[2].position = new Point(s.width / 2 + 100, 30)
    }
})

module.exports = TestCase

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
