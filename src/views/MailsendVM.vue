<script setup>
import { ref, computed } from 'vue'
import { Plus, Minus } from 'lucide-vue-next'

/** ===== CONFIG ===== */
const API_BASE = 'https://backend-tools-provision.onrender.com'
const columns = ['C', 'O', 'P', 'Q', 'Z', 'AB', 'AC', 'AG', 'AH', 'AI', 'AJ', 'AS']
// index mapping:
// 0:C=SO, 1:O=Customer, 2:P=Start, 3:Q=End,
// 4:Z=VM Name, 5:AB=IP Private, 6:AC=IP Public,
// 7:AG=vCPU, 8:AH=vRAM, 9:AI=vDisk, 10:AJ=OS, 11:AS=Username

/** ===== STATE ===== */
const inputs = ref([''])     // user กรอก SO/POC/Row
const rows = ref([])         // list ของ VM ที่ดึงได้
const selectGuide = ref('')
const portal = ref('')
const portalguide = ref('')
const isLoading = ref(false)

/** ===== COMPUTED ===== */
const rowData = computed(() => rows.value[0] || [])
const vmCount = computed(() => rows.value.length)

/** ===== ACTIONS ===== */
function addInput() { inputs.value.push('') }
function removeInput() { if (inputs.value.length > 1) inputs.value.pop() }
function resetData() {
  inputs.value = ['']
  rows.value = []
  selectGuide.value = ''
  portal.value = ''
  portalguide.value = ''
}

function validateDropdown() {
  if (selectGuide.value === '1') {
    portal.value = 'AHV'
    portalguide.value = 'https://ocp-cloud.inet.co.th/owncloud/index.php/s/rM7ERfrMt2GaBGP'
  } else if (selectGuide.value === '2') {
    portal.value = 'Cloud-Open Source (Proxmox)'
    portalguide.value = 'https://ocp-cloud.inet.co.th/owncloud/index.php/s/76XijkVXFQCseBa'
  } else {
    portal.value = ''
    portalguide.value = ''
  }
}

