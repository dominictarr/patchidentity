var ssbKeys = require('ssb-keys')
var create = require('ssb-validate').create
var path = require('path')
var ref = require('ssb-ref')

function isFunction (f) {
  return 'function' === typeof f
}

var config = require('ssb-config/inject')(process.env.ssb_appname)

exports.gives = {
  identity: {
    list: true, main: true, create: true, unbox: true, publish: true
  },
}
exports.needs = {
  sbot: {
    getLatest: 'first', add: 'first',
    identities: { publishAs: 'first' }
  },
//config ?
}

exports.create = function (api) {
  var keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))
  //TODO: load all identites stored in ~/.ssb/identities/...
  return {
    identity: {
      list: function () {
        throw new Error('use sbot.identities.list(cb)')
//        return [keys.id]
      },
      main: function () { return keys.id },
      create: function () {
        //generate a new identity
      },
      unbox: function (data) {
        if('string' !== typeof data.value.content) return data
        var content = ssbKeys.unbox(data.value.content, keys)
        if(!content) return null
        var msg = data.value
        return {
          key: data.key,
          value: {
            previous: msg.previous,
            sequence: msg.sequence,
            author: msg.author,
            timestamp: msg.timestamp,
            hash: msg.hash,
            content: content,
            private: true,
            signature: msg.signature
          },
          timestamp: data.timestamp
        }
      },
      publish: function (content, id, cb) {
        if(isFunction(id)) cb = id, id = keys.id
        if(!cb) cb = function (err) {
          if(err) console.error(err)
        }
        if(!id) id = keys.id
        api.sbot.identities.publishAs({content: content, id: id}, cb)
      }
    }
  }
}

