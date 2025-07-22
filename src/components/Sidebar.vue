<script setup>
import { ref } from 'vue'
import { Home, Info, Mail, Phone, Table } from 'lucide-vue-next'
</script>

<template>
  <div class="relative">
    <!-- Toggle Button -->
    <button @click="$emit('toggle')" class="p-2 fixed top-4 left-4 bg-gray-800 text-white rounded z-50">
      ☰
    </button>

    <!-- Sidebar -->
    <transition name="slide">
      <div v-if="$attrs.show" class="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg z-40 p-4">
        <h2 class="text-xl font-bold mb-6">📂 เมนู</h2>
        <nav class="flex flex-col gap-4">
          <router-link to="/" class="hover:bg-gray-700 p-2 rounded flex items-center gap-2"><Home class="w-5 h-5" /> หน้าแรก</router-link>
          <router-link to="/MailsendVM" class="hover:bg-gray-700 p-2 rounded flex items-center gap-2"><Mail class="w-5 h-5" /> เมลส่งเครื่อง</router-link>
          <router-link to="/MailsendSale" class="hover:bg-gray-700 p-2 rounded flex items-center gap-2"><Table class="w-5 h-5" />ตารางเครื่อง</router-link>
        </nav>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}
</style>