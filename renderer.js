// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const ipc = require('electron').ipcRenderer

let trayOn = false

// Tray removed from context menu on icon
ipc.on('tray-removed', ()=> {
  ipc.send('remove-tray')
  trayOn = false
})

ipc.on('tray-exit', ()=> {
  ipc.send('exit-tray')
  trayOn = false
})