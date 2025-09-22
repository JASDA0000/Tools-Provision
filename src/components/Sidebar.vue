<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Home, Mail, Table, Lock, Menu,BrickWallFire } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
})
const emit = defineEmits(['toggle'])

const sidebarRef = ref(null)
const toggleButtonRef = ref(null)

function handleClickOutside(event) {
  if (
    props.show &&
    sidebarRef.value &&
    !sidebarRef.value.contains(event.target) &&
    toggleButtonRef.value &&
    !toggleButtonRef.value.contains(event.target)
  ) {
    emit('toggle')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div>
    <!-- แถบด้านซ้ายสูงเต็มจอ -->
    <div class="fixed top-0 left-0 h-screen w-16 bg-gray-800 bg-opacity-90 shadow-lg z-50 flex flex-col items-start">
      <!-- ปุ่ม toggle อยู่ด้านบนซ้าย -->
      <button ref="toggleButtonRef" @click.stop="emit('toggle')"
        class="w-10 h-10 m-2 flex items-center justify-center text-white hover:bg-gray-700 rounded"
        aria-label="Toggle sidebar">
        <Menu class="w-6 h-6" />
      </button>
    </div>

    <!-- Sidebar -->
    <transition name="slide">
      <div v-if="props.show" ref="sidebarRef"
        class="fixed top-0 left-16 h-screen w-64 bg-gray-900 text-white shadow-lg z-40 p-4">
        <h2 class="text-xl font-bold mb-6">📂 เมนู</h2>
        <nav class="flex flex-col gap-4">
          <router-link to="/" class="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
            <Home class="w-5 h-5" /> หน้าแรก
          </router-link>
          <router-link to="/MailsendVM" class="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
            <Mail class="w-5 h-5" /> เมลส่งเครื่อง
          </router-link>
          <router-link to="/MailsendSale" class="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
            <Table class="w-5 h-5" /> ตารางเครื่อง
          </router-link>
          <router-link to="/Policy" class="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
            <BrickWallFire class="w-5 h-5" /> Policy IP
          </router-link>
          <router-link to="/PasswordGen" class="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
            <Lock class="w-5 h-5" /> สุ่มรหัสผ่าน
          </router-link>
        </nav>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* แอนิเมชัน slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
