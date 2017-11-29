const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const Menu = electron.Menu
const Tray = electron.Tray


const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.setMenuBarVisibility(false)


  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))




  function put_in_tray(event) {
    const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png'
    const iconPath = path.join(__dirname, iconName)
    appIcon = new Tray(iconPath)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Remove',
        click: function () {
          event.sender.send('tray-removed')
        }
      },
      {
        label: 'Exit',
        click: function () {
          event.sender.send('tray-exit')
        }
      }
    ])
    appIcon.setToolTip('Electron Demo in the tray.')
    appIcon.setContextMenu(contextMenu)

    mainWindow.hide()
  }

  function remove_tray() {
    appIcon.destroy()
    mainWindow.show()

  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()



  // Emitted when the window is closed.

  // Dereference the window object, usually you would store windows
  // in an array if your app supports multi windows, this is the time
  // when you should delete the corresponding element.
  mainWindow.on('closed', function(){
    mainWindow = null
  })



  mainWindow.on('close', function (event){
    console.log("on close")

    put_in_tray(event)
    event.preventDefault()
  })

  mainWindow.on('minimize', put_in_tray)


	let appIcon = null

	ipc.on('put-in-tray', put_in_tray)

	ipc.on('remove-tray', remove_tray)


  ipc.on('exit-tray', function () {
    app.quit()
    
  })


  ipc.on("console", function (ev) {
        var args = [].slice.call(arguments, 1);
        var r = console.log.apply(console, args)
        ev.returnValue = [r];
  });
  ipc.on("app", function (ev, msg) {
      var args = [].slice.call(arguments, 2);
      ev.returnValue = [app[msg].apply(app, args)]
  });
  

  var window = new BrowserWindow({show: false})
  window.loadURL("file://" + __dirname + "/app.html")
  window.webContents.once("did-finish-load", function () {
      var http = require("http");
      var crypto = require("crypto");


      const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('okay');
        console.log("get")
        remove_tray()
      });
      
      // now that proxy is running
      server.listen(1337, '127.0.0.1');

      console.log("http://localhost:1337/")
  })




}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (appIcon)
    appIcon.destroy()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


