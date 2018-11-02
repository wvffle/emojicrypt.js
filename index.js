const emojicrypt = {
  table: '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🤠 🤡 🥳 🥴 🥺 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 👻 👽 🤖 💩 😺 😸 😹 😻 😼 😽 🙀 😿 😾'.split(' '),
  encrypt (str, startIndex) {
    const base = btoa(str.replace(/[^\0-~]/g, ch => "%u" + ("000" + ch.charCodeAt().toString(16)).slice(-4) ))
    if (startIndex < 0) {
      startIndex = 0
    }

    if (startIndex >= this.table.length) {
      startIndex = this.table.length - 1
    }

    if (!startIndex) {
      startIndex = Math.floor(Math.random() * this.table.length)
    }

    startIndex ^= 0

    return this.table[startIndex] + base.replace(/./g, c  => {
      let i = c.charCodeAt(0) - 43 + startIndex
      if (i >= this.table.length) i -= this.table.length
      const res = this.table[i]
      return res ? res : i
    })
  },
  decrypt (str) {
    const startIndex = this.table.indexOf(str.slice(0, 2))
    const base = str.slice(2, str.length).replace(/../g, e => {
      let i = this.table.indexOf(e) + 43 - startIndex
      if (i < 43) i += this.table.length
      return String.fromCharCode(i)
    })

    return unescape(atob(base))
  }
}

module.exports = emojicrypt
