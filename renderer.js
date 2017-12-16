// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const ipc = require('electron').ipcRenderer

const trayBtn = document.getElementById('put-in-tray')
let trayOn = false

trayBtn.addEventListener('click', (event)=> {
  if (trayOn) {
    trayOn = false
    ipc.send('remove-tray')

  } else {
    trayOn = true
    const message = 'Click demo again to remove.'
    document.getElementById('text-panel').innerHTML = message
    ipc.send('put-in-tray')
  }
})
// Tray removed from context menu on icon
ipc.on('tray-removed', ()=> {
  ipc.send('remove-tray')
  trayOn = false
})

ipc.on('tray-exit', ()=> {
  ipc.send('exit-tray')
  trayOn = false
})