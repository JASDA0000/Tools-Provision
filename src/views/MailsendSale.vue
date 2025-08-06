  <script setup>
  import { ref } from 'vue'
import { Plus,Minus } from 'lucide-vue-next';
  const inputs = ref(['']);     // ช่องกรอกสำหรับแถว เช่น 10000, 10001, ...
  const rows = ref([]);         // สำหรับเก็บข้อมูลที่ดึงมา
  const isLoading = ref(false);
  const selectTypeDoc = ref('');

  const messageShow = {
    poc: `
    <div class="">
    <p class="font-bold text-left font-serif text-black">เรียน ทีม</p> <br> <p class="font-serif text-black text-left">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;ทางทีมดำเนินการสร้างเครื่องและจัดส่งให้ลูกค้าเรียบร้อยแล้วครับ โดยมีรายละเอียดดังนี้ครับ
    </p><br></div>`,
    newservice: `
      <div class="">
      <p class="font-bold text-left font-serif text-black">เรียน ทีม</p> <br> <p class="font-serif text-black text-left">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;ทางทีม Cloud ดำเนินการย้ายโซน POC เป็น PRD ให้กับลูกค้าเรียบร้อยแล้วครับ โดยมีรายละเอียดดังนี้ครับ อ้างอิง : <span class="bg-[#ffff00]">SO/POC-xxx</span>
      </p></div>`
  }
  const detailImages = {
    poc: `<div class="p-2">
      <p class="text-red-500 font-bold text-left">ส่วนประกอบภายใน Loop Mail</p>
      <p><<<<<<<<รูปหน้าเครื่อง>>>>>>>>></p>
      <br> <p><<<<<<<<รูปถัง Backup>>>>>>>>></p> <br> <p><<<<<<<<รูป Zabbix>>>>>>>>></p> <br> <p><<<<<<<<รูป CrowdStrike>>>>>>>>></p> 
      </div>`,
    newservice: `<div class="p-2">
      <p class="text-red-500 font-bold text-left">ส่วนประกอบภายใน Loop Mail</p>
      <p><<<<<<<<รูปหน้าเครื่อง ย้ายโซน PRD>>>>>>>>></p>
      <br> <p><<<<<<<<รูปถัง Backup >>>>>>>>></p> <br> <p><<<<<<<<รูป Zabbix ย้ายโซน PRD>>>>>>>>></p> <br> <p><<<<<<<<รูป CrowdStrike ย้ายโซน PRD>>>>>>>>></p> 
      </div>`
  }

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
    selectTypeDoc.value = ref('');
  }
  const columns = ['Z', 'AB', 'AC', 'AG', 'AH', 'AI', 'AJ']
  async function fetchData() {
    rows.value = [];
    isLoading.value = true;
    try {
      for (const row of inputs.value) {
        if (row.trim() !== '') {
          const columnsParam = columns.join(',');
          const url = `https://backend-tools-provision.onrender.com/sheet?row=${row.trim()}&columns=${encodeURIComponent(columnsParam)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          // console.log(data); 
          // data จะเป็น object เช่น { A10000: "val1", C10000: "val2", ... }
          // แปลงเป็น array หรือ object ตามต้องการก่อนเก็บ
          const rowData = columns.map(col => data[`${col}${row.trim()}`] || '-')
          rows.value.push(rowData);
        }
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <div class="">
    <p class="font-bold text-3xl">📋 Tools-Provision</p>
    <div class="bg-[#fff] text-black p-4 shadow-xs rounded-2xl w-full mt-2">
      <div class="text-left">
        <label class="text-xl">ประเภทเอกสาร : </label>
        <select v-model="selectTypeDoc" class="text-black bg-white border-2 rounded-xl p-2">
          <option value="">กรุณาเลือก</option>
          <option value="poc">POC</option>
          <option value="newservice">New Service</option>
          <option value="change">Change</option>
        </select>
      </div>
      <div v-for="(item, index) in inputs" :key="index" class="flex items-center gap-2 mt-2">
        <label class="text-xl">แถว:</label>
        <input v-model="inputs[index]" class="bg-white rounded-xl text-black text-xl p-2 w-full border-2"
        placeholder="เช่น 10000" />
        <template v-if="index === inputs.length - 1">
          <button @click="addInput" class="bg-green-500 text-white px-3 py-1 rounded-2xl hover:opacity-70"><Plus class="w-4 h-6" /></button>
          <button @click="removeInput" class="bg-red-500 text-white px-3 py-1 rounded-2xl hover:opacity-70"><Minus class="w-4 h-6" /></button>
          
        </template>
      </div>
      <div>
        <button @click="fetchData" :disabled="isLoading"
          class="bg-[#47ba87] text-white px-6 py-2 rounded-xl hover:opacity-80 mt-4 mr-2">
          {{ isLoading ? 'กำลังโหลด...' : 'ดึงข้อมูล' }}
        </button>
        <button @click="resetData" class="bg-[#47ba87] text-white px-6 py-2 rounded-xl hover:opacity-80 mt-4 mr-2">
          รีเซตข้อมูล
        </button>
  
      </div>
    </div>
</div>
    <!-- spin-animate -->
    <div v-if="isLoading" class="flex items-center justify-center mt-4 text-[#47ba87] mb-2">
      <svg class="animate-spin h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8z" />
      </svg>
      <span class="text-lg">กำลังโหลดข้อมูล...</span>
    </div>
    <div v-if="!isLoading">
      <div v-if="selectTypeDoc" v-html="messageShow[selectTypeDoc]" class=" text-black bg-white mt-2"></div>
    </div>
    <table class="border border-[#cccccc] border-collapse w-full bg-white text-black font-sans text-[12px] mt-2">
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
      <tbody v-if="!isLoading">
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
    <div v-if"selectTypeDoc" v-html="detailImages[selectTypeDoc]" class="bg-white shadow-2xl mt-2 rounded-2xl">
    </div>
</template>
