<script setup>
import Card from '../components/Card.vue';

</script>
<template>
    <div>
        <p class="text-2xl font-bold">Policy IP</p>
        <Card>
        <div class="text-left">
        <label class="text-xl font-bold">Policy IP : </label>
        <select v-model="selectTypeDoc" class="text-black bg-white border-2 rounded-xl p-2">
          <option value="">กรุณาเลือก</option>
          <option value="share">IP Share</option>
          <option value="dedicate">IP Dedicate</option>
        </select>
        </div>
        </Card>
    </div>
</template>