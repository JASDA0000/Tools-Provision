<script setup>
import { ref } from 'vue'
import { Plus, Minus } from 'lucide-vue-next'

/** ====== CONFIG ====== */
const API_BASE = 'http://localhost:8000' // หรือ URL backend ของคุณ
const columns = ['Z', 'AB', 'AC', 'AG', 'AH', 'AI', 'AJ']

/** ====== STATE ====== */
const inputs = ref([''])      // ค่าที่กรอก เช่น row=10000 หรือ SO-xxxx
const rows = ref([])          // เก็บข้อมูลหลายแถว
const isLoading = ref(false)
const selectTypeDoc = ref('') // 'poc' | 'newservice' | 'change'

/** ====== STATIC CONTENT ====== */
const messageShow = {
  poc: `<p class="text-black">เรียน ทีม POC</p>`,
  newservice: `<p class="text-black">เรียน ทีม New Service</p>`,
  change: `<p class="text-black">เรียน ทีม Change</p>`
}

const detailImages = {
  poc: `<p class="text-red-500">POC IMAGES</p>`,
  newservice: `<p class="text-red-500">NEWSERVICE IMAGES</p>`,
  change: `<p class="text-red-500">CHANGE IMAGES</p>`
}

/** ====== ACTIONS ====== */
function addInput() { inputs.value.push('') }
function removeInput() { if (inputs.value.length > 1) inputs.value.pop() }
function resetData() {
  inputs.value = ['']
  rows.value = []
  selectTypeDoc.value = ''
}

/**
 * fetchData รองรับทั้ง row (เลข) และ so_number (SO-/POC-)
 */
async function fetchData() {
  rows.value = []
  isLoading.value = true

  try {
    const jobs = inputs.value
      .map(r => (r ?? '').toString().trim())
      .filter(r => r.length > 0)
      .map(async (val) => {
        const columnsParam = columns.join(',')
        let url = ''

        if (/^\d+$/.test(val)) {
          // 🔹 ถ้าเป็นเลข → ใช้ row
          url = `${API_BASE}/sheet?row=${encodeURIComponent(val)}&columns=${encodeURIComponent(columnsParam)}`
        } else {
          // 🔹 ถ้าเป็น SO-/POC- → ใช้ so_number
          url = `${API_BASE}/sheet?so_number=${encodeURIComponent(val)}&columns=${encodeURIComponent(columnsParam)}`
        }

        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        if (data.rows) {
          // 🔹 ได้หลาย record (จาก so_number)
          return data.rows.map(rec =>
            columns.map(col => (rec.data?.[col] ?? '-'))
          )
        } else {
          // 🔹 ได้ record เดียว (จาก row)
          const rec = data?.data || {}
          return [columns.map(col => (rec[col] ?? '-'))]
        }
      })

    const resultNested = await Promise.all(jobs)
    rows.value = resultNested.flat()
  } catch (err) {
    console.error(err)
    alert('ดึงข้อมูลไม่สำเร็จ: ' + (err?.message || err))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <p class="font-bold text-3xl">📋 Tools-Provision</p>

    <!-- ตัวเลือก -->
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

      <!-- ช่องกรอก -->
      <div v-for="(item, index) in inputs" :key="index" class="flex items-center gap-2 mt-2">
        <label class="text-xl">ค้นหา:</label>
        <input
          v-model="inputs[index]"
          class="bg-white rounded-xl text-black text-xl p-2 w-full border-2"
          placeholder="เช่น 10000 หรือ SO-1111111111"
        />
        <template v-if="index === inputs.length - 1">
          <button @click="addInput" class="bg-green-500 text-white px-3 py-1 rounded-2xl hover:opacity-70">
            <Plus class="w-4 h-6" />
          </button>
          <button @click="removeInput" class="bg-red-500 text-white px-3 py-1 rounded-2xl hover:opacity-70">
            <Minus class="w-4 h-6" />
          </button>
        </template>
      </div>

      <!-- ปุ่ม -->
      <div class="mt-4">
        <button
          @click="fetchData"
          :disabled="isLoading"
          class="bg-[#47ba87] text-white px-6 py-2 rounded-xl hover:opacity-80 mr-2"
        >
          {{ isLoading ? 'กำลังโหลด...' : 'ดึงข้อมูล' }}
        </button>
        <button
          @click="resetData"
          class="bg-[#47ba87] text-white px-6 py-2 rounded-xl hover:opacity-80 mr-2"
        >
          รีเซตข้อมูล
        </button>
      </div>
    </div>

    <!-- ตาราง -->
    <table v-if="rows.length" class="border border-[#cccccc] border-collapse w-full bg-white text-black font-sans text-[12px] mt-2">
      <thead>
        <tr>
          <th class="border border-[#cccccc] px-2">Name</th>
          <th class="border border-[#cccccc] px-2">IP Private</th>
          <th class="border border-[#cccccc] px-2">IP Public</th>
          <th class="border border-[#cccccc] px-2">CPUs</th>
          <th class="border border-[#cccccc] px-2">Memory Size</th>
          <th class="border border-[#cccccc] px-2">Provisioned Space</th>
          <th class="border border-[#cccccc] px-2">Guest OS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td class="border border-[#cccccc] px-2">{{ row[0] }}</td>
          <td class="border border-[#cccccc] px-2">{{ row[1] }}</td>
          <td class="border border-[#cccccc] px-2">{{ row[2] }}</td>
          <td class="border border-[#cccccc] px-2">{{ row[3] }}</td>
          <td class="border border-[#cccccc] px-2">{{ row[4] }}</td>
          <td class="border border-[#cccccc] px-2">{{ row[5] }}</td>
          <td class="border border-[#cccccc] px-2">{{ row[6] }}</td>
        </tr>
      </tbody>
    </table>

    <!-- เนื้อหาเสริม -->
    <div v-if="!isLoading && selectTypeDoc" v-html="messageShow[selectTypeDoc]" class="text-black bg-white mt-2"></div>
    <div v-if="selectTypeDoc" v-html="detailImages[selectTypeDoc]" class="bg-white shadow-2xl mt-2 rounded-2xl"></div>
  </div>
</template>