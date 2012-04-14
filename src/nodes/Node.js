'use strict'

//{{{ Imports
var util   = require('util')
  , events = require('events')
  , geo    = require('geometry')
  , ccp    = geo.ccp

var Scheduler     = require('../Scheduler').Scheduler
  , ActionManager = require('../ActionManager').ActionManager
//}}}

/**
 * @class
 * The base class all visual elements extend from
 *
 * @memberOf cocos.nodes
 */
function Node () {
    this._contentSize = new geo.Size(0, 0)
    this._anchorPoint = ccp(0.0, 0.0)
    this.anchorPointInPixels = ccp(0, 0)
    this._position = ccp(0, 0)
    this.children = []

    events.addListener(this, 'dirtytransform', this._dirtyTransform.bind(this))
}

Node.inherit(Object, /** @lends cocos.nodes.Node# */ {
    /**
     * Is the node visible
     * @type Boolean
     */
    get visible ()  { return this._visible }
  , set visible (x) { this._visible = x; this._dirtyDraw() }
  , _visible: true

    /**
     * Position relative to parent node
     * @type geometry.Point
     */
  , get position ()  { return this._position }
  , set position (x) { this._position = x; events.trigger(this, 'dirtytransform', {target: this, property: 'position'}) }
  , _position: null

    /**
     * Parent node
     * @type cocos.nodes.Node
     * @readonly
     */
  , parent: null

    /**
     * Unique tag to identify the node
     * @type String
     */
  , tag: null

    /**
     * Size of the node
     * @type geometry.Size
     */
  , get contentSize ()  { return this._contentSize }
  , set contentSize (x) { this._contentSize = x; events.trigger(this, 'dirtytransform', {target: this, property: 'contentSize'}); this._updateAnchorPointInPixels() }
  , _contentSize: null

    /**
     * Nodes Z index. i.e. draw order
     * @type Integer
     */
  , zOrder: 0

    /**
     * Anchor point for scaling and rotation. 0x0 is top left and 1x1 is bottom right
     * @type geometry.Point
     */
  , get anchorPoint ()  { return this._anchorPoint }
  , set anchorPoint (x) { this._anchorPoint = x; events.trigger(this, 'dirtytransform', {target: this, property: 'anchorPoint'}); this._updateAnchorPointInPixels() }

    /**
     * Anchor point for scaling and rotation in pixels from top left
     * @type geometry.Point
     */
  , anchorPointInPixels: null

    /**
     * Rotation angle in degrees
     * @type Float
     */
  , get rotation ()  { return this._rotation }
  , set rotation (x) { this._rotation = x; events.trigger(this, 'dirtytransform', {target: this, property: 'rotation'}) }
  , _rotation: 0

    /**
     * X scale factor
     * @type Float
     */
  , get scaleX ()  { return this._scaleX }
  , set scaleX (x) { this._scaleX = x; events.trigger(this, 'dirtytransform', {target: this, property: 'scaleX'}) }

    /**
     * @ignore
     */
  , _scaleX: 1

    /**
     * Y scale factor
     * @type Float
     */
  , get scaleY ()  { return this._scaleY }
  , set scaleY (x) { this._scaleY = x; events.trigger(this, 'dirtytransform', {target: this, property: 'scaleY'}) }

    /**
     * @ignore
     */
  , _scaleY: 1

    /**
     * Opacity of the Node. 0 is totally transparent, 255 is totally opaque
     * @type Float
     */
  , get opacity ()  { return this._opacity }
  , set opacity (x) { this._opacity = x; this._dirtyDraw() }
  , _opacity: 255

    /**
     * Is the node active in the scene
     * @type Boolean
     * @readonly
     */
  , isRunning: false

    /**
     * Is the anchor point relative to the Node
     * @type Boolean
     */
  , get isRelativeAnchorPoint ()  { return this._isRelativeAnchorPoint }
  , set isRelativeAnchorPoint (x) { this._isRelativeAnchorPoint = x; events.trigger(this, 'dirtytransform', {target: this, property: 'isRelativeAnchorPoint'}) }
  , _isRelativeAnchorPoint: true

    /**
     * Has a property changed the requires recaculation of the transform matrix
     * @type Boolean
     */
  , isTransformDirty: true

  , isInverseDirty: true

  , inverse: null

    /**
     * Current transform matrix used to render the Node. Set by cocos.nodes.Node#nodeToParentTransform
     * @type Boolean
     */
  , transformMatrix: null

    /**
     * The child Nodes
     * @type {cocos.nodes.Node[]}
     */
  , children: null

    /**
     * @private
     * Calculates the anchor point in pixels and updates the
     * anchorPointInPixels property
     */
  , _updateAnchorPointInPixels: function () {
        var ap = this.anchorPoint
          , cs = this.contentSize
        this.anchorPointInPixels = ccp(cs.width * ap.x, cs.height * ap.y)
    }

    /**
     * Add a child Node
     *
     * @opt {cocos.nodes.Node} child The child node to add
     * @opt {Integer} [z] Z Index for the child
     * @opt {Integer|String} [tag] A tag to reference the child with
     * @returns {cocos.nodes.Node} The node the child was added to. i.e. 'this'
     */
  , addChild: function (opts) {
        if (opts instanceof Node) {
            return this.addChild({child: opts})
        }

        var child = opts.child
          , z = opts.z
          , tag = opts.tag
          , added = false

        if (z === undefined || z === null) {
            z = child.zOrder
        }

        //this.insertChild({child: child, z:z})


        var childLen = this.children.length
          , i, c
        for (i = 0; i < childLen; i++) {
            c = this.children[i]
            if (c.zOrder > z) {
                added = true
                this.children.splice(i, 0, child)
                break
            }
        }

        if (!added) {
            this.children.push(child)
        }

        child.tag = tag
        child.zOrder = z
        child.parent = this

        if (this.isRunning) {
            child.onEnter()
        }

        return this
    }

    /**
     * Get a child node via its tag. Returns null if no Node is found
     *
     * @opt {String} tag Tag of the Node to return
     *
     * @returns cocos.nodes.Node
     */
  , getChild: function (opts) {
        var tag = opts.tag

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].tag == tag) {
                return this.children[i]
            }
        }

        return null
    }

    /**
     * Remove a child node.
     *
     * If 'cleanup' is true all actions and scheduled methods will be removed
     * from the child and its children. You must set this to 'true' if you're
     * removing the object forever or you will have a memory leak.
     *
     * @opt {cocos.nodes.Node} child The Node to remove
     * @opt {Boolean} [cleanup=false] Should a cleanup be performed after removing the Node
     */
  , removeChild: function (opts) {
        if (opts instanceof Node) {
            return this.removeChild({child: opts})
        }

        var child = opts.child
          , cleanup = opts.cleanup

        if (!child) {
            return
        }

        var children = this.children
          , idx = children.indexOf(child)

        if (idx > -1) {
            this._detachChild({child: child, cleanup: cleanup})
        }
    }

    /**
     * Remove all child nodes.
     *
     * If 'cleanup' is true all actions and scheduled methods will be removed
     * from the child and its children.
     *
     * @opt {Boolean} [cleanup=false] Should a cleanup be performed after removing the Node
     */
  , removeChildren: function (opts) {
        var children = this.children
          , isRunning = this.isRunning

        // Perform cleanup on each child but can't call removeChild()
        // due to Array.splice's destructive nature during iteration.
        for (var i = 0; i < children.length; i++) {
            if (opts.cleanup) {
                children[i].cleanup()
            }
            if (isRunning) {
                children[i].onExit()
            }
            children[i].parent = null
        }
        // Now safe to empty children list
        this.children = []
    }

    /**
     * @private
     * Detach the child node from this node
     *
     * @opt {cocos.nodes.Node} child The Node to remove
     * @opt {Boolean} [cleanup=false] Should a cleanup be performed after removing the Node
     */
  , _detachChild: function (opts) {
        var child = opts.child
          , cleanup = opts.cleanup

        var children = this.children
          , isRunning = this.isRunning
          , idx = children.indexOf(child)

        if (isRunning) {
            child.onExit()
        }

        if (cleanup) {
            child.cleanup()
        }

        child.parent = null
        children.splice(idx, 1)
    }

    /**
     * Change the Z index of a child node. Other child nodes will have their Z
     * index adjusted to accommodate.
     *
     * @opt {cocos.nodes.Node} child Child node to reorder
     * @opt {Integer} z The new Z index for the child
     */
  , reorderChild: function (opts) {
        var child = opts.child
          , z     = opts.z
          , pos   = this.children.indexOf(child)

        if (pos == -1) {
            throw "Node isn't a child of this node"
        }

        child.zOrder = z

        // Remove child
        this.children.splice(pos, 1)

        // Add child back at correct location
        var added = false
          , childLen = this.children.length
          , i, c
        for (i = 0; i < childLen; i++) {
            c = this.children[i]
            if (c.zOrder > z) {
                added = true
                this.children.splice(i, 0, child)
                break
            }
        }

        if (!added) {
            this.children.push(child)
        }
    }

    /**
     * Draws the node. Override to do custom drawing. If it's less efficient to
     * draw only the area inside the rect then don't bother. The result will be
     * clipped to that area anyway.
     *
     * @param {CanvasRenderingContext2D} context Canvas rendering context
     * @param {geometry.Rect} rect Rectangular region that needs redrawing. Limit drawing to this area only if it's more efficient to do so.
     */
  , draw: function (context, rect) {
        // All draw code goes here
    }

    /**
     * The scale factor for the node. Only valid is scaleX and scaleY are identical
     *
     * @type Float
     */
  , get scale () {
        if (this.scaleX != this.scaleY) {
            throw "scaleX and scaleY aren't identical"
        }

        return this.scaleX
    }

    /**
     * Sets both scaleX and scaleY to the given value
     *
     * @type Float
     */
  , set scale (val) {
        this.scaleX = val
        this.scaleY = val
    }

    /**
     * Schedule a timer to call the 'update' method on this node every frame
     *
     * @opt {Integer} [priority=0] Priority order for when the method should be called
     */
  , scheduleUpdate: function (opts) {
        opts = opts || {}
        var priority = opts.priority || 0

        Scheduler.sharedScheduler.scheduleUpdate({target: this, priority: priority, paused: !this.isRunning})
    }

  , unscheduleUpdate: function () {
        Scheduler.sharedScheduler.unscheduleUpdateForTarget(this)
    }

    /**
     * Triggered when the node is added to a scene
     *
     * @event
     */
  , onEnter: function () {
        this.children.forEach(function (child) { child.onEnter() })

        this.resumeSchedulerAndActions()
        this.isRunning = true
    }

    /**
     * Triggered when the node is removed from a scene
     *
     * @event
     */
  , onExit: function () {
        this.pauseSchedulerAndActions()
        this.isRunning = false

        this.children.forEach(function (child) { child.onExit() })
    }

    /**
     * Stop and remove all actions and scheduled method calls on itself and
     * children
     */
  , cleanup: function () {
        this.stopAllActions()
        this.unscheduleAllSelectors()
        this.children.forEach(function (child) { child.cleanup() })
    }

  , resumeSchedulerAndActions: function () {
        Scheduler.sharedScheduler.resumeTarget(this)
        ActionManager.sharedManager.resumeTarget(this)
    }

    /**
     * Temporarily pause scheduled methods and actions
     */
  , pauseSchedulerAndActions: function () {
        Scheduler.sharedScheduler.pauseTarget(this)
        ActionManager.sharedManager.pauseTarget(this)
    }

    /**
     * Remove a specific scheduled method call
     */
  , unscheduleSelector: function (selector) {
        Scheduler.sharedScheduler.unschedule({target: this, method: selector})
    }

    /**
     * Remove all scheduled methods calls
     */
  , unscheduleAllSelectors: function () {
        Scheduler.sharedScheduler.unscheduleAllSelectorsForTarget(this)
    }

    /**
     * Stop all running actions on this node
     */
  , stopAllActions: function () {
        ActionManager.sharedManager.removeAllActionsFromTarget(this)
    }

    /**
     * Called automatically every frame and triggers the call to 'draw' this
     * node and its children in the correct order.
     *
     * For custom drawing override the 'draw' method. Only override this if you
     * really need to do something special.
     *
     * @param {CanvasRenderingContext2D} context Canvas rendering context
     * @param {geometry.Rect} [rect] Area that needs redrawing
     */
  , visit: function (context, rect) {
        if (!this.visible) {
            return
        }

        context.save()

        this.transform(context)

        // Set alpha value (global only for now)
        context.globalAlpha = this.opacity / 255.0

        // Adjust redraw region by nodes position
        if (rect) {
            var pos = this.position
            rect = new geo.Rect(rect.origin.x - pos.x, rect.origin.y - pos.y, rect.size.width, rect.size.height)
        }

        // Draw background nodes
        this.children.forEach(function (child, i) {
            if (child.zOrder < 0) {
                child.visit(context, rect)
            }
        })

        this.draw(context, rect)

        // Draw foreground nodes
        this.children.forEach(function (child, i) {
            if (child.zOrder >= 0) {
                child.visit(context, rect)
            }
        })

        context.restore()
    }

    /**
     * Transforms the node by its scale, rotation and position. Called automatically when one of these changes
     *
     * @param {CanvasRenderingContext2D} context Canvas rendering context
     */
  , transform: function (context) {
        // Translate
        if (this.isRelativeAnchorPoint && (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels.y !== 0)) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y))
        }

        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels.y !== 0) {
            context.translate(Math.round(this.position.x + this.anchorPointInPixels.x), Math.round(this.position.y + this.anchorPointInPixels.y))
        } else {
            context.translate(Math.round(this.position.x), Math.round(this.position.y))
        }

        // Rotate
        if (FLIP_Y_AXIS) {
            context.rotate(-geo.degreesToRadians(this.rotation))
        } else {
            context.rotate(geo.degreesToRadians(this.rotation))
        }

        // Scale
        context.scale(this.scaleX, this.scaleY)

        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels.y !== 0) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y))
        }
    }

    /**
     * Run an action on the node
     *
     * @param {cocos.actions.Action} action Action to run
     */
  , runAction: function (action) {
        ActionManager.sharedManager.addAction({action: action, target: this, paused: this.isRunning})
    }

    /**
     * @opt {String} tag Tag of the action to return
     */
  , getAction: function (opts) {
        return ActionManager.sharedManager.getActionFromTarget({target: this, tag: opts.tag})
    }

  , nodeToParentTransform: function () {
        if (this.isTransformDirty) {
            this.transformMatrix = geo.affineTransformIdentity()

            if (!this.isRelativeAnchorPoint && !geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.anchorPointInPixels.x, this.anchorPointInPixels.y)
            }

            if (!geo.pointEqualToPoint(this.position, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.position.x, this.position.y)
            }

            if (this.rotation !== 0) {
                this.transformMatrix = geo.affineTransformRotate(this.transformMatrix, -geo.degreesToRadians(this.rotation))
            }
            if (!(this.scaleX == 1 && this.scaleY == 1)) {
                this.transformMatrix = geo.affineTransformScale(this.transformMatrix, this.scaleX, this.scaleY)
            }

            if (!geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, -this.anchorPointInPixels.x, -this.anchorPointInPixels.y)
            }

            this.isTransformDirty = false

        }

        return this.transformMatrix
    }

  , parentToNodeTransform: function () {
        // TODO
    }

  , nodeToWorldTransform: function () {
        var t = this.nodeToParentTransform()

        var p
        for (p = this.parent; p; p = p.parent) {
            t = geo.affineTransformConcat(t, p.nodeToParentTransform())
        }

        return t
    }

  , worldToNodeTransform: function () {
        return geo.affineTransformInvert(this.nodeToWorldTransform())
    }

  , convertToNodeSpace: function (worldPoint) {
        return geo.pointApplyAffineTransform(worldPoint, this.worldToNodeTransform())
    }

    /**
     * Rectangle bounding box relative to its parent Node
     *
     * @type geometry.Rect
     */
  , get boundingBox () {
        if (this.isTransformDirty || !this._boundingBox) {
            this._updateBoundingBox()
        }
        return this._boundingBox
    }


  , _updateBoundingBox: function () {
        var cs = this.contentSize
          , rect = new geo.Rect(0, 0, cs.width, cs.height)

        this._boundingBox = geo.rectApplyAffineTransform(rect, this.nodeToParentTransform())
    }

    /**
     * Rectangle bounding box relative to the world
     *
     * @type geometry.Rect
     */
  , get worldBoundingBox () {
        var cs = this.contentSize
          , rect = new geo.Rect(0, 0, cs.width, cs.height)
 
        rect = geo.rectApplyAffineTransform(rect, this.nodeToWorldTransform())
        return rect
    }

    /**
     * The area of the node currently visible on screen. Returns an rect even
     * if visible is false.
     *
     * @type geometry.Rect
     */
  , get visibleRect () {
        var s = require('../Director').Director.sharedDirector.winSize
          , rect = new geo.Rect(0, 0, s.width, s.height)

        return geo.rectApplyAffineTransform(rect, this.worldToNodeTransform())
    }

    /**
     * @private
     */
  , _dirtyTransform: function () {
        var oldBB = this.boundingBox
        this.isTransformDirty = true
        this._dirtyDraw(oldBB)
        events.trigger(this, 'transformdirty', oldBB)
    }

  , _dirtyDraw: function (oldBB) {
        events.trigger(this, 'drawdirty', (oldBB instanceof geo.Rect) ? oldBB : void(0))
    }

    /**
     * Schedules a custom method with an interval time in seconds.
     * If time is 0, it will be ticked every frame.
     * If time is 0, it is recommended to use 'scheduleUpdate' instead.
     *
     * If the method is already scheduled, then the interval parameter will
     * be updated without scheduling it again.
     *
     * @opt {String|Function} method Function of method name to schedule
     * @opt {Float} [interval=0] Interval in seconds
     */
  , schedule: function (opts) {
        if (typeof opts == 'string') {
            return this.schedule({method: opts, interval: 0})
        }

        opts.interval = opts.interval || 0

        Scheduler.sharedScheduler.schedule({target: this, method: opts.method, interval: opts.interval, paused: this.isRunning})
    }

    /**
     * Unschedules a custom method
     *
     * @param {String|Function} method
     */
  , unschedule: function (method) {
        if (!method) {
            return
        }

        if (typeof method == 'string') {
            method = this[method]
        }

        Scheduler.sharedScheduler.unschedule({target: this, method: method})
    }

})

module.exports.Node = Node

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
