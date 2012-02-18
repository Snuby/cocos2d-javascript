# Pull in the modules we're going to use
cocos  = require 'cocos2d'    # Import the cocos2d module
nodes  = cocos.nodes          # Convenient access to 'nodes'
events = require 'events'     # Import the events module
geo    = require 'geometry'   # Import the geometry module
ccp    = geo.ccp              # Short hand to create points

# Convenient access to some constructors
Layer    = nodes.Layer
Scene    = nodes.Scene
Label    = nodes.Label
Director = cocos.Director
Point    = geo.Point

class ${classname} extends Layer
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

# Initialise application
exports.main = ->
    # Get director singleton
    director = Director.sharedDirector

    # Wait for the director to finish preloading our assets
    events.addListener director, 'ready', (director) ->
        # Create a scene and layer
        scene = new Scene
        layer = new ${classname}

        # Add our layer to the scene
        scene.addChild layer

        # Run the scene
        director.replaceScene scene

    # Preload our assets
    director.runPreloadScene()
