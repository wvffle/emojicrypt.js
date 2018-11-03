(() => {
  const isModule = typeof module !== 'undefined' && 'exports' in module

  const toString = str => isModule ? Buffer.from(str, 'base64').toString() : atob(str)
  const toBase = str => isModule ? Buffer.from(str).toString('base64') : btoa(str)

  const table = '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🤠 🤡 🥳 🥴 🥺 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 👻 👽 🤖 💩 😺 😸 😹 😻 😼 😽 🙀 😿 😾'.split(' ')

  const ZWNJ = unescape('%u200c')

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

      return table[startIndex] + ZWNJ + base.replace(/./g, c  => {
        let i = c.charCodeAt(0) - 43 + startIndex
        if (i >= table.length) i -= table.length
        const res = table[i]
        return (res ? res : i) + ZWNJ
      }).slice(0, -1)
    },
    decrypt (str = '💩', debug = false) {
      const emojis = str.split(ZWNJ)
      const start = emojis.shift()
      const startIndex = table.indexOf(start)

      if (debug) {
        console.debug(`Start index: ${startIndex} (${start})`)
      }

      const base = emojis.map(e => {
        let i = table.indexOf(e) + 43 - startIndex
        if (i < 43) i += table.length

        if (debug) {
          console.debug(`Changing ${e} -> ${i} -> ${String.fromCharCode(i)}`)
        }

        return String.fromCharCode(i)
      }).join('')


      if (debug) {
        console.debug(`Base64: ${base}`)
      }

      const res = unescape(toString(base))
      if (debug) {
        console.debug(`Decoded: ${res}`)
      }
      try {
        return JSON.parse(res)
      } catch (e) {
        return res
      }
    },
  }

  if (isModule) {
    module.exports = emojicrypt
  } else {
    window.emojicrypt = emojicrypt
  }
})()
