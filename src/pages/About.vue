<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const messages= ref<any>({})

messages.value= window.gamerfinger.getLanguage().then(data=>{
  messages.value = data
})

function goHome(){
  router.push({
    name:"home",
  })
}

</script>

<template>
  <!-- 关于页面 -->
  <main>
    <!-- 展示所有支持的功能 -->
    <h1>Gamer Finger</h1>
    <p>
      2024年打了游戏的时候其中几款游戏（黑神话悟空、艾尔登法环和只狼影逝二度）的多结局和刷素材需要反复读取存档。萌生了写一个游戏助手的想法，于是就有了这个项目。
    </p>
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
