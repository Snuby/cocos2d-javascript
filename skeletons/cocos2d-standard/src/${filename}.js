"use strict"  // Use strict JavaScript mode

// Import in the modules we're going to use
var cocos  = require('cocos2d')
  , nodes  = cocos.nodes
  , geo    = require('geometry')

// Convenient access to some constructors
var Director = cocos.Director
  , Label    = nodes.Label
  , Layer    = nodes.Layer
  , Point    = geo.Point

/**
 * @class Initial application layer
 * @extends cocos.nodes.Layer
 */
function ${classname} () {
    // You must always call the super class constructor
    ${classname}.superclass.constructor.call(this)

    // Get size of canvas
    var size = Director.sharedDirector.winSize

    // Create label
    var label = new Label({ string:   '${appname}'
                          , fontName: 'Arial'
                          , fontSize: 76
                          })

    // Position the label in the centre of the view
    label.position = new Point(size.width / 2, size.height / 2)

    // Add label to layer
    this.addChild(label)
}

// Inherit from cocos.nodes.Layer
${classname}.inherit(Layer)

// Export the class so it can be accessed from outside this file
this.${classname} = ${classname}
