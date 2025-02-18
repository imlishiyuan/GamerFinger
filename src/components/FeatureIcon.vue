<script setup lang="ts">
import { ref } from 'vue'

import DEFAULT_ICON from "../assets/default.png"


defineProps<{ name: string,icon:string }>()

</script>

<template>
  <div class="app">
    <picture class="pic">
      <source :srcset="icon">
      <img :src="DEFAULT_ICON" >  
    </picture>
    <div class="name">{{name}}</div>
  </div>
</template>

<style scoped>
.app {
  width: 96px;
  height: 128px;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;
}
.pic{
  width: 96px;
  height: 96px;
}  
.pic img{
  width: 96px;
  height: 96px;
}  
.app:hover .pic{
  transform: scale(1.05);
  transition: transform 0.3s;
}  
.app:active .pic{
  transform: scale(1);
  transition: transform 0.1s;
} 
</style>
