var ssbKeys = require('ssb-keys')
var create = require('ssb-validate').create
var path = require('path')
var ref = require('ssb-ref')

exports.gives = {
  identity: {
    list: true, main: true, create: true, unbox: true, publish: true
  }
}
exports.needs = {
  sbot: { getLatest: 'first', add: 'first' }
//config ?
}

exports.create = function (api) {
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
        if(!id) id = keys.id
        if(id != keys.id) return cb(new Error('unknown identity'))
        api.sbot.getLatest(id, function (err, data) {
          var state = {
            id: data.key,
            sequence: data.value.sequence,
            timestamp: data.value.timestamp,
            queue: []
          }
          if(content.recps)
            content = ssbKeys.box(content, content.recps.map(function (e) {
              return ref.isFeed(e) ? e : e.link
            }))

          var msg = create(state, keys, null, content, Date.now())
          api.sbot.add(msg, cb)
        })
      }
    }
  }
}





