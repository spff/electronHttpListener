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
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let hijectOnClose = true






var first_show = true
var config

let appIcon = null


function put_in_tray(event) {
    const iconName = process.platform === 'win32' ? 'logo.png' : 'logo.png'
    const iconPath = path.join(__dirname, iconName)
    appIcon = new Tray(iconPath)
    const contextMenu = Menu.buildFromTemplate([{
            label: 'Pop Up',
            click: function() {
                event.sender.send('tray-removed')
            }
        },
        {
            label: 'Exit',
            click: function() {
                event.sender.send('tray-exit')
            }
        }
    ])
    appIcon.setToolTip('Right click to show menu')
    appIcon.setContextMenu(contextMenu)

    mainWindow.hide()
}

function remove_tray() {
    console.log("remove-tray")

    if (appIcon != null)
        appIcon.destroy()
    mainWindow.show()

}



ipc.on('log-from-renderer', (event, data) => {
    console.log("log-from-renderer :" + data)
})

ipc.on('put-in-tray', put_in_tray)

ipc.on('remove-tray', remove_tray)


ipc.on('exit-tray', () => {
    console.log("exit")

    hijectOnClose = false
    app.quit()

})


ipc.on("console", (ev) => {
    var args = [].slice.call(arguments, 1)
    var r = console.log.apply(console, args)
    ev.returnValue = [r];
});
ipc.on("app", function(ev, msg) {
    var args = [].slice.call(arguments, 2)
    ev.returnValue = [app[msg].apply(app, args)]
});



function set_connection() {


    var socket = require('socket.io-client')(config.interServer)
    socket.on('connect', function() {
        console.log('[%s]on connect...', socket.id)
        //TODO replace to the real emplayeeId read from config file
        socket.emit('login', JSON.stringify({ employeeId: config.employeeId }))
        remove_tray()
    })

    socket.on('news', function(data) {
        console.log('[%s]on news...', socket.id, data);

        remove_tray()
        mainWindow.webContents.send('new-message', { msg: data })
    });

    socket.on('disconnect', function() {
        console.log('[%s]on disconnect....', socket.id);
        //TODO should notify user
    })

}

let configPath = ['config.ini', '../../../config.ini']
function read_config_and_connect(index) {
    console.log("read_config_and_connect")
    if (!first_show && index == 0)
        return
    first_show = false

    fs.readFile(path.resolve(__dirname, configPath[index]), 'utf8', (err, contents) => {
        if (err) {
        	console.log(err)
            if(index+1 < configPath.length)
            	read_config_and_connect(index +1)
            else
            	console.log("no valid config")
            return
        }
        console.log("hi")
        console.log(contents)

        config = JSON.parse(contents.replace(/^\uFEFF/, ''))
        mainWindow.webContents.send('bon-jour', { msg: config.employeeName })


        set_connection()
    })



}

function createWindow() {


    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 480, height: 720, resizable: false, fullscreenable: false, show: false })
    mainWindow.setMenuBarVisibility(false)




    // Emitted when the window is closed.

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow.on('closed', () => {
        mainWindow = null
    })


    mainWindow.on('close', (event) => {
        console.log("on close")
        if (hijectOnClose) {
            put_in_tray(event)
            event.preventDefault()
        }
    })

    mainWindow.on('minimize', put_in_tray)

    mainWindow.on('ready-to-show', () => { mainWindow.show() })

    mainWindow.on('show', () => { setTimeout(read_config_and_connect, 20, 0) })


    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    //mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (appIcon)
        appIcon.destroy()

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.