const fs = require('fs')
const path = require('path')
const ace = require('./ace/ace')
const codeBlocksWithPaths = document.querySelectorAll('code[data-path]')
const {ipcRenderer} = require('electron')

ace.config.set('basePath', path.join(__dirname, './ace'))

Array.prototype.forEach.call(codeBlocksWithPaths, (code) => {
  const codePath = path.join(__dirname, '..', code.dataset.path)
  const extension = path.extname(codePath)
  code.classList.add(`language-${extension.substring(1)}`)
  code.textContent = fs.readFileSync(codePath)
})

ipcRenderer.on('exec-source-error', (event, arg) => {
  debugger
})

document.addEventListener('DOMContentLoaded', () => {
  const editors = document.querySelectorAll('.editor')
  Array.prototype.forEach.call(editors, (editorDom) => {
    let editor = ace.edit(`${editorDom.id}`);
    editor.setTheme("ace/theme/textmate");
    editor.session.setMode("ace/mode/javascript");
    editor.setOption('maxLines', Infinity);

    let demoBtn = document.querySelector(`.demo-button[data-target="${editorDom.id}"]`)
    demoBtn.addEventListener('click', () => {
      ipcRenderer.send('exec-source', {
        code: editor.getValue(),
        id: editorDom.id
      })
    })
  })
})
