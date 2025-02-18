<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

window.gamerfinger.recentOpen().then(data=>{
  router.getRoutes().forEach(route=>{
    if(route.name == data){
      router.push({
        name:data
      })
    }
  })
})


</script>

<template>
  <RouterView />
</template>
