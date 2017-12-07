var ssbKeys = require('ssb-keys')
var path = require('path')

exports.gives = {
  identity: {
    list: true, main: true, create: true, unbox: true
  }
}
exports.needs = {
//config ?
}

exports.create = function () {
  var keys = ssbKeys.loadOrCreateSync(path.join(process.env.HOME, '.ssb/secret'))
  //TODO: load all identites stored in ~/.ssb/identities/...
  return {
    identity: {
      list: function () { return [keys.id]},
      main: function () { return keys.id },
      create: function () {
        //generate a new identity
      },
      unbox: function (data) {
        if('string' !== typeof data.value.content) return data
        
        var content = ssbKeys.unbox(data.value.content, keys)
        var msg = data.value
        return {
          key: data.key,
          value: {
            previous: msg.previous,
            author: msg.author,
            sequence: msg.sequence,
            hash: msg.hash,
            content: content,
            signature: msg.signature
          }
        }
      }
    }
  }
}






