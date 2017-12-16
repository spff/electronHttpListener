// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const ipc = require('electron').ipcRenderer


const textPanel = document.getElementById('text-panel')

let trayOn = false

// Tray removed from context menu on icon
ipc.on('tray-removed', ()=> {
  ipc.send('remove-tray')
    shLog("remove-tray")

  trayOn = false
})

ipc.on('tray-exit', ()=> {
  ipc.send('exit-tray')
  trayOn = false
})

ipc.on('new-message', (event, data)=> {
  shLog("render " + data.msg)
  textPanel.innerHTML = "" + data.msg

})


function shLog(message){
  ipc.send('log-from-renderer', message)
}
