  <script setup>
  import { ref } from 'vue' 

  const inputs = ref([''])     // ช่องกรอกสำหรับแถว เช่น 10000, 10001, ...
  const rows = ref([])         // สำหรับเก็บข้อมูลที่ดึงมา

  function addInput() {
    inputs.value.push('')
  }
  function removeInput() {
    if (inputs.value.length > 1) {
      inputs.value.pop()
    }
  }
  function resetData() {
    inputs.value = [''] 
    rows.value = [] 
  }
  const columns = ['Z', 'AB', 'AC', 'AG', 'AH', 'AI', 'AJ']
  async function fetchData() {
    rows.value = [];
    try {
      for (const row of inputs.value) {
        if (row.trim() !== '') {
          const columnsParam = columns.join(',');
          const url = `http://localhost:5000/sheet?row=${row.trim()}&columns=${encodeURIComponent(columnsParam)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          console.log(data);
          // data จะเป็น object เช่น { A10000: "val1", C10000: "val2", ... }
          // แปลงเป็น array หรือ object ตามต้องการก่อนเก็บ
          const rowData = columns.map(col => data[`${col}${row.trim()}`] || '-')
          rows.value.push(rowData);
        }
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  }
</script>

<template>
    <div class="p-4 space-y-4">
      <p class="font-bold text-3xl">📋 Tools-Provision</p>

      <div v-for="(item, index) in inputs" :key="index" class="flex items-center gap-2">
        <label class="text-xl">แถว:</label>
        <input v-model="inputs[index]" class="bg-white rounded-xl text-black text-xl p-2 w-full"
          placeholder="เช่น 10000" />
      </div>

      <div class="flex gap-2">
        <button @click="addInput" class="bg-green-500 text-white px-4 py-2 rounded-xl hover:opacity-70">+</button>
        <button @click="removeInput" class="bg-red-500 text-white px-4 py-2 rounded-xl hover:opacity-70">−</button>
      </div>

      <button @click="fetchData" class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:opacity-80 mt-4 mr-2">
        ดึงข้อมูล
      </button>
      <button @click="resetData" class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:opacity-80 mt-4 mr-2">
        รีเซตข้อมูล
      </button>

      <table class="border border-[#cccccc] border-collapse w-full bg-white text-black font-sans text-[12px]">
        <thead>
          <tr>
            <th class="border border-[#cccccc] px-2">Name</th>
            <th class="border border-[#cccccc] px-2">State</th>
            <th class="border border-[#cccccc] px-2">IP Private</th>
            <th class="border border-[#cccccc] px-2">IP Public</th>
            <th class="border border-[#cccccc] px-2">CPUs</th>
            <th class="border border-[#cccccc] px-2">Memory Size</th>
            <th class="border border-[#cccccc] px-2">Provisioned Space</th>
            <th class="border border-[#cccccc] px-2">Guest OS</th>
            <th class="border border-[#cccccc] px-2">Other</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td class="border border-[#cccccc]  px-2">{{ row[0] }}</td>
            <td class="border border-[#cccccc] px-2">Power ON</td>
            <td class="border border-[#cccccc] px-2">{{ row[1] }}</td>
            <td class="border border-[#cccccc] px-2">{{ row[2] }}</td>
            <td class="border border-[#cccccc] px-2">{{ row[3] }} Cores</td>
            <td class="border border-[#cccccc] px-2">{{ row[4] }} GB</td>
            <td class="border border-[#cccccc] px-2">{{ row[5] }} GB</td>
            <td class="border border-[#cccccc] px-2">{{ row[6] }} </td>
            <td class="border border-[#cccccc] px-2">{{ row[7] || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
