var { h, computed, when } = require('mutant')
var nest = require('depnest')

exports.needs = nest({
  'keys.sync.id': 'first',
  'message.obs.likes': 'first',
  'sbot.async.publish': 'first'
})

exports.gives = nest('message.html.action')

exports.create = (api) => {
  return nest('message.html.action', function like (msg) {
    var id = api.keys.sync.id()
    var liked = computed([api.message.obs.likes(msg.key), id], doesLike)
    return h('a', {
      href: '#',
      events: {
        click: (ev) => {
          if (liked()) {
            publishLike(msg, false)
          } else {
            publishLike(msg, true)
          }
        }
      }
    }, when(liked, 'Unlike', 'Like'))
  })

  function publishLike (msg, status = true) {
    var dig = status ? {
      type: 'vote',
      vote: { link: msg.key, value: 1, expression: 'Dig' }
    } : {
      type: 'vote',
      vote: { link: msg.key, value: 0, expression: 'Undig' }
    }
    if (msg.value.content.recps) {
      dig.recps = msg.value.content.recps.map(function (e) {
        return e && typeof e !== 'string' ? e.link : e
      })
      dig.private = true
    }
    api.sbot.async.publish(dig)
  }
}

function doesLike (likes, userId) {
  return likes.includes(userId)
}
