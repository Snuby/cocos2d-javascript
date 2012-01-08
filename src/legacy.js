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

var pkgs = { _:       'ActionManager Director SpriteFrame TMXXMLParser Animation EventDispatcher SpriteFrameCache Texture2D AnimationCache Scheduler TextureAtlas'.w
           , nodes:   'AtlasNode BatchNode index Label LabelAtlas Layer Menu MenuItem Node PreloadScene ProgressBar RenderTexture Scene Sprite TMXLayer TMXTiledMap Transition'.w
           , actions: 'Action ActionEase ActionInterval ActionInstant'.w
           }

for (var ns in pkgs) {
    var modules = pkgs[ns]
      , dir = (ns == '_') ? '' : ns + '/'

    modules.forEach(function (n) {
        var mod = require('./' + dir + n)
        for (var m in mod) {
            if (mod.hasOwnProperty(m) && typeof mod[m] == 'function') {
                applyAccessors(mod[m])
            }
        }
    })

}
