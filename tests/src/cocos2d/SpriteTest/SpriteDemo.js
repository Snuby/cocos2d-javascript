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
//}}} Imports

function SpriteDemo () {
    SpriteDemo.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    var label = new Label({ string:   this.title
                          , fontName: 'Arial'
                          , fontSize: 26
                          })

    label.position = ccp(s.width / 2, s.height - 50)

    this.addChild({ child: label
                  , z: 1
                  })


    if (this.subtitle) {
        label = new Label({ string:   this.subtitle
                          , fontName: 'Thonburi'
                          , fontSize: 16
                          })

        label.position = ccp(s.width / 2, s.height - 80)

        this.addChild({ child: label
                      , z: 1
                      })
    }


    var item1 = new MenuItemImage({ normalImage: path.join(__dirname, '../resources/b1.png')
                                  , selectedImage: path.join(__dirname, '../resources/b2.png')
                                  , callback: function () { events.trigger(this, 'back') }.bind(this)
                                  })
    var item2 = new MenuItemImage({ normalImage: path.join(__dirname, '../resources/r1.png')
                                  , selectedImage: path.join(__dirname, '../resources/r2.png')
                                  , callback: function () { events.trigger(this, 'restart') }.bind(this)
                                  })
    var item3 = new MenuItemImage({ normalImage: path.join(__dirname, '../resources/f1.png')
                                  , selectedImage: path.join(__dirname, '../resources/f2.png')
                                  , callback: function () { events.trigger(this, 'next') }.bind(this)
                                  })

    var menu = new Menu({items: [item1, item2, item3]})

    menu.position  = ccp(0, 0)
    item1.position = ccp(s.width / 2 - 100, 30)
    item2.position = ccp(s.width / 2, 30)
    item3.position = ccp(s.width / 2 + 100, 30)

    this.addChild({ child: menu
                  , z: 1
                  })
}

SpriteDemo.inherit(Layer, /** @lends SpriteDemo# */ {
    title: 'No title'
  , subtitle: null
})

module.exports = SpriteDemo

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
