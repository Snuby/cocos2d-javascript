var remote_resources = require('remote_resources')
  , RemoteFont = require('./RemoteFont').RemoteFont

var originalGetRemoteResourceConstructor = remote_resources.getRemoteResourceConstructor

remote_resources.getRemoteResourceConstructor = function (mimetype) {
    var RemoteObj
    if (/\bfont\b/.test(mimetype)) {
        RemoteObj = RemoteFont
    } else {
        RemoteObj = originalGetRemoteResourceConstructor(mimetype)
    }

    return RemoteObj
}
