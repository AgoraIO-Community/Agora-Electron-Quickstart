// Basic init
const electron = require('electron')
const {app, BrowserWindow} = electron
const { format } = require('url')
const path = require('path')

// Let electron reloads by itself when webpack watches changes in ./app/
const isDevelopment = process.env["NODE_ENV"] === "development"

if(isDevelopment) {
    //only load reload module in dev mode
    require('electron-reload')(__dirname)
}

// To avoid being garbage collected
let mainWindow

app.on('ready', () => {

    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    if(isDevelopment) {
        mainWindow.loadURL(`file://${__dirname}/index.html`)
    } else {
        mainWindow.loadURL(format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }))
    }

})
