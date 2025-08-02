<template>
    <div class="bg-white shadow-2xs rounded-2xl p-2">
        <h1 class="text-2xl mb-4 font-bold">สุ่มรหัสผ่าน</h1>

        <div v-if="password" class="relative mb-4">
            <input type="text" :value="password" readonly class="w-full border rounded px-3 py-2 pr-12 box-border" />
            <!-- ปุ่มคัดลอก -->
            <button @click="copyPassword" type="button" aria-label="คัดลอกรหัสผ่าน"
                class="absolute top-1/2 right-10 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900"
                style="background: transparent; border: none; cursor: pointer; padding: 0;">
                <Copy size="18" />
            </button>
            <!-- ปุ่มสุ่มรหัสผ่านใหม่ -->
            <button @click="generatePassword" type="button" aria-label="สุ่มรหัสผ่านใหม่"
                class="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900"
                style="background: transparent; border: none; cursor: pointer; padding: 0;">
                <RefreshCw size="18" />
            </button>
            <!-- แจ้งเตือนเล็กๆ -->
        <transition name="fade">
    <div
      v-if="copied"
      class="fixed inset-0 flex items-center justify-center pointer-events-none"
      style="z-index: 9999;"
    >
      <div
        class="bg-green-600 text-white px-6 py-3 rounded shadow-lg select-none"
        style="pointer-events: auto;"
      >
        คัดลอกแล้ว!
      </div>
    </div>
  </transition>
        </div>
        
        <p class="text-left text-2xl font-bold flex m-2">ปรับแต่งรหัสผ่าน</p>
        <div class="flex w-full gap-4">
  <!-- ฝั่งความยาวรหัสผ่าน -->
  <div class="w-1/2 flex flex-col justify-center">
    <label class="mb-1 font-semibold text-left">ความยาวรหัสผ่าน:</label>
    <div>
      <input
        type="number"
        v-model.number="length"
        min="4"
        max="99"
        class="border px-2 py-1 w-24"
      />
      <input
        type="range"
        v-model.number="length"
        min="4"
        max="99"
        class="w-full mt-2"
      />
    </div>
  </div>

  <!-- ฝั่งตัวเลือกประเภทตัวอักษร -->
<div class="w-1/2 flex justify-center">
  <div class="w-full max-w-xs text-lg flex flex-col justify-center items-start">
    <label class="flex items-center mb-2 w-full">
      <input type="checkbox" v-model="useLowercase" class="mr-2" />
      <span>ตัวพิมพ์เล็ก (a-z)</span>
    </label>
    <label class="flex items-center mb-2 w-full">
      <input type="checkbox" v-model="useUppercase" class="mr-2" />
      <span>ตัวพิมพ์ใหญ่ (A-Z)</span>
    </label>
    <label class="flex items-center mb-2 w-full">
      <input type="checkbox" v-model="useNumbers" class="mr-2" />
      <span>ตัวเลข (0-9)</span>
    </label>
    <label class="flex items-center mb-2 w-full">
      <input type="checkbox" v-model="useSymbols" class="mr-2" />
      <span>สัญลักษณ์พิเศษ (!@#$...)</span>
    </label>
  </div>
</div>
</div>
        
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Copy } from 'lucide-vue-next'
import { RefreshCw } from 'lucide-vue-next'
const useLowercase = ref(true);
const useUppercase = ref(true);
const useNumbers = ref(true);
const useSymbols = ref(true);
const length = ref(12);
const password = ref('');
const copied = ref(false)

function generatePassword() {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let charset = "";
    if (useLowercase.value) charset += lowercase;
    if (useUppercase.value) charset += uppercase;
    if (useNumbers.value) charset += numbers;
    if (useSymbols.value) charset += symbols;

    if (charset.length === 0) {
        alert("กรุณาเลือกอย่างน้อย 1 ประเภทตัวอักษร");
        return;
    }

    let result = "";
    for (let i = 0; i < length.value; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    password.value = result;
}
function copyPassword() {
    if (!password.value) return;
    navigator.clipboard.writeText(password.value).then(() => {
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 1500)
    }).catch(() => {
        // handle error
    })
}

console.log(generatePassword({ length: 16, useSymbols: false })); // ไม่ใช้สัญลักษณ์พิเศษ
console.log(generatePassword({ length: 10, useLowercase: false, useUppercase: false, useNumbers: true, useSymbols: false })); // ใช้แค่ตัวเลข
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
