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
    var container = document.getElementById("middle-container");
    var div = '<div class="block"><div class="panel-in-block"><button class="button-in-panel"></button></div>12/05 14:27:31 06-12-001 伊兆<br>172-24155213 RL 放行</div>';
                
              
               
    /*while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }*/
    
        container.innerHTML += div;
        // Append a line break 
//        container.appendChild(document.createElement("br"));
    


}