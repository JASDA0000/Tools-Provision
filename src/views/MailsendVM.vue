<script setup>
import { ref, computed } from 'vue'

const inputs = ref(['']);  // ใส่เลขแถวที่ต้องการดึงข้อมูล เช่น ['101']
const rows = ref([]);
const selectGuide = ref('');
const portalguide = ref();
const portal = ref();
const isLoading = ref(false); 
const columns = ['C', 'O', 'P', 'Q', 'Z', 'AB', 'AC', 'AG', 'AH', 'AI', 'AJ'];
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
// สร้าง computed เพื่อดึงข้อมูลแถวแรกมาใช้ใน template
const rowData = computed(() => rows.value[0] || []);
const vmCount = computed(() => {
    return inputs.value.filter(i => i.trim() !== '').length;
});

async function fetchData() {
    rows.value = [];
    isLoading.value = true;
    try {
        for (const row of inputs.value) {
            if (row.trim() !== '') {
                const columnsParam = columns.join(',');
                const url = `http://localhost:5000/sheet?row=${row.trim()}&columns_sendVM=${encodeURIComponent(columnsParam)}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data = await res.json();
                console.log(data);

                const rowValues = columns.map(col => data[`${col}${row.trim()}`] || '-');
                rows.value.push(rowValues);
            }
        }
        isLoading.value = true;
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }finally{
      isLoading.value = false;
    }
}
function validateDropdown() {
  if (selectGuide.value === '1') {
    portal.value = 'AHV'
    portalguide.value = 'https://ocp-cloud.inet.co.th/owncloud/index.php/s/rM7ERfrMt2GaBGP';
  } else if (selectGuide.value === '2') {
    portal.value = "(Cloud-Open Source)"
    portalguide.value = 'https://ocp-cloud.inet.co.th/owncloud/index.php/s/76XijkVXFQCseBa';
  } else {
    portalguide.value = '';
  }
}

</script>
<template lang="">
    <div class="p-4 space-y-4">
        <p class="text-2xl font-bold">Loop mail ส่งเครื่อง ✉️</p>
        <div class="text-left">
            <label for="" class="text-xl">คู่การเข้าใช้งาน : </label>
            <select v-model="selectGuide" @change="validateDropdown" class="bg-white text-black" >
                <option value="">กรุณาเลือก</option>
                <option value="1">AHV</option>
                <option value="2">Cloud Open Source (Proxmox)</option>
            </select>
        </div>
        <div v-for="(item, index) in inputs" :key="index" class="flex items-center gap-2">
        <label class="text-xl">แถว:</label>
        <input v-model="inputs[index]" class="bg-white rounded-xl text-black text-xl p-2 w-full"
          placeholder="เช่น 10000" />
           <template v-if="index === inputs.length - 1">
    <button @click="addInput" class="bg-green-500 text-white px-3 py-1 rounded-xl hover:opacity-70">+</button>
    <button @click="removeInput" class="bg-red-500 text-white px-3 py-1 rounded-xl hover:opacity-70">−</button>
  </template>

</div>
<button @click="fetchData" :disabled="isLoading" class="bg-[#47ba87] text-white px-6 py-2 rounded-xl hover:opacity-80 mt-4 mr-2">
    {{ isLoading ? 'กำลังโหลด...' : 'ดึงข้อมูล' }}
</button>
<!-- spin-animate -->
<div v-if="isLoading" class="flex items-center justify-center mt-4 text-[#47ba87]">
      <svg
        class="animate-spin h-6 w-6 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8z" />
      </svg>
      <span class="text-lg">กำลังโหลดข้อมูล...</span>
    </div>
<p class="text-2xl font-bold">Mail Send VM</p>
<div v-if="rows.length > 0">

    <!-- ตาราง POC,ชื่อ,ระยะเวลาในการทดสอบ -->
    <div class="font-sans">
        <table class="text-left text-black border-1 border-black bg-white">
            <tbody>
                <tr class="border-1 border-black">
                    <th class="border-1 border-black bg-[#bfbfbf]">SO-NUMBER</th>
                    <td>{{rowData[0]}}</td>
                </tr>
                <tr class="border-1 border-black">
                    <th class="border-1 border-black bg-[#bfbfbf]">Customer Name</th>
                    <td>{{rowData[1]}}</td>
                </tr>
                <tr class="border-1 border-black">
                    <th class="border-1 border-black bg-[#bfbfbf]">Service</th>
                    <td>IaaS</td>
                </tr>
                <tr>
                    <th class="border-1 border-black bg-[#bfbfbf]">
                        ระยะเวลาในการทดสอบ
                    </th>
                    <td>{{ rowData[2]?.replace(/-/g, '/') }} - {{ rowData[3]?.replace(/-/g, '/') }}</td>
                </tr>
            </tbody>
        </table>
        <br>
        <table>
            <tbody>
                <tr class="border-1 border-black text-black">
                    <th class="bg-[#bfbfbf] text-black border-1 border-black text-left">Terms of Use</th>
                    <td class="bg-white">https://ocp-cloud.inet.co.th/owncloud/index.php/s/dVtV53eqo10Hrmj</td>
                </tr>
                <tr class="border-1 border-black text-black">
                    <th class="bg-[#bfbfbf] text-black border-1 border-black text-left ">SLA</th>
                    <td class="bg-white">https://ocp-cloud.inet.co.th/owncloud/index.php/s/7mmzlX0fQp7FfsW</td>
                </tr>
            </tbody>
        </table>
        <br>
        <!-- Portal Guide -->
        <table class="text-black border-1 border-black text-left bg-white">
            <tbody>
                <tr>
                    <th class="border-1 border-black text-black">Portal Manual {{portal}}</th>
                    <td>{{portalguide}}</td>
                </tr>
            </tbody>
        </table>
        <br>
        <!-- สรุปเครื่อง ลิ้งค์ Portal -->
        <table class="text-black border-1 border-black text-left bg-white">
            <tbody>
                <tr>
                    <th class="border-1 border-black text-black">Link Portal</th>
                    <td class="border-1 border-black text-black">s</td>
                    <th class="border-1 border-black text-black">Note</th>
                </tr>
                <tr>
                    <th class="border-1 border-black text-black">Username</th>
                    <td class="border-1 border-black text-black">XXX</td>
                    <td class="border-1 border-black text-black"></td>
                </tr>
                <tr>
                    <th class="border-1 border-black text-black">Password</th>
                    <td class="border-1 border-black text-black">จัดส่งทางอีเมลล์ถัดไป ทาง Email :</td>
                    <td class="border-1 border-black text-black"></td>
                </tr>
                <tr>
                    <th class="border-1 border-black text-black">จำนวน VM</th>
                    <td class="border-1 border-black text-black">{{vmCount}}</td>
                    <td class="border-1 border-black text-black"></td>
                </tr>
            </tbody>
        </table>
        <br>
        <div v-for="(rowData, index) in rows" :key="index" class="mb-8">
            <table class="bg-white text-black border-1 border-black text-left">
                <tbody>
                    <tr class="bg-[#5b9bd5] text-black border-1 border-black">
                        <th class="border-1 border-black text-black">VM Name</th>
                        <td class="border-1 border-black text-black font-bold">{{ rowData[4]}}</td>
                        <th class="border-1 border-black text-black">Note</th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black">IP Private</th>
                        <td class="border-1 border-black text-black">{{rowData[5]}}</td>
                        <th class="border-1 border-black text-black"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black">IP Public</th>
                        <td class="border-1 border-black text-black">{{rowData[6]}}</td>
                        <th class="border-1 border-black text-black">SSH,RDP</th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black">Username</th>
                        <td class="border-1 border-black text-black"></td>
                        <th class="border-1 border-black text-black"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black">Password</th>
                        <td class="border-1 border-black text-black">จัดส่งทางอีเมลล์ถัดไป ทาง Email :</td>
                        <th class="border-1 border-black text-black"></th>
                    </tr>
                    <tr class="bg-[#70ad47] text-black border-1 border-black ">
                        <th class="border-1 border-black text-black">Specification</th>
                        <td class="border-1 border-black text-black"></td>
                        <th class="border-1 border-black text-black"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black">vCPU (core)</th>
                        <td class="border-1 border-black text-black">{{rowData[7]}}</td>
                        <th class="border-1 border-black text-black"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black">vRAM (GB)</th>
                        <td class="border-1 border-black text-black">{{rowData[8]}}</td>
                        <th class="border-1 border-black text-black"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black">vDisk (GB)</th>
                        <td class="border-1 border-black text-black">{{rowData[9]}}</td>
                        <th class="border-1 border-black text-black"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black ">
                        <th class="border-1 border-black text-black">OS</th>
                        <td class="border-1 border-black text-black">{{rowData[10]}}</td>
                        <th class="border-1 border-black text-black"></th>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="text-xl">Policy Firewall</p>
        <table class="text-left">
            <tbody>
                <tr class="bg-[#ffc000] text-black">
                    <th class="border-1 border-black text-black">Port</th>
                    <th class="border-1 border-black text-black">TCP or UDP</th>
                    <td class="border-1 border-black text-black">Service or Protocol Name</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black">53</th>
                    <th class="border-1 border-black">TCP/UDP</th>
                    <td class="border-1 border-black">Domain Name System (DNS)</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black">80</th>
                    <th class="border-1 border-black">TCP</th>
                    <td class="border-1 border-black">Hypertext Transfer Protocol (HTTP)</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black">433</th>
                    <th class="border-1 border-black">TCP</th>
                    <td class="border-1 border-black">Secure Sockets Layer (SSL, or "HTTPS")</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black">123</th>
                    <th class="border-1 border-black">UDP</th>
                    <td class="border-1 border-black">Network Time Protocol (NTP)</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black">14321</th>
                    <th class="border-1 border-black">TCP</th>
                    <td class="border-1 border-black">SSH (Secure Shell)</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black">14322</th>
                    <th class="border-1 border-black">TCP</th>
                    <td class="border-1 border-black">Remote Desktop Protocol (RDP)</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black">-</th>
                    <th class="border-1 border-black">ICMP</th>
                    <td class="border-1 border-black">Internet Control Message Protocol</td>
                </tr>
            </tbody>
        </table>
</div>
</div>
</div>
</template>
<style lang="">

</style>