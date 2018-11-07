import * as b64 from '@waff/b64'
import viscomp from '@waff/viscomp'
import ifEmoji from 'if-emoji'

const table = [
  "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍",
  "😘", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄",
  "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝",
  "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "🙁", "😖", "😞", "😟", "😤",
  "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "😳", "🤪", "😵",
  "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🤠", "🤡", "🤥",
  "🤫", "🤭", "🧐", "🤓", "😈", "👿", "👹", "👺", "💀", "👻", "👽", "🤖", "💩",
  "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🤲", "👐", "🙌", "👏",
  "🤝", "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "🤟", "🤘", "👌", "👈", "👉",
  "👆", "👇", "✋", "🤚", "🖖", "👋", "🤙", "🖕", "🦊", "🐼", "🐺", "🐗", "🦄",
  "💎", "🧡", "💛", "💚", "💙", "💜",
].filter(ifEmoji)

const ZWNJ = viscomp.ZWNJ
viscomp.map[0] = viscomp.ZWJ

const emojicrypt = {
  encrypt (str = '', startIndex = 0, visualCompression = false) {
    if (typeof str === 'object') str = JSON.stringify(str)
    const base = b64.encode(str.toString().replace(/[^\0-~]/g, ch => "%u" + ("000" + ch.charCodeAt().toString(16)).slice(-4) ))
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

      if (visualCompression < 1) {
        visualCompression = 1
      }

      visualCompression ^= 0

      const start = base.slice(0, -visualCompression)
      const end = base.slice(base.length - visualCompression, base.length)

      return res + start.replace(/./g, c => {
        return viscomp.compress(c.charCodeAt(0)) + ZWNJ
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
    let startIndex = table.indexOf(start)

    if (startIndex === -1) {
      startIndex = viscomp.decompress(start)
    }

    if (debug) {
      console.debug(`Start index: ${startIndex} (${start})`)
    }

    const base = emojis.map(e => {
      if (viscomp.map.includes(e[0])) {
        const char = viscomp.decompress(e)

        if (debug) {
          console.debug(`Changing ${e.split('').map(c => viscomp.map.indexOf(c)).join('')} -> ${char}}`)
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

    const res = unescape(b64.decode(base))
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

export default emojicrypt
