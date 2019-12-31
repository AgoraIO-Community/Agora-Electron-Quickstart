// Basic init
const electron = require('electron')
const {app, BrowserWindow} = electron

// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(__dirname)

const development = (process.env.NODE_ENV === 'development')

// To avoid being garbage collected
let mainWindow

app.on('ready', () => {

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            nodeIntegration: true
        }
    })

    if(development) {
        mainWindow.openDevTools()
    }

    mainWindow.loadURL(`file://${__dirname}/index.html`)

})