async function fetchData() {
  rows.value = []
  isLoading.value = true
  try {
    const queryList = inputs.value
      .map(r => (r ?? '').toString().trim())
      .filter(r => r.length > 0)

    const columnsParam = columns.join(',')

    const jobs = queryList.map(async (query) => {
      let url = ''
      if (/^\d+$/.test(query)) {
        // ถ้า user กรอกเป็นเลข row
        url = `${API_BASE}/sheet?row=${encodeURIComponent(query)}&columns_sendVM=${encodeURIComponent(columnsParam)}`
      } else {
        // ถ้าเป็น SO-xxx หรือ POC-xxx
        url = `${API_BASE}/sheet?so_number=${encodeURIComponent(query)}&columns_sendVM=${encodeURIComponent(columnsParam)}`
      }

      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      if (json.rows) {
        // ✅ ถ้า API ส่งกลับมาเป็นหลาย VM
        return json.rows.map(r =>
          columns.map(col => (r.data?.[col] ?? '-'))
        )
      } else {
        // ✅ ถ้า API ส่งกลับมาเป็น VM เดียว
        const rec = json?.data || {}
        return [columns.map(col => (rec[col] ?? '-'))]
      }
    })

    const resultNested = await Promise.all(jobs)
    rows.value = resultNested.flat()
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาด: ' + (err?.message || err))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-4 space-y-4 bg-white rounded-2xl shadow-2xs">
    <p class="text-2xl font-bold">Loop mail ส่งเครื่อง POC ✉️</p>

    <!-- เลือกประเภท / Portal -->
    <div class="text-left">
      <label class="text-xl">คู่การเข้าใช้งาน : </label>
      <select v-model="selectGuide" @change="validateDropdown" class="bg-white text-black rounded-xl border-2 p-2">
        <option value="">กรุณาเลือก</option>
        <option value="1">AHV</option>
        <option value="2">Cloud Open Source (Proxmox)</option>
      </select>
    </div>

    <div class="text-left">
      <label class="text-xl">Portal : </label>
      <span class="bg-white text-black rounded-xl border-2 p-2 inline-block min-w-[220px]">{{ portal || '-' }}</span>
    </div>

    <!-- Input -->
    <div v-for="(item, index) in inputs" :key="index" class="flex items-center gap-2">
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

    <button
      @click="fetchData"
      :disabled="isLoading"
      class="bg-[#47ba87] text-white px-6 py-2 rounded-xl hover:opacity-80 mt-4 mr-2"
    >
      {{ isLoading ? 'กำลังโหลด...' : 'ดึงข้อมูล' }}
    </button>
  </div>

  <!-- Loading -->
  <div v-if="isLoading" class="flex items-center justify-center mt-4 text-[#47ba87]">
    <svg class="animate-spin h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8z" />
    </svg>
    <span class="text-lg">กำลังโหลดข้อมูล...</span>
  </div>

  <!-- Output -->
  <div v-if="rows.length > 0" class="font-serif bg-white p-2 mt-2">
    <!-- Header -->
    <p class="text-[#0000ff] text-left text-[14px]">*** Confidential ***</p>
    <p class="text-black text-left font-bold text-[14px] mt-2">เรียนผู้ใช้บริการ</p>

    <!-- Info -->
    <table class="text-left text-black border border-black bg-white text-[14px] mt-4">
      <tbody>
        <tr>
          <th class="border border-black bg-[#bfbfbf]">SO-NUMBER</th>
          <td class="w-[350px]">{{ rowData[0] }}</td>
        </tr>
        <tr>
          <th class="border border-black bg-[#bfbfbf]">Customer Name</th>
          <td>{{ rowData[1] }}</td>
        </tr>
        <tr>
          <th class="border border-black bg-[#bfbfbf]">Service</th>
          <td>IaaS</td>
        </tr>
        <tr>
          <th class="border border-black bg-[#bfbfbf]">ระยะเวลาในการทดสอบ</th>
          <td>{{ rowData[2]?.replace(/-/g, '/') }} - {{ rowData[3]?.replace(/-/g, '/') }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Summary -->
    <table class="border border-black bg-white text-[14px] mt-4">
      <tbody>
        <tr>
          <th class="border border-black bg-[#bfbfbf]">จำนวน VM</th>
          <td>{{ vmCount }}</td>
        </tr>
      </tbody>
    </table>

    <!-- VM List -->
    <div v-for="(rowData, index) in rows" :key="index" class="mb-6 mt-4">
      <table class="border border-black bg-white text-[14px] w-full">
        <tbody>
          <tr class="bg-[#5b9bd5] text-black">
            <th class="border border-black">VM Name #{{ index + 1 }}</th>
            <td class="border border-black font-bold">{{ rowData[4] }}</td>
          </tr>
          <tr>
            <th class="border border-black">IP Private</th>
            <td class="border border-black">{{ rowData[5] }}</td>
          </tr>
          <tr>
            <th class="border border-black">IP Public</th>
            <td class="border border-black">
              {{ rowData[6] }}
              <span class="ml-2 text-red-500">
                {{
                  rowData[10] && (
                    rowData[10].toLowerCase().includes('windows') ||
                    rowData[10].toLowerCase().includes('window')
                  )
                    ? 'RDP : 14322'
                    : 'SSH : 14321'
                }}
              </span>
            </td>
          </tr>
          <tr>
            <th class="border border-black">Username</th>
            <td class="border border-black">{{ rowData[11] }}</td>
          </tr>
          <tr>
            <th class="border border-black">vCPU</th>
            <td class="border border-black">{{ rowData[7] }}</td>
          </tr>
          <tr>
            <th class="border border-black">vRAM</th>
            <td class="border border-black">{{ rowData[8] }}</td>
          </tr>
          <tr>
            <th class="border border-black">vDisk</th>
            <td class="border border-black">{{ rowData[9] }}</td>
          </tr>
          <tr>
            <th class="border border-black">OS</th>
            <td class="border border-black">{{ rowData[10] }}</td>
          </tr>
        </tbody>
      </table>
      <!-- Policy -->
      <p class="text-[12pt] text-left text-black font-bold">Policy Firewall</p>
      <table class="text-left text-[14px]">
        <tbody>
          <tr class="bg-[#ffc000] text-black">
            <th class="border-1 border-black text-black w-[118px] pr-[5.4px] pl-[5.4px] text-left align-top">Port</th>
            <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px] w-[73.5px] text-left align-top">TCP or UDP</th>
            <td class="border-1 border-black text-black w-[441px] font-bold pr-[5.4px] pl-[5.4px] text-left align-top">
              Service or Protocol Name
            </td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">53</th>
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP/UDP</th>
            <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Domain Name System (DNS)</td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">80</th>
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP</th>
            <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Hypertext Transfer Protocol (HTTP)</td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">433</th>
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP</th>
            <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Secure Sockets Layer (SSL, or "HTTPS")</td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">123</th>
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">UDP</th>
            <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Network Time Protocol (NTP)</td>
          </tr>
          <tr class="bg-white text-red-500 border-1 border-black">
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">14321</th>
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP</th>
            <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">SSH (Secure Shell)</td>
          </tr>
          <tr class="bg-white text-red-500 border-1 border-black">
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">14322</th>
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP</th>
            <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Remote Desktop Protocol (RDP)</td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">-</th>
            <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">ICMP</th>
            <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Internet Control Message Protocol</td>
          </tr>
        </tbody>
      </table>

      <br />
      <p class="text-black text-left">
        ทั้งนี้ ทาง INET หวังเป็นอย่างยิ่งว่าผู้ใช้บริการจะได้รับความสะดวกในการทดสอบ
        หากต้องการสอบถามเพิ่มเติม สามารถติดต่อทาง INET ได้ตลอด 24 ชั่วโมง ทาง
        <a href="mailto:noc@inet.co.th" class="text-[#44656f]">noc@inet.co.th</a> และ 02-257-7111
      </p>
      <br />
      <p class="text-black text-left font-bold">หมายเหตุ : </p>
      <p class="text-black text-left">
        - หากทางผู้ใช้บริการต้องการให้ทาง INET ดำเนินการ Backup VM รบกวนแจ้งทาง INET ดำเนินการทาง
        <a href="mailto:noc@inet.co.th" class="text-[#44656f]">noc@inet.co.th</a><br />
        - ปัจจุบันทาง INET มีการปิดสิทธิ์การเข้าใช้งาน Administrator และ Root และทำการสร้างบันชีขึ้นมาใหม่
        ที่ระดับสิทธิ์เทียบเท่า เพื่อความปลอดภัยในการใช้งานระบบ Cloud หากทางผู้ใช้บริการต้องการเข้าถึงผ่าน
        Administrator และ Root รบกวนแจ้งทาง INET ดำเนินการทาง
        <a href="mailto:noc@inet.co.th" class="text-[#44656f]">noc@inet.co.th</a><br />
        - หากทางผู้ใช้บริการต้องการต่ออายุทดสอบ รบกวนแจ้งทางฝ่ายขายก่อนหมดอายุทดสอบ 7 วัน
        มิฉะนั้นทาง INET จะดำเนินการปิดทดสอบเมื่อครบกำหนดระยะเวลา<br />
        - บริษัทฯ จัดทำเอกสาร INET Cloud Service Terms of Use เพื่อให้ข้อมูลเกี่ยวกับข้อกำหนดหรือเงื่อนไขสำหรับการใช้บริการ
        ระหว่างผู้ใช้บริการกับบริษัทฯ ทั้งนี้ ไม่ว่าในขณะใดขณะหนึ่งก็ตาม บริษัทฯ สามารถทำการแก้ไขปรับปรุงข้อกำหนดและเงื่อนไขต่าง ๆ
        ที่ปรากฎในเอกสารนี้ได้ โดยไม่ต้องทำการแจ้งให้ผู้ใช้บริการทราบแต่อย่างใด
        ให้ถือเป็นความรับผิดชอบของผู้ใช้บริการที่จะต้องตรวจสอบรายละเอียดข้อกำหนดและเงื่อนไขสำหรับการใช้บริการอย่างสม่ำเสมอ<br />
        - ในการติดตั้ง Service ภายใน Operating System ของทางผู้ใช้บริการ ทาง INET แนะนำให้มีการ Setup Start Service Auto
        เพื่อเพิ่มประสิทธิภาพในการใช้บริการ Virtual Machine และสอดคล้องกับระบบ Virtual Machine ที่มีการ Auto Start
        กรณี Hardware Failure
      </p>
    </div>
  </div>
</template>