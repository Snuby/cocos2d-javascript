# Pull in the modules we're going to use
cocos  = require 'cocos2d'    # Import the cocos2d module
nodes  = cocos.nodes          # Convenient access to 'nodes'
events = require 'events'     # Import the events module
geo    = require 'geometry'   # Import the geometry module

# Convenient access to some constructors
Director = cocos.Director
Scene    = nodes.Scene

${classname} = require('./${classname}').${classname}

# Initialise application
@main = ->
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
