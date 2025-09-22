<script setup>
import Card from '../components/Card.vue';
import { ref } from 'vue'

const inputs = ref(['']) // ✅ ต้องมี state สำหรับ v-for
</script>

<template>
  <div>
    <p class="text-2xl font-bold">ค้นหา Cluster (PVE,AHV)</p>
    <Card>
      <div v-for="(item, index) in inputs" :key="index" class="flex items-center gap-2 mt-2">
        <label class="text-xl">ค้นหา:</label>
        <input
          v-model="inputs[index]"
          class="bg-white rounded-xl text-black text-xl p-2 w-full border-2"
          placeholder="Cluster Name หรือ IP Address"
        />
      </div>
    </Card>
  </div>
</template>
