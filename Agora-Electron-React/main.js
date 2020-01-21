// Basic init
const electron = require('electron')
const {app, BrowserWindow} = electron
const { format } = require('url')
const path = require('path')

const isDevelopment = process.env["NODE_ENV"] === "development"
// Let electron reloads by itself when webpack watches changes in ./app/
if(isDevelopment) {
    //only load reload module in dev mode
    require('electron-reload')(__dirname)
}

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

    if(isDevelopment) {
        mainWindow.openDevTools()
    }

    if(isDevelopment) {
        mainWindow.loadURL(`file://${__dirname}/web-desktop/index.html`)
    } else {
        mainWindow.loadURL(format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }))
    }

})
