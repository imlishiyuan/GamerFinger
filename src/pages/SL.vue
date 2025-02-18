<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import router from '../router';

const route= useRoute()


const gameList =  ref<any[]>([])

const activeGame = ref<any>({})

function save(){
  window.gamerfinger.triggerSave(JSON.stringify(activeGame.value)).then(data=> activeGame.value = data)
}

function load(){
  console.log("triggerLoad",activeGame.value)
  window.gamerfinger.triggerLoad(JSON.stringify(activeGame.value)).then(data=> activeGame.value = data)
}

function selectFile(){
  window.gamerfinger.selectFile(editor.value.openDir).then(data=>{
    if(data.canceled){
      return 
    }
    const path = data.filePaths[0]
    editGameInfo.value.from = path
  })
}

function editGame(){
  
  if(editor.value.fromAdd){
    const exist = gameList.value.find(d => d.game == editGameInfo.value.game)
    if(exist != undefined){
      editor.value.errorMsg.gameMsg = messages.value.sl_game_msg
      return
    }
  
    if(editGameInfo.value.game==undefined || editGameInfo.value.game==null || editGameInfo.value.game.length < 1){
      editor.value.errorMsg.locationMsg = messages.value.sl_game_msg
      return
    }}

    if(editGameInfo.value.from==undefined || editGameInfo.value.from==null || editGameInfo.value.from.length < 1){
      editor.value.errorMsg.locationMsg = messages.value.sl_location_msg
      return
    }
    window.gamerfinger.editSL(JSON.stringify(editGameInfo.value)).then(data=>{
      
      gameList.value = data
      let game= gameList.value.find(d => d.game == activeGame.value.game)
      if(game != undefined){
        activeGame.value = game
      }
      game= gameList.value.find(d=>d.game == editGameInfo.value.game)
      if(game != undefined){
        editGameInfo.value = game
      }
      
      editor.value.show = false
    })
}

function loadGames(){
  window.gamerfinger.getSL().then(data=>{
    gameList.value = data
    

    let game= gameList.value.find(d=>d.game == activeGame.value.game)
    if(game != undefined){
      activeGame.value = game
    }

    game= gameList.value.find(d=>d.game == editGameInfo.value.game)
    if(game != undefined){
      editGameInfo.value = game
    }
  })
}

function changeActive(game:any){
  activeGame.value = game
}

function goHome(){
  router.push({
    name:"home",
  })
}

onMounted(()=>{
  if(route.meta.needSave){
    window.gamerfinger.saveOpen(route.name as string)
  }
  loadGames()
})

const messages = ref<any>({})

window.gamerfinger.getLanguage().then(data=>{
  messages.value = data
})


const editor = ref({
  show:false,
  fromAdd:false,
  openDir:false,
  errorMsg:{
    gameMsg:"",
    locationMsg:"",
  }
})

const editGameInfo = ref<any>({})
function openEdit(data:any){
  editGameInfo.value  = data
  editor.value.show = true
  editor.value.fromAdd=false
  editor.value.errorMsg.gameMsg = ""
  editor.value.errorMsg.locationMsg = ""
}

function openAdd(){
  editGameInfo.value  = {}
  editor.value.show = true
  editor.value.fromAdd=true
  editor.value.errorMsg.gameMsg = ""
  editor.value.errorMsg.locationMsg = ""
}

</script>

