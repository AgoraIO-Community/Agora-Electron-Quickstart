const { ipcMain, BrowserWindow } = require('electron')

ipcMain.on('exec-source', (event, arg) => {
  let win = BrowserWindow.getFocusedWindow()
  win.webContents.executeJavaScript(arg.code)
})