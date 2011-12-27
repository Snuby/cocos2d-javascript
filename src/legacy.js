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
    util.extend(obj.prototype, BObject.prototype)
}

applyAccessors(require('./Director').Director)

