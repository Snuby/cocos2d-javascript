# Pull in the modules we're going to use
cocos  = require 'cocos2d'    # Import the cocos2d module
nodes  = cocos.nodes          # Convenient access to 'nodes'
geo    = require 'geometry'   # Import the geometry module

# Convenient access to some constructors
Director = cocos.Director
Label    = nodes.Label
Layer    = nodes.Layer
Point    = geo.Point

class @${classname} extends Layer
    constructor: ->
        # You must always call the super class constructor
        super

        # Get size of canvas
        s = Director.sharedDirector.winSize

        # Create label
        label = new Label string: '${appname}'
                        , fontName: 'Arial'
                        , fontSize: 67

        # Position the label in the centre of the view
        label.position = new Point s.width / 2, s.height / 2

        # Add label to layer
        @addChild label