<template>
  <div class="sl">
    <section class="gamelist">
    <!-- 侧栏展示支持的游戏 -->
      <h1>{{messages.sl}}</h1>
      <div class="game">
        <div v-for="game in gameList"  :class="{
          'item':true,
          'active': (game.game == activeGame.game)
        }" @click="changeActive(game)">{{ game.game }}</div>
      </div>
      <div @click="goHome" class="back">{{messages.back}}</div>
    </section>
    <main>
      <div class="panel" v-if="activeGame.game!=undefined && activeGame.game!=''">
        <h1>{{ activeGame.game }}</h1>
        <div class="info">
          <div>源地址：{{activeGame.from}}</div>
          <div>目标地址：./config/sl/{{activeGame.to}}/</div>
          <div>上次备份时间：{{ activeGame.last }}</div>
        </div>
        <div class="action">
          <button @click="openEdit(activeGame)">{{messages.sl_e}}</button>
          <button @click="save">{{messages.sl_s}}</button>
          <button @click="load">{{messages.sl_l}}</button>
        </div>
        <div class="msg">
          <div v-for="log in activeGame.logs">{{log}}</div>
        </div>
      </div>
      <div class="panel" v-else>
        <H1>{{messages.sl_welcome}}</H1>
      </div>
      
      <div class="model-bg" v-show="editor.show" >
        <section class="model">
          <header class="header">
            {{ messages.sl_e }}
          </header>
          <div class="main">
            <div class="input-group">
              <label for="game" class="label-box">
                <div class="label-item">{{messages.sl_gname}}</div>
                <div class="label-item error-msg">{{editor.errorMsg.gameMsg}}</div> 
              </label>
              <input type="text" name="game" placeholder="" v-model="editGameInfo.game" :disabled="editor.fromAdd == false">
            </div>
            <div class="input-group">
              <label for="from" class="label-box">
                <div class="label-item">{{messages.sl_location}}</div>
                <div class="label-item error-msg">{{editor.errorMsg.locationMsg}}</div> 
                <div class="label-item">
                  <label for="selectDir">{{messages.sl_select_dir}}:</label>
                  <input type="checkbox" name="selectDir" style="width: auto;" v-model="editor.openDir">
              
                  <button class="btn" @click="selectFile" >{{messages.select_file}}</button>
                </div> 
              </label>
              <input type="input" name="from" placeholder="" v-model="editGameInfo.from">
            </div>
          </div>
          <footer class="footer">
            <button  @click="editor.show= false">{{messages.cancel}}</button>
            <button @click="editGame">{{messages.save}}</button>
          </footer>
        </section>
      </div>

      <div class="close" @click="openAdd">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
          <path d="M8 12H12M12 12H16M12 12V16M12 12V8M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </svg>
      </div>
    </main>
  </div>
</template>

<style scoped>
.sl{
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: flex-start;
  padding: 24px;
  height: 100%;
}
.gamelist{
  width: 200px;
  display: flex;
  min-height: 360px;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}
.gamelist .back{
  box-sizing: border-box;
  width: 200px;
  cursor: pointer;
  height: 48px;
  display: inline-flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
  border: #8d8d97 2px solid;
}

.gamelist .game{
  box-sizing: border-box;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
}

.label-box {
    display: grid;
    grid-template-columns: .5fr 2fr 2fr; /* 三列等宽 */
    gap: 10px; /* 列之间的间距 */
    width: 100%;
}

.label-item {
    display: inline-flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
}

.label-item:last-child {
  justify-content: flex-end;
}
.label-item:first-child,
.label-item:nth-child(2) {
  justify-content: flex-start;
}

.game .item{
  width: 100%;
  height: 32px;
  display: inline-flex;
  align-content: center;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border: #3b4544 2px solid;
  cursor: pointer;
}

.game .item:hover{
  transform: scale(1.1);
  transition: transform 0.2s;
}

.game .item:active{
  transform: scale(1.05);
  transition: transform 0.2s;
}


.game .active{
  transform: scale(1.05);
  border: #b1c6c3 2px solid;
}

.back:hover{
  border: #a9c4c2 2px solid;
}

.back:active{
  border: #3b4544 2px solid;
}

main{
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-height: 480px;
  padding: 24px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

}

.panel{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.action{
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

button{
  width: 180px;
  height: 48px;
}



.btn{
  height: 32px;
}

.info{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
}

.close{
  position: fixed;
  top: 32px;
  right: 64px;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.close:hover{
  transform: scale(1.1);
  transition: transform 0.3s;
}

.close:active{
  transform: scale(1);
  transition: transform 0.2s;
}

@media  (prefers-color-scheme: dark) {
  .close svg{
    stroke: white;
  }
}

@media  (prefers-color-scheme: light) {
  .close svg{
    stroke: black;
  }
}

</style>
