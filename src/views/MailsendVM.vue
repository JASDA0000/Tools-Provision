<script setup>
import { ref, computed } from 'vue'
import { Plus, Minus } from 'lucide-vue-next'

/** ====== CONFIG ====== */
const API_BASE = 'https://backend-tools-provision.onrender.com' // <-- backend ของคุณ
const columns = ['C', 'O', 'P', 'Q', 'Z', 'AB', 'AC', 'AG', 'AH', 'AI', 'AJ', 'AS']

/** ====== STATE ====== */
const inputs = ref([''])           // ค่าที่ผู้ใช้กรอก (row number หรือ SO-/POC-)
const rows = ref([])               // รายการ VM (หลายเครื่อง)
const headerRow = ref(null)        // เก็บหัวตาราง (SO, Customer, Period)
const isLoading = ref(false)

const portal = ref('')
const portalguide = ref('')
const selectGuide = ref('')

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

const rowData = computed(() => headerRow.value || rows.value[0] || [])
const vmCount = computed(() => rows.value.length)

/** ดึงข้อมูลจาก API */
async function fetchData() {
  rows.value = []
  headerRow.value = null
  isLoading.value = true
  try {
    const queryList = inputs.value
      .map(r => (r ?? '').toString().trim())
      .filter(r => r.length > 0)

    const columnsParam = columns.join(',')
    const groups = await Promise.all(
      queryList.map(async (query) => {
        // 1) ถ้าเป็นเลข → ดึงด้วย row
        if (/^\d+$/.test(query)) {
          const url = `${API_BASE}/sheet?row=${encodeURIComponent(query)}&columns_sendVM=${encodeURIComponent(columnsParam)}`
          const res = await fetch(url, { cache: 'no-store' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          const rec = json?.data || {}
          const oneRow = columns.map(col => (rec[col] ?? '-'))
          return [oneRow]
        }

        // 2) ถ้าเป็น SO-/POC- → ดึงแบบหลาย VM
        const url = `${API_BASE}/sheet?so_number=${encodeURIComponent(query)}&columns_sendVM=${encodeURIComponent(columnsParam)}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()

        // เก็บ header (C,O,P,Q)
        const h = json?.header || {}
        headerRow.value = [
          (h['C'] ?? '-'), // SO
          (h['O'] ?? '-'), // Customer
          (h['P'] ?? '-'), // Start
          (h['Q'] ?? '-')  // End
        ]

        // แปลง VM rows
        const list = (json?.rows || []).map(rec =>
          columns.map(col => (rec?.[col] ?? '-'))
        )
        return list
      })
    )

    rows.value = groups.flat()

    // debug log
    console.log('headerRow', headerRow.value)
    console.log('rows', rows.value)

  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาด: ' + (err?.message || err))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Input -->
    <div v-for="(item, index) in inputs" :key="index" class="flex gap-2 my-2">
      <input
        v-model="inputs[index]"
        placeholder="เช่น 10000 หรือ SO-xxxx หรือ POC-xxxx"
        class="border-1 border-black rounded px-[7.2px] py-[5.4px] w-full"
      />
      <template v-if="index === inputs.length - 1">
        <button @click="addInput" class="bg-green-500 text-white px-[5.4px] py-[2.7px] rounded"><Plus class="w-4 h-4" /></button>
        <button @click="removeInput" class="bg-red-500 text-white px-[5.4px] py-[2.7px] rounded"><Minus class="w-4 h-4" /></button>
      </template>
    </div>

    <div class="mt-2">
      <button @click="fetchData" :disabled="isLoading" class="bg-blue-600 text-white px-[10.8px] py-[5.4px] rounded mr-2">
        {{ isLoading ? 'กำลังโหลด...' : 'ดึงข้อมูล' }}
      </button>
      <button @click="resetData" class="bg-gray-500 text-white px-[10.8px] py-[5.4px] rounded">รีเซต</button>
    </div>

    <br />

    <!-- ตารางหัว SO/Customer/Period -->
    <div class="font-sans text-[14px]">
      <table class="text-left text-black border-1 border-black bg-white py-0 px-[7.2px]">
        <tbody>
          <tr class="border-1 border-black">
            <th class="border-1 border-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">SO-NUMBER</th>
            <td class="w-[350px] pr-[5.4px] pl-[5.4px]">{{ rowData[0] }}</td>
          </tr>
          <tr class="border-1 border-black">
            <th class="border-1 border-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Customer Name</th>
            <td class="pr-[5.4px] pl-[5.4px]">{{ rowData[1] }}</td>
          </tr>
          <tr class="border-1 border-black">
            <th class="border-1 border-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Service</th>
            <td class="pr-[5.4px] pl-[5.4px]">IaaS</td>
          </tr>
          <tr>
            <th class="border-1 border-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">ระยะเวลาในการทดสอบ</th>
            <td class="pr-[5.4px] pl-[5.4px]">
              {{ rowData[2]?.replace(/-/g, '/') }} - {{ rowData[3]?.replace(/-/g, '/') }}
            </td>
          </tr>
        </tbody>
      </table>
      <br />

      <!-- สรุปเครื่องรวม -->
      <table class="text-black border-1 border-black text-left bg-white text-[14px]">
        <tbody>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Link Portal</th>
            <td class="border-1 border-black text-red bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">XXX</td>
            <th class="border-1 border-black text-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px] w-[154.521px]">Note</th>
          </tr>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Username</th>
            <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">XXX</td>
            <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></td>
          </tr>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] text-left align-top pr-[5.4px] pl-[5.4px]">Password</th>
            <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">
              จัดส่งทางอีเมลล์ถัดไป ทาง Email :<br /> XXX@XXX.com
            </td>
            <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></td>
          </tr>
          <tr>
            <th class="border-1 border-black text-black bg-[#bfbfbf] py-0 px-[7.2px]">จำนวน VM</th>
            <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{ vmCount }}</td>
            <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></td>
          </tr>
        </tbody>
      </table>
      <br />

      <!-- รายการ VM -->
      <div v-for="(rowData, index) in rows" :key="index" class="mb-8">
        <table class="bg-white text-black border-1 border-black text-left text-[14px]">
          <tbody>
            <tr class="bg-[#5b9bd5] text-black border-1 border-black">
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">VM Name #{{ index + 1 }}</th>
              <td class="border-1 border-black text-black font-bold pr-[5.4px] pl-[5.4px]">{{ rowData[4] }}</td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px] w-[154.521px]">Note</th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">IP Private</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{ rowData[5] }}</td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black text-left align-top pr-[5.4px] pl-[5.4px]">IP Public</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px] text-left align-top">{{ rowData[6] }}</td>
              <td class="border-1 border-black text-red-500 pr-[5.4px] pl-[5.4px]">
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
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">Username</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{ rowData[11] }}</td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black text-left align-top pr-[5.4px] pl-[5.4px]">Password</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">
                จัดส่งทางอีเมลล์ถัดไป ทาง Email : <br /> XXX@XXX.com
              </td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
            </tr>
            <tr class="bg-[#70ad47] text-black border-1 border-black">
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">Specification</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">vCPU (core)</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{ rowData[7] }}</td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">vRAM (GB)</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{ rowData[8] }}</td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">vDisk (GB)</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{ rowData[9] }}</td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
            </tr>
            <tr class="text-black border-1 border-black">
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">OS</th>
              <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{ rowData[10] }}</td>
              <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
            </tr>
          </tbody>
        </table>
      </div>


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