# Import in the modules we're going to use
cocos  = require 'cocos2d'
nodes  = cocos.nodes
events = require 'events'
geo    = require 'geometry'

# Convenient access to some constructors
{Director} = cocos
{Scene}    = nodes

# Import our class
{${classname}} = require './${filename}'

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
