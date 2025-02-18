import { app, BrowserWindow, shell, ipcMain, Menu, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { console } from 'node:inspector'



const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')


async function createWindow() {

  initConfig()
  
  Menu.setApplicationMenu(null)
  win = new BrowserWindow({
    // frame:false,
    title: 'Gamer Finger',
    height:720,
    width:960,
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools({
      mode:"undocked"
    })
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// 处理配置


// 默认中文打开home
// 获取运行时工作目录下config目录下的
let config:any = {
  defaultOpen:"home",
  language:"zh"
}

const WORK_DIR = process.cwd()
const CONFIG_DIR = path.join(WORK_DIR,"config")
console.log("work dir" + WORK_DIR)
console.log("config dir" + CONFIG_DIR)
const CONFIG_FILE = path.join(CONFIG_DIR,"config.json")


function initConfig(){
  // 读取配置文件
  let configStr =  fs.readFileSync(CONFIG_FILE,{
    encoding:"utf-8"
  })
  config = JSON.parse(configStr)
  // 加载本地化文件
  laodLanguage()
}

const LANGUAGE_DIR = path.join(CONFIG_DIR,"languages")

let languageMessage :any = null

function laodLanguage(){
  const languageFile = (config.language+".json")
  const data = fs.readFileSync(path.join(LANGUAGE_DIR,languageFile),{
    encoding:"utf-8"
  })
  languageMessage = JSON.parse(data)
}

// 处理全局事件
/**
 * declare interface Window{
  gamerfinger:{
    changeLanguege: (languege:string) => Promise<any>
    getLanguege: () =>Promise<any>
    saveOpen: (page:string) => Promise<any>
    recentOpen:() => Promise<any>  
  }
}
 */

ipcMain.handle("gamerfinger:getLanguage",()=>{
  return languageMessage
})


ipcMain.handle("gamerfinger:saveOpen",(event,data) =>{
  config.defaultOpen = data
  saveConfigFile()
})

ipcMain.handle("gamerfinger:getConfig",()=>{
  return config
})


ipcMain.handle("gamerfinger:listLanguage",(event,data)=>{
  const files = fs.readdirSync(LANGUAGE_DIR);
  // 过滤出扩展名为.json的文件
  const jsonFiles = files.filter(file => path.extname(file) === '.json');
  return jsonFiles.map(d=>path.parse(d).name)
})


ipcMain.handle("gamerfinger:changeLanguage",(event,data) =>{
  config.language = data
  laodLanguage()
  saveConfigFile()
  return languageMessage
})

ipcMain.handle("gamerfinger:recentOpen",() =>{
  return config.defaultOpen
})

function saveConfigFile(){
  const configStr= JSON.stringify(config,null,2)
  fs.writeFile(CONFIG_FILE,configStr,()=>{})
}


const GAMELIST_CONFIG_DIR = path.join(CONFIG_DIR,"sl")
const GAMELIST_CONFIG_FILE = path.join(GAMELIST_CONFIG_DIR,"gamelist.json")

/**
 * [
    {
        "game":"只狼",
        "from":"${HOMEDIR}/AppData/Roaming/Sekiro",
        "to":""
    }
]
 */

const ENV_SET = {
  HOMEDIR:os.homedir()
}


let gamelist = []
ipcMain.handle("gamerfinger:getSL",data =>{
  loadGameList()
  return gamelist
})

ipcMain.handle("gamerfinger:editSL",(event,data) =>{
  
  const gameData = JSON.parse(data)
  let isEdit = false
  for (const items of gamelist) {
    if(gameData.game == items.game){
      // 已存在的配置。直接更新即可
      isEdit = true
      items.from = gameData.from
      addLog(items,"config update")
    }
  }
  if(!isEdit){
    // 补全to
    gameData.to = randomUUID()
    addLog(gameData,"config update")
    gamelist.push(gameData)
  }

  saveGamelist()

  return gamelist
})


ipcMain.handle("gamerfinger:selectFile",(event,data) =>{
  const open = data ? "openDirectory" : "openFile"
  const mainWindow = BrowserWindow.getFocusedWindow() // 获取当前窗口
  return dialog.showOpenDialog(mainWindow,{
    properties:[open,"showHiddenFiles"],
  })
})

ipcMain.handle("gamerfinger:triggerLoad",(event,data) =>{
  
  let dataObj = JSON.parse(data)
  dataObj= gamelist.find(d => dataObj.game == d.game)
  console.log(dataObj)
  const from = dataObj.from
  const fromPath = path.parse(from)
  const to = dataObj.to
  const toPath = path.join(GAMELIST_CONFIG_DIR,to,fromPath.base)
  // 恢复存档从to到from
  try{
    copyFiles(toPath,from)
    addLog(dataObj,"load success")
  }catch(e){
    console.log(e)
    addLog(dataObj,e.message)
  }
  saveGamelist()

  return dataObj
})

ipcMain.handle("gamerfinger:triggerSave",(event,data) =>{
  let dataObj = JSON.parse(data)
  dataObj= gamelist.find(d => dataObj.game == d.game)
  const from = dataObj.from
  const fromPath = path.parse(from)
  const to = dataObj.to
  const toPath = path.join(GAMELIST_CONFIG_DIR,to,fromPath.base)

  console.log("to:",toPath)

  // 保存存档从from到to
  try{
    
    copyFiles(from,toPath)
    dataObj.last = new Date().toLocaleString()
    addLog(dataObj,"save success")
  }catch(e){
    addLog(dataObj,e.message)
  }
  saveGamelist()
  return dataObj
})

function loadGameList(){
  const gamelistStr = fs.readFileSync(GAMELIST_CONFIG_FILE,{
    encoding:"utf-8"
  })
  let needSave = false
  gamelist = JSON.parse(gamelistStr)
  gamelist = gamelist.map(i =>{
    if(i.to == ''){
      needSave = true
      i.to = randomUUID()
    }

    for (const key in ENV_SET) {
      if (Object.prototype.hasOwnProperty.call(ENV_SET, key)) {
        const value = ENV_SET[key];
        i.from = i.from.replaceAll("${"+key+"}",value)
      }
    }
    return i
  })
  if(needSave){
    saveGamelist()
  }
}

function saveGamelist(){
  const gamelistStr= JSON.stringify(gamelist,null,2)
  fs.writeFile(GAMELIST_CONFIG_FILE,gamelistStr,()=>{})
}


function addLog(item:any ,info:string){
  const now = new Date().toLocaleString()
  if(item.logs == undefined || !(item.logs instanceof Array) ){
    item.logs = []
  }
  if(item.logs.length >=5){
    item.logs.shift()
  }
  item.logs.push(now + ": "+info)
}


function copyFiles(from:string,to:string){
  // 确保路径存在
  if (!fs.existsSync(from)) {
      throw new Error(`Source path "${from}" does not exist`);
  }

  // 确保目标路径的目录存在
  const dir = path.dirname(to);
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
  }

  // 检查源路径是文件还是文件夹
  const stats = fs.statSync(from);

  if (stats.isFile()) {
      // 如果是文件，复制文件
      fs.copyFileSync(from, to);
  } else if (stats.isDirectory()) {
      // 如果是文件夹，复制文件夹内容
      fs.mkdirSync(to, { recursive: true });

      fs.readdirSync(from).forEach((item) => {
          const srcPath = path.join(from, item);
          const destPath = path.join(to, item);
          copyFiles(srcPath, destPath);
      });
  }
}


