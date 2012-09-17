# Import in the modules we're going to use
cocos = require 'cocos2d'
nodes = cocos.nodes
geo   = require 'geometry'

# Convenient access to some constructors
{Director}     = cocos
{Label, Layer} = nodes
{Point}        = geo

class ${classname} extends Layer
  constructor: ->
    # You must always call the super class constructor
    super

    # Get size of canvas
    size = Director.sharedDirector.winSize

    # Create label
    label = new Label
      string: '${appname}'
      fontName: 'Arial'
      fontSize: 67

    # Position the label in the centre of the view
    label.position = new Point size.width / 2, size.height / 2

    # Add label to layer
    @addChild label

# Export the class so it can be accessed from outside this file
@${classname} = ${classname}
