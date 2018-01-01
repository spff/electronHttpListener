// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const ipc = require('electron').ipcRenderer


const latex = document.getElementById('latex')

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
  shLog(JSON.stringify(data.msg))
  latex.innerHTML = JSON.stringify(data.msg)
  addBlock("", "")
})


function shLog(message){
  ipc.send('log-from-renderer', message)
}




function addBlock(str1, str2){
  // Container <div> where dynamic content will be placed
  var container = document.getElementById("scroll-container");
  
  var block = document.createElement("div")
  block.setAttribute("class", "block");
  var panel = document.createElement("div")
  panel.setAttribute("class", "panel-in-block");
  var button = document.createElement("div")
  button.setAttribute("class", "button-in-panel");

  button.addEventListener("click", (e)=>{
    block.remove()
    //TODO call renderer.js->main.js or call main.js to send remove to nodeInterServer->remove from SQL
  })

  panel.appendChild(button)
  block.appendChild(panel)
  var text = document.createElement("div")
  text.innerHTML += "12/05 14:27:31 06-12-001 伊兆<br>172-24155213 RL 放行"
  block.appendChild(text)
  
  container.appendChild(block)

    


}
