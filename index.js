(() => {
  const isModule = typeof module !== 'undefined' && 'exports' in module

  const toString = str => isModule ? Buffer.from(str, 'base64').toString() : atob(str)
  const toBase = str => isModule ? Buffer.from(str).toString('base64') : btoa(str)

  const table = '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🤠 🤡 🥳 🥴 🥺 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 👻 👽 🤖 💩 😺 😸 😹 😻 😼 😽 🙀 😿 😾'.split(' ')

  const emojicrypt = {
    encrypt (str = '', startIndex) {
      if (typeof str === 'object') str = JSON.stringify(str)
      const base = toBase(str.toString().replace(/[^\0-~]/g, ch => "%u" + ("000" + ch.charCodeAt().toString(16)).slice(-4) ))
      if (startIndex < 0) {
        startIndex = 0
      }

      if (startIndex >= table.length) {
        startIndex = table.length - 1
      }

      if (!startIndex) {
        startIndex = Math.floor(Math.random() * table.length)
      }

      startIndex ^= 0

      return table[startIndex] + base.replace(/./g, c  => {
        let i = c.charCodeAt(0) - 43 + startIndex
        if (i >= table.length) i -= table.length
        const res = table[i]
        return res ? res : i
      })
    },
    decrypt (str = '💩') {
      const startIndex = table.indexOf(str.slice(0, 2))
      const base = str.toString().slice(2, str.toString().length).replace(/../g, e => {
        let i = table.indexOf(e) + 43 - startIndex
        if (i < 43) i += table.length
        return String.fromCharCode(i)
      })

      const res = unescape(toString(base))
      try {
        return JSON.parse(res)
      } catch (e) {
        return res
      }
    }
  }

  if (isModule) {
    module.exports = emojicrypt
  } else {
    window.emojicrypt = emojicrypt
  }
})()
