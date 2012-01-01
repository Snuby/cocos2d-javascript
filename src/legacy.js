/**
 * @fileOverview
 *
 * Provides support for deprecated methods
 */

var BObject = require('./libs/bobject').BObject
  , util = require('./libs/util')

/**
 * @ignore
 */
function applyAccessors (obj) {
    obj.get = BObject.get
    obj.set = BObject.set
    obj.extend = BObject.extend
    obj.create = BObject.create

    'get set extend triggerBeforeChanged triggerChanged'.w
        .forEach(function (prop) {
            obj.prototype[prop] = BObject.prototype[prop]
            if (!obj.prototype.hasOwnProperty('init')) {
                obj.prototype.init = obj
            }
        })
}

var nodes = 'Node Scene Layer Sprite Menu MenuItem RenderTexture BatchNode Label AtlasNode LabelAtlas TMXLayer TMXTiledMap Transition'.w
nodes.forEach(function (n) {
    var mod = require('./nodes/' + n)
    for (var m in mod) {
        if (mod.hasOwnProperty(m)) {
            applyAccessors(mod[m])
        }
    }
})
var actions = 'Action ActionInterval ActionInstant ActionEase'.w
actions.forEach(function (a) {
    var mod = require('./actions/' + a)
    for (var m in mod) {
        if (mod.hasOwnProperty(m)) {
            applyAccessors(mod[m])
        }
    }
})
applyAccessors(require('./Director').Director)
applyAccessors(require('./Scheduler').Scheduler)
/*
applyAccessors(require('./actions/Action').Action)
*/

