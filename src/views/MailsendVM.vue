<script setup>
import { ref, computed } from 'vue'
import { Copy, Check } from 'lucide-vue-next'
import Card from '../components/Card.vue'

/** ====== CONFIG ====== */
const API_BASE = 'https://backend-tools-provision.onrender.com'
const columns = ['C', 'O', 'P', 'Q', 'Z', 'AB', 'AC', 'AG', 'AH', 'AI', 'AJ', 'AS']
// 0:C(SO), 1:O(Customer), 2:P(Start), 3:Q(End),
// 4:Z(Name), 5:AB(Private), 6:AC(Public), 7:AG(vCPU), 8:AH(vRAM), 9:AI(vDisk), 10:AJ(OS), 11:AS(User)

/** ====== STATE ====== */
const inputs = ref([''])
const rows = ref([])             // [[..., ...], ...] ตาม columns
const headerRow = ref(null)      // [C,O,P,Q]
const isLoading = ref(false)
const showToast = ref(false)

const portal = ref('')
const portalguide = ref('')
const selectGuide = ref('')

/** ====== COMPUTED ====== */
const rowData = computed(() =>
  (headerRow.value && headerRow.value.length ? headerRow.value : (rows.value[0] || []))
)
const vmCount = computed(() => rows.value.length)

