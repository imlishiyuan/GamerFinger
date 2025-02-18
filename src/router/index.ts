import { createMemoryHistory, createRouter } from 'vue-router'

import Home from '../pages/Home.vue'
import AboutView from '../pages/About.vue'

import Settings from '../pages/Settings.vue'

const routes = [
  { 
    path: '/home', 
    name:"home",
    component: Home,
    meta: { 
      needSave:true
    },
  },
  { 
    path: '/about',
    name:"about", 
    component: AboutView 
  },
  { 
    path: '/settings',
    name:"settings", 
    component: Settings
  },
  {
    path:"/sl",
    name:"sl",
    component: ()=> import("../pages/SL.vue"),
    meta: { 
      needSave:true
    },
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})


export default router