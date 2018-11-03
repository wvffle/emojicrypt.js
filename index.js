(() => {
  const isModule = typeof module !== 'undefined' && 'exports' in module

  const toString = str => isModule ? Buffer.from(str, 'base64').toString() : atob(str)
  const toBase = str => isModule ? Buffer.from(str).toString('base64') : btoa(str)

  const table = [
    "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍",
    "😘", "🥰", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶",
    "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜",
    "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "🙁", "😖", "😞", "😟",
    "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶",
    "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇",
    "🤠", "🤡", "🥳", "🥴", "🥺", "🤥", "🤫", "🤭", "🧐", "🤓", "😈", "👿", "👹",
    "👺", "💀", "👻", "👽", "🤖", "💩", "😺", "😸", "😹", "😻", "😼", "😽", "🙀",
    "😿", "😾", "🤲", "👐", "🙌", "👏", "🤝", "👍", "👎", "👊", "✊", "🤛", "🤜",
    "🤞", "🤟", "🤘", "👌", "👈", "👉", "👆", "👇", "✋", "🤚", "🖐", "🖖", "👋",
    "🤙", "🖕", "🦊", "🐼", "🐺", "🐗", "🦄", "💎", "🧡", "💛", "💚", "💙", "💜",
  ]

  const ZWNJ = unescape('%u200c') // 0 width non-joiner

  // Visual compression
  const VC = {
    map: [
      unescape('%u200b'), // 0 width space
      unescape('%u200d'), // 0 width joiner
    ],
    compress (c) {
      const binary = c.toString(2)

      return binary.replace(/./g, bit => VC.map[bit])
    },
    decompress (cs) {
      let binary = ''
      for (const char of cs) {
        binary += VC.map.indexOf(char)
      }

      return String.fromCharCode(parseInt(binary, 2))
    }
  }

  const emojicrypt = {
    encrypt (str = '', startIndex = 0, visualCompression = false) {
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

      let chars = 1
      let res = table[startIndex] + ZWNJ

      if (visualCompression !== false) {
        visualCompression -= 1

        if (visualCompression < 2) {
          visualCompression = 2
        }

        visualCompression ^= 0

        const start = base.slice(0, -visualCompression)
        const end = base.slice(base.length - visualCompression, base.length)

        return res + start.replace(/./g, c => {
          return VC.compress(c.charCodeAt(0)) + ZWNJ
        }) + end.replace(/./g, c  => {
          let i = c.charCodeAt(0) - 43 + startIndex
          if (i >= table.length) i -= table.length

          const res = table[i]
          return (res ? res : i) + ZWNJ
        }).slice(0, -1)
      }

      return res + base.replace(/./g, c  => {
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
        if (VC.map.includes(e[0])) {
          const char = VC.decompress(e)

          if (debug) {
            console.debug(`Changing ${e.split('').map(c => VC.map.indexOf(c)).join('')} -> ${char}}`)
          }

          return char
        }

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
    _test (compression = false) {
      let pass = true
      for (let i = 0; i < 10000; ++i) {
      	const str = Math.random() + ''
        const enc = emojicrypt.encrypt(str, undefined, compression)
        try {
          const dec = emojicrypt.decrypt(enc)
          if (dec != str) {
            throw new Error('src/dec mismatch: ' + str + ' / ' + dec)
          }
        } catch (e) {
          console.error(i + ': ' + enc)
          console.error(e)
          try {
            emojicrypt.decrypt(enc, true)
          } catch (e) {}
          pass = false
          break;
        }
      }

      return pass
    }

  }

  if (isModule) {
    module.exports = emojicrypt
  } else {
    window.emojicrypt = emojicrypt
  }
})()
