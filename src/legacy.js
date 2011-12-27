/**
 * @fileOverview
 *
 * Provides support for deprecated methods
 */

var BObject = require('./libs/bobject').BObject

exports.applyAccessors = function (obj) {
    obj.get = BObject.get
    obj.set = BObject.set
    obj.prototype.get = BObject.prototype.get
    obj.prototype.set = BObject.prototype.set
}
