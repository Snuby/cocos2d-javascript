'use strict'

/** @ignore
 * XML Node types
 */
var ELEMENT_NODE                = 1
  , ATTRIBUTE_NODE              = 2
  , TEXT_NODE                   = 3
  , CDATA_SECTION_NODE          = 4
  , ENTITY_REFERENCE_NODE       = 5
  , ENTITY_NODE                 = 6
  , PROCESSING_INSTRUCTION_NODE = 7
  , COMMENT_NODE                = 8
  , DOCUMENT_NODE               = 9
  , DOCUMENT_TYPE_NODE          = 10
  , DOCUMENT_FRAGMENT_NODE      = 11
  , NOTATION_NODE               = 12

/**
 * @class
 * An object representation of an XML Property List file
 *
 * @opt {String} [file] The path to a .plist file
 * @opt {String} [data] The contents of a .plist file
 */
function Plist (opts) {
    var file = opts['file'],
        data = opts['data']

    if (file && !data) {
        data = resource(file)
    }


    var parser = new DOMParser(),
        doc = parser.parseFromString(data, 'text/xml'),
        plist = doc.documentElement

    if (plist.tagName != 'plist') {
        throw "Not a plist file"
    }


    // Get first real node
    var node = null
    for (var i = 0, len = plist.childNodes.length; i < len; i++) {
        node = plist.childNodes[i]
        if (node.nodeType == ELEMENT_NODE) {
            break
        }
    }

    this.data = this._parseNode(node)
}

Plist.inherit(Object, /** @lends Plist# */ {
    /**
     * The unserialized data inside the Plist file
     * @type Object
     */
    data: null,

    /**
     * @private
     * Parses an XML node inside the Plist file
     * @returns {Object/Array/String/Integer/Float} A JS representation of the node value
     */
    _parseNode: function(node) {
        var data = null
        switch(node.tagName) {
        case 'dict':
            data = this._parseDict(node);
            break
        case 'array':
            data = this._parseArray(node);
            break
        case 'string':
            // FIXME - This needs to handle Firefox's 4KB nodeValue limit
            data = node.firstChild.nodeValue
            break
        case 'false':
            data = false
            break
        case 'true':
            data = true
            break
        case 'real':
            data = parseFloat(node.firstChild.nodeValue)
            break
        case 'integer':
            data = parseInt(node.firstChild.nodeValue, 10)
            break
        }

        return data
    },

    /**
     * @private
     * Parses a <dict> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Object} A simple key/value JS Object representing the <dict>
     */
    _parseDict: function(node) {
        var data = {}

        var key = null
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i]
            if (child.nodeType != ELEMENT_NODE) {
                continue
            }

            // Grab the key, next noe should be the value
            if (child.tagName == 'key') {
                key = child.firstChild.nodeValue
            } else {
                // Parse the value node
                data[key] = this._parseNode(child)
            }
        }


        return data
    },

    /**
     * @private
     * Parses an <array> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Array} A simple JS Array representing the <array>
     */
    _parseArray: function(node) {
        var data = []

        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i]
            if (child.nodeType != ELEMENT_NODE) {
                continue
            }

            data.push(this._parseNode(child))
        }

        return data
    }
})

exports.Plist = Plist

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