/** ====== ACTIONS ====== */
function addInput() { inputs.value.push('') }
function removeInput() { if (inputs.value.length > 1) inputs.value.pop() }
function resetData() {
  inputs.value = ['']
  rows.value = []
  headerRow.value = null
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

/** ====== FETCH ====== */
async function fetchData() {
  rows.value = []
  headerRow.value = null
  isLoading.value = true
  try {
    const queries = inputs.value
      .map(v => (v ?? '').toString().trim())
      .filter(v => v.length > 0)

    const columnsParam = columns.join(',')

    const groups = await Promise.all(
      queries.map(async (q) => {
        // เป็นเลขล้วน -> โหมด row เดี่ยว
        if (/^\d+$/.test(q)) {
          const url = `${API_BASE}/sheet?row=${encodeURIComponent(q)}&columns_sendVM=${encodeURIComponent(columnsParam)}`
          const res = await fetch(url, { cache: 'no-store' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          const rec = json?.data || {}
          const one = columns.map(col => (rec[col] ?? '-'))
          if (!headerRow.value) headerRow.value = [one[0], one[1], one[2], one[3]]
          return [one]
        }

        // เป็น SO-/POC- -> หลายเครื่อง
        const url = `${API_BASE}/sheet?so_number=${encodeURIComponent(q)}&columns_sendVM=${encodeURIComponent(columnsParam)}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()

        // header จาก json.header
        const h = json?.header || {}
        if (!headerRow.value) {
          headerRow.value = [(h['C'] ?? '-'), (h['O'] ?? '-'), (h['P'] ?? '-'), (h['Q'] ?? '-')]
        }

        // แปลง rows[].data -> อาร์เรย์ตาม columns
        const list = (json?.rows || []).map(item =>
          columns.map(col => (item?.data?.[col] ?? '-'))
        )
        return list
      })
    )

    rows.value = groups.flat()

    console.log('headerRow:', headerRow.value)
    console.log('rows:', rows.value)
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาด: ' + (err?.message || err))
  } finally {
    isLoading.value = false
  }
}
// หัวเมลแบบ static + dynamic
const mailSubject = computed(() => {
  const customer = rowData.value[1] || 'ชื่อบริษัท'
  return `[INET-Cloud Computing] รายละเอียดการทดสอบใช้บริการ Cloud IaaS ${customer}`
})
// ฟังก์ชันคัดลอกข้อความ

function copySubject() {
  navigator.clipboard.writeText(mailSubject.value).then(() => {
    showToast.value = true
    setTimeout(() => (showToast.value = false), 2000) // ซ่อนหลัง 2 วิ
  })
}
</script>

<template>
  <p class="text-2xl font-bold">Loop mail ส่งเครื่อง POC ✉️</p>
  <div class="p-4 space-y-4 bg-[#fff] rounded-2xl shadow-2xs">

    <!-- เลือกประเภท / เติม Portal -->
    <div class="text-left">
      <label class="text-xl font-bold">คู่การเข้าใช้งาน : </label>
      <select v-model="selectGuide" @change="validateDropdown" class="bg-white text-black rounded-xl border-2 p-2">
        <option value="">กรุณาเลือก</option>
        <option value="1">AHV</option>
        <option value="2">Cloud Open Source (Proxmox)</option>
      </select>
    </div>

    <div class="text-left">
      <label class="text-xl font-bold">Portal : </label>
      <div class="inline-block align-middle">
        <span class="bg-white text-black rounded-xl border-2 p-2 inline-block min-w-[220px]">{{ portal || '-' }}</span>
      </div>
    </div>

    <!-- เลขแถว -->
    <div v-for="(item, index) in inputs" :key="index" class="flex items-center gap-2">
      <label class="text-xl font-bold whitespace-nowrap">ป้อนเลข SO/POC  </label>
      <input
        v-model="inputs[index]"
        class="bg-white rounded-xl text-black text-xl p-2 w-full border-2"
        placeholder="เช่น 10000 หรือ SO-123456 หรือ POC-78910"
        inputmode="numeric"
        @keyup.enter="fetchData"
      />
    </div>
    <!-- กล่องข้อควาหัวเมล -->
    <div class="text-left">
  <label class="text-xl font-bold">หัวเมล:</label>
  <div class="relative">
    <!-- กล่องข้อความหัวเมล -->
    <input
      type="text"
      :value="mailSubject"
      readonly
      class="bg-white rounded-xl text-black text-xl p-2 w-full border-2 pr-12"
    />

    <!-- ปุ่มคัดลอก -->
    <button
      type="button"
      @click="copySubject"
      class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-gray-100"
        title="คัดลอก"
      >
      <Copy class="w-5 h-5" />
    </button>
  </div>
</div>
<!-- Toast -->
  <transition name="fade">
    <div
      v-if="showToast"
      class="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
    >
      <Check class="w-5 h-5" />
      <span>คัดลอกหัวเมลเรียบร้อย ✅</span>
    </div>
  </transition>
  <!-- ปุ่มดึงข้อมูล  -->
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
  <div v-if="rows.length > 0" class="font-serif bg-white p-2 mt-2">
    <!-- ส่วนหัวจดหมาย -->
    <p class="text-[#0000ff] text-left text-[14px] font-bold">*** Confidential ***</p>
    <br />
    <p class="text-black text-left  text-[14px]">เรียนผู้ใช้บริการ</p>
    <br />
    <div class="w-full text-left">
      <span class="whitespace-pre-wrap text-black bg-transparent font-normal not-italic align-baseline no-underline text-[14px]">
        ทางบริษัท อินเทอร์เน็ตประเทศไทย จำกัด (มหาชน) (INET)
        ขอขอบพระคุณผู้ใช้บริการเป็นอย่างสูงที่ให้ความไว้วางใจทดสอบใช้บริการ Cloud (ไม่เสียค่าบริการ)
        โดยทาง INET ขออนุญาตแจ้งรายละเอียดบริการและรายละเอียดของระบบ ดังนี้
      </span>
      <p class="text-black text-[14px]">
        <span class="font-bold"><br />รบกวนผู้ใช้บริการตรวจสอบการใช้งาน Service และยืนยันผลการใช้งาน</span>
        : ____________ ( โปรดระบุ: <span class="bg-[#00ff00]">ใช้งานได้</span>/
        <span class="bg-[#ff0000]">ใช้งานไม่ได้</span> )
      </p>
    </div>
    <br />

    <!-- ตารางหัว SO/Customer/Period -->
    <div class="font-sans text-[14px] text-left">
       <table class="table-fixed  border border-black border-collapse bg-white w-[600px]">
    <colgroup>
      <col class="w-[155px]" />
      <col class="w-[360px]" />
    </colgroup>
        <tbody>
          <tr class="border-1 border-black">
            <th class="border-1 border-black bg-[#bfbfbf] p-2 
">SO-NUMBER</th>
            <td class="w-[350px] p-2">{{ rowData[0] }}</td>
          </tr>
          <tr class="border-1 border-black">
            <th class="border-1 border-black bg-[#bfbfbf] p-2">Customer Name</th>
            <td class="p-2">{{ rowData[1] }}</td>
          </tr>
          <tr class="border-1 border-black">
            <th class="border-1 border-black bg-[#bfbfbf] p-2">Service</th>
            <td class="p-2">IaaS</td>
          </tr>
          <tr>
            <th class="border-1 border-black bg-[#bfbfbf] p-2">ระยะเวลาในการทดสอบ</th>
            <td class="p-2">
              {{ rowData[2]?.replace(/-/g, '/') }} - {{ rowData[3]?.replace(/-/g, '/') }}
            </td>
          </tr>
        </tbody>
      </table>
      <br />

      <!-- Portal Guide -->
      <table class="text-black  border-1 border-black text-left bg-white text-[14px] w-[600px] py-0 px-[7.2px]">
        <tbody>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] p-2 w-[180px] ">
              Terms of Use <br />
            </th>
            <td class="p-2 border-1">
            <a href="https://ocp-cloud.inet.co.th/owncloud/index.php/s/dVtV53eqo10Hrmj" target="_blank" rel="noopener noreferrer" class="text-black underline decoration-[#1155cc]">
                https://ocp-cloud.inet.co.th/owncloud/index.php/s/dVtV53eqo10Hrmj</a>
            </td>
          </tr>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] p-2 text-left ">
              SLA<br /> 
            </th>
            <td class="p-2 border-1">
              <a href="https://ocp-cloud.inet.co.th/owncloud/index.php/s/7mmzlX0fQp7FfsW" target="_blank" rel="noopener noreferrer" class="text-black underline decoration-[#1155cc]">
                https://ocp-cloud.inet.co.th/owncloud/index.php/s/7mmzlX0fQp7FfsW
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <br />

      <p class="font-bold">สำหรับการ Activate การใช้งาน รบกวนผู้ใช้บริการเข้าใช้งานผ่าน Web Portal เพื่อดำเนินการ Power On VM</p>
      <br />
      <table class="text-black  border-1 border-black text-left bg-white text-[14px] w-[600px]">
        <tbody>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] p-2 w-[180px]">
              Portal Manual<br />{{ portal || '-' }}
            </th>
            <td class="p-2 border-1">
              <a :href="portalguide || '#'" target="_blank" rel="noopener noreferrer" class="text-black underline decoration-[#1155cc]">
                {{ portalguide || '-' }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <br />


      <!-- สรุปเครื่องรวม -->
      <table class="text-black border-1 border-black text-left bg-white text-[14px] w-[600px]">
        
        <tbody>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] p-2  w-[180px]">Link Portal</th>
            <td class="border-1 border-black text-red bg-[#bfbfbf] p-2">XXX</td>
            <th class="border-1 border-black text-black bg-[#bfbfbf] p-2 w-[154.521px]">Note</th>
          </tr>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] p-2 ">Username</th>
            <td class="border-1 border-black text-black p-2">XXX</td>
            <td class="border-1 border-black text-black p-2"></td>
          </tr>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] text-left align-top p-2">Password</th>
            <td class="border-1 border-black text-black p-2">
              จัดส่งทางอีเมลล์ถัดไป ทาง Email :<br /> XXX@XXX.com
            </td>
            <td class="border-1 border-black text-black p-2"></td>
          </tr>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] p-2">จำนวน VM</th>
            <td class="border-1 border-black text-black p-2">{{ vmCount }}</td>
            <td class="border-1 border-black text-black p-2"></td>
          </tr>
        </tbody>
      </table>
      <br />

      <!-- รายการ VM ตาม rows -->
      <div v-for="(rowData, index) in rows" :key="index" class="mb-8">
        <table class="bg-white text-black border-1 border-black text-left text-[14px] w-[600px]">
          <tbody>
            <tr class="bg-[#5b9bd5] text-black border-1 border-black">
              <th class="border-1 border-black text-black p-2  w-[180px]">VM Name #{{ index + 1 }}</th>
              <td class="border-1 border-black text-black font-bold p-2">{{ rowData[4] }}</td>
              <th class="border-1 border-black text-black p-2 w-[154.521px]">Note</th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black p-2">IP Private</th>
              <td class="border-1 border-black text-black p-2">{{ rowData[5] }}</td>
              <th class="border-1 border-black text-black p-2"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black text-left align-top p-2">IP Public</th>
              <td class="border-1 border-black text-black text-left align-top p-2">{{ rowData[6] }}</td>
              <td class="border-1 border-black text-red-500 p-2">
                {{
                  rowData[10] && (
                    rowData[10].toLowerCase().includes('windows') ||
                    rowData[10].toLowerCase().includes('window')
                  )
                    ? 'RDP : 14322'
                    : 'SSH : 14321'
                }}
              </td>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black p-2">Username</th>
              <td class="border-1 border-black text-black p-2">{{ rowData[11] }}</td>
              <th class="border-1 border-black text-black p-2"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black text-left align-top p-2">Password</th>
              <td class="border-1 border-black text-black p-2">
                จัดส่งทางอีเมลล์ถัดไป ทาง Email : <br /> XXX@XXX.com
              </td>
              <th class="border-1 border-black text-black p-2"></th>
            </tr>
            <tr class="bg-[#70ad47] text-black border-1 border-black">
              <th class="border-1 border-black text-black p-2">Specification</th>
              <td class="border-1 border-black text-black p-2"></td>
              <th class="border-1 border-black text-black p-2"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black p-2">vCPU (core)</th>
              <td class="border-1 border-black text-black p-2">{{ rowData[7] }}</td>
              <th class="border-1 border-black text-black p-2"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black p-2">vRAM (GB)</th>
              <td class="border-1 border-black text-black p-2">{{ rowData[8] }}</td>
              <th class="border-1 border-black text-black p-2"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black p-2">vDisk (GB)</th>
              <td class="border-1 border-black text-black p-2">{{ rowData[9] }}</td>
              <th class="border-1 border-black text-black p-2"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black p-2">OS</th>
              <td class="border-1 border-black text-black p-2">{{ rowData[10] }}</td>
              <th class="border-1 border-black text-black p-2"></th>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Policy -->
      <p class="text-[12pt] text-left text-black font-bold">Policy Firewall</p>
      <table class="text-left text-[14px] w-[600px]">
        <tbody>
          <tr class="bg-[#ffc000] text-black">
            <th class="border-1 border-black text-black w-[118px] p-2 text-left align-top">Port</th>
            <th class="border-1 border-black text-black p-2 w-[73.5px] text-left align-top">TCP or UDP</th>
            <td class="border-1 border-black text-black w-[441px] font-bold p-2 text-left align-top">
              Service or Protocol Name
            </td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black p-2">53</th>
            <th class="border-1 border-black p-2">TCP/UDP</th>
            <td class="border-1 border-black p-2">Domain Name System (DNS)</td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black p-2">80</th>
            <th class="border-1 border-black p-2">TCP</th>
            <td class="border-1 border-black p-2">Hypertext Transfer Protocol (HTTP)</td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black p-2">443</th>
            <th class="border-1 border-black p-2">TCP</th>
            <td class="border-1 border-black p-2">Secure Sockets Layer (SSL, or "HTTPS")</td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black p-2">-</th>
            <th class="border-1 border-black p-2">ICMP</th>
            <td class="border-1 border-black p-2">Internet Control Message Protocol</td>
          </tr>
          <tr class="bg-white text-black border-1 border-black">
            <th class="border-1 border-black p-2">123</th>
            <th class="border-1 border-black p-2">UDP</th>
            <td class="border-1 border-black p-2">Network Time Protocol (NTP)</td>
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
        - ปัจจุบันทาง INET จะปิดการเข้าถึงผ่าน Public ทั้งจากภายนอก VM และภายใน VM เพื่อความปลอดภัยในการใช้งานระบบ Cloud หากทางผู้ใช้บริการต้องการเข้าถึงผ่าน Public รบกวนแจ้งทาง INET ดำเนินการทาง noc@inet.co.th <br />
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