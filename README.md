# emojicrypt with unicode support

```js
const emojicrypt = require('emojicrypt')

const encrypted1 = emojicrypt.encrypt('emojicrypt.js 💩')
encrypted1 // 🤪😆😃🤒😴🥰🙄😶😐😙😏😶😌😚👹🤧😮😙😜😈😶😚😃😿🤮😻🤕😿😶😚😃😾😐😅😁😑🤫

const encrypted2 = emojicrypt.encrypt('emojicrypt.js 💩')
encrypted1 == encrypted2 // false

const decrypted1 = emojicrypt.decrypt(encrypted1)
decrypted1 // emojicrypt.js 💩

const decrypted2 = emojicrypt.decrypt(encrypted2)
decrypted1 == decrypted2 // true

```
