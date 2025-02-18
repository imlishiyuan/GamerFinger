<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()


const languageList = ref<string[]>([])
const config = ref<any>({
  language:""
})

const messages = ref<any>({})

onMounted(()=>{
  window.gamerfinger.getLanguage().then(data=>{
    messages.value = data
  })

  window.gamerfinger.getConfig().then(data=>{
    config.value= data
  })

  window.gamerfinger.listLanguage().then(data=>{
    languageList.value= data
  })

})


function goHome(){
  router.push({
    name:"home",
  })
}

function changeLanguage(){
  window.gamerfinger.changeLanguage(config.value.language).then(data=>{
    messages.value = data
  })
}

</script>

<template>
  <!-- 关于页面 -->
  <main>
    <!-- 展示所有支持的功能 -->
    <h1>Gamer Finger</h1>
    <div class="settings">
      <div class="item">
        <span>{{ messages.lang }}</span>
        <select v-model="config.language" @change="changeLanguage">
          <option v-for="languege in languageList" :value="languege">{{ languege }}</option>
        </select>
      </div>
    </div>
    <div @click="goHome" class="back">{{messages.back}}</div>
  </main>
</template>

<style scoped>

main{
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.settings{
  padding: 24px;
  gap: 12px;
  width: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: flex-start;
  align-items: flex-start;
}
.settings .item{
  width: 100%;
  height: 36px;
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}

.settings .item select{
  width: 120px;
  height: 36px;
}

.back{
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

.back:hover{
  border: #a9c4c2 2px solid;
}

.back:active{
  border: #3b4544 2px solid;
}
</style>
