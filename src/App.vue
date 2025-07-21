<script setup>
import Sidebar from './components/Sidebar.vue'
import { ref } from 'vue'

const showSidebar = ref(false)
</script>

<template>
  <div class="flex h-screen">
    <Sidebar :show="showSidebar" @toggle="showSidebar = !showSidebar" />

    <div class="flex-1 bg-[#242424] min-h-screen overflow-auto">
      <router-view />
    </div>
  </div>
</template>