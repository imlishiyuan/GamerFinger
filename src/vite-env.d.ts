/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
  gamerfinger:{
    changeLanguage: (languege:string) => Promise<any>
    getLanguage: () =>Promise<any>
    getConfig: () =>Promise<any>
    listLanguage: () =>Promise<any>
    
    saveOpen: (page:string) => Promise<any>
    recentOpen:() => Promise<any>  
    getSL:()=>Promise<any>,
    editSL:(data:string)=>Promise<any>,
    selectFile:(openDir:boolean)=>Promise<any>,
    triggerLoad:(data:string)=>Promise<any>,
    triggerSave:(data:string)=>Promise<any>,
  }
}
