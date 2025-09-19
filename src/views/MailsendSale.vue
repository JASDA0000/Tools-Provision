<script setup>
import { ref } from 'vue'
import { Plus, Minus } from 'lucide-vue-next'

/** ====== CONFIG ====== */
const API_BASE = 'https://backend-tools-provision.onrender.com' // <-- แก้ให้ตรงของคุณ
const columns = ['Z', 'AB', 'AC', 'AG', 'AH', 'AI', 'AJ']       // รวม 7 คอลัมน์ (ตรงกับตาราง)

/** ====== STATE ====== */
const inputs = ref([''])      // รายการ "เลขแถว หรือ SO/POC" ที่ผู้ใช้กรอก
const rows = ref([])          // ผลลัพธ์ที่ดึงมา (array ของ array ตาม columns)
const isLoading = ref(false)
const selectTypeDoc = ref('') // 'poc' | 'newservice' | 'change' | ''

/** ====== STATIC CONTENT (messageShow, detailImages เหมือนเดิม) ====== */
const messageShow = {
  poc: `...`, // (ไม่เปลี่ยน)
  newservice: `...`,
  change: `...`
}

const detailImages = {
  poc: `...`,
  newservice: `...`,
  change: `...`
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
 * fetchData รองรับทั้ง "row" (เลข) และ "so_number" (SO-xxxx หรือ POC-xxxx)
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
          // ถ้าเป็นตัวเลขล้วน → ใช้ row
          url = `${API_BASE}/sheet?row=${encodeURIComponent(val)}&columns=${encodeURIComponent(columnsParam)}`
        } else {
          // ถ้าเป็น SO-xxx หรือ POC-xxx → ใช้ so_number
          url = `${API_BASE}/sheet?so_number=${encodeURIComponent(val)}&columns=${encodeURIComponent(columnsParam)}`
        }

        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const rec = data?.data || {}
        return columns.map(col => (rec[col] ?? '-'))
      })

    rows.value = await Promise.all(jobs)
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
        <label class="text-xl">ค้นหา:</label>
        <input
          v-model="inputs[index]"
          class="bg-white rounded-xl text-black text-xl p-2 w-full border-2"
          placeholder="เช่น 10000 หรือ SO-123456 หรือ POC-78910"
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
          <th class="border border-[#cccccc] px-2">State</th>
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
          <td class="border border-[#cccccc] px-2">Power ON</td>
          <td class="border border-[#cccccc] px-2">{{ row[1] }}</td>
          <td class="border border-[#cccccc] px-2">{{ row[2] }}</td>
          <td class="border border-[#cccccc] px-2">{{ row[3] }} Cores</td>
          <td class="border border-[#cccccc] px-2">{{ row[4] }} GB</td>
          <td class="border border-[#cccccc] px-2">{{ row[5] }} GB</td>
          <td class="border border-[#cccccc] px-2">{{ row[6] }}</td>
        </tr>
      </tbody>
    </table>

    <!-- ข้อความหัวจดหมาย -->
    <div v-if="!isLoading && selectTypeDoc" v-html="messageShow[selectTypeDoc]" class="text-black bg-white mt-2"></div>

    <!-- รายละเอียดรูปภาพ -->
    <div v-if="selectTypeDoc" v-html="detailImages[selectTypeDoc]" class="bg-white shadow-2xl mt-2 rounded-2xl"></div>
  </div>
</template>