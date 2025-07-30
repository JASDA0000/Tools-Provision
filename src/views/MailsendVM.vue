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
                const url = `https://backend-tools-provision.onrender.com/sheet?row=${row.trim()}&columns_sendVM=${encodeURIComponent(columnsParam)}`;
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
    portal.value = `(Cloud-Open Source)`
    portalguide.value = 'https://ocp-cloud.inet.co.th/owncloud/index.php/s/76XijkVXFQCseBa';
  } else {
    portalguide.value = '';
  }

}

</script>
<template lang="">
    <div class="p-4 space-y-4 bg-[#fff] rounded-2xl shadow-2xs">
        <p class="text-2xl font-bold">Loop mail ส่งเครื่อง POC ✉️</p>
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
</div>
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
<div v-if="rows.length > 0" class="font-serif bg-white p-2 mt-2">
    <!-- ตาราง POC,ชื่อ,ระยะเวลาในการทดสอบ -->
    <p class="text-[#0000ff] text-left text-[14px]">*** Confidential ***</p>
    <br>
    <p class="text-black text-left font-bold text-[14px]">เรียนผู้ใช้บริการ</p>
    <br>
    <div class="w-full text-left">
  <span class="whitespace-pre-wrap text-black bg-transparent font-normal not-italic align-baseline no-underline text-[14px]">
    ทางบริษัท อินเทอร์เน็ตประเทศไทย จำกัด (มหาชน) (INET) ขอขอบพระคุณผู้ใช้บริการเป็นอย่างสูงที่ให้ความไว้วางใจทดสอบใช้บริการ Cloud (ไม่เสียค่าบริการ)
โดยทาง INET ขออนุญาตแจ้งรายละเอียดบริการและรายละเอียดของระบบ ดังนี้
  </span>
  <p class="text-black text-[14px]"><span class="font-bold"><br>
รบกวนผู้ใช้บริการตรวจสอบการใช้งาน Service และยืนยันผลการใช้งาน
  </span> : ____________ ( โปรดระบุ: <span class="bg-[#00ff00]">ใช้งานได้</span>/ <span class="bg-[#ff0000]">ใช้งานไม่ได้</span> ) </p>
</div><br>
    <div class="font-sans text-[14px]" ref="tableWrapper">
        <table class="text-left text-black border-1 border-black bg-white py-0 px-[7.2px]">
            <tbody>
                <tr class="border-1 border-black">
                    <th class="border-1 border-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">SO-NUMBER</th>
                    <td class="w-[350px] pr-[5.4px] pl-[5.4px]">{{rowData[0]}}</td>
                </tr>
                <tr class="border-1 border-black">
                    <th class="border-1 border-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Customer Name</th>
                    <td class="pr-[5.4px] pl-[5.4px]">{{rowData[1]}}</td>
                </tr>
                <tr class="border-1 border-black">
                    <th class="border-1 border-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Service</th>
                    <td class="pr-[5.4px] pl-[5.4px]">IaaS</td>
                </tr>
                <tr>
                    <th class="border-1 border-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">
                        ระยะเวลาในการทดสอบ
                    </th>
                    <td class="pr-[5.4px] pl-[5.4px]">{{ rowData[2]?.replace(/-/g, '/') }} - {{ rowData[3]?.replace(/-/g, '/') }}</td>
                </tr>
            </tbody>
        </table>
        <br>
        <table>
            <tbody class="py-0 px-[7.2px] text-[14px]">
                <tr class="border-1 border-black text-black ห">
                    <th class="bg-[#bfbfbf] text-black border-1 border-black text-left pr-[5.4px] pl-[5.4px]">Terms of Use</th>
                    <td class="bg-white">
                        <a href="https://ocp-cloud.inet.co.th/owncloud/index.php/s/dVtV53eqo10Hrmj" target="_blank" rel="noopener noreferrer" class="text-black underline decoration-[#1155cc]">
                    https://ocp-cloud.inet.co.th/owncloud/index.php/s/dVtV53eqo10Hrmj</a>
                    </td>
                </tr>
                <tr class="border-1 border-black text-black">
                    <th class="bg-[#bfbfbf] text-black border-1 border-black text-left pr-[5.4px] pl-[5.4px]">SLA</th>
                    <td class="bg-white pr-[5.4px] pl-[5.4px]">
                        <a href="https://ocp-cloud.inet.co.th/owncloud/index.php/s/7mmzlX0fQp7FfsW" target="_blank" rel="noopener noreferrer" class="text-black underline decoration-[#1155cc]">
                        https://ocp-cloud.inet.co.th/owncloud/index.php/s/7mmzlX0fQp7FfsW</a></td>
                </tr>
            </tbody>
        </table>
        <br>
        <!-- Portal Guide -->
        <table class="text-black border-1 border-black text-left bg-white text-[14px]">
            <tbody>
                <tr>
                    <th class="border-1 border-black text-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Portal Manual <br>{{portal}}</th>
                    <td class="pr-[5.4px] pl-[5.4px]"><a :href="portalguide" target="_blank" rel="noopener noreferrer" class="text-black underline decoration-[#1155cc]">{{portalguide}}</a></td>
                </tr>
            </tbody>
        </table>
        <br>
        <!-- สรุปเครื่อง ลิ้งค์ Portal -->
        <table class="text-black border-1 border-black text-left bg-white text-[14px]">
            <tbody>
                <tr>
                    <th class="border-1 border-black text-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Link Portal</th>
                    <td class="border-1 border-black text-red bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">XXX</td>
                    <th class="border-1 border-black text-black  bg-[#bfbfbf] pr-[5.4px] pl-[5.4px] w-[154.521px]">Note</th>
                </tr>
                <tr>
                    <th class="border-1 border-black text-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px]">Username</th>
                    <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">XXX</td>
                    <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></td>
                </tr>
                <tr>
                    <th class="border-1 border-black text-black bg-[#bfbfbf] pr-[5.4px] pl-[5.4px] text-left align-top">Password</th>
                    <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">จัดส่งทางอีเมลล์ถัดไป ทาง Email : <br> XXX@XXX.com</td>
                    <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></td>
                </tr>
                <tr>
                    <th class="border-1 border-black text-black bg-[#bfbfbf] py-0 px-[7.2px]">จำนวน VM</th>
                    <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{vmCount}}</td>
                    <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></td>
                </tr>
            </tbody>
        </table>
        <br>
        <div v-for="(rowData, index) in rows" :key="index" class="mb-8">
            <table class="bg-white text-black border-1 border-black text-left text-[14px]">
                <tbody>
                    <tr class="bg-[#5b9bd5] text-black border-1 border-black">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">VM Name #{{index + 1}}</th>
                        <td class="border-1 border-black text-black font-bold pr-[5.4px] pl-[5.4px]">{{ rowData[4]}}</td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px] w-[154.521px]">Note</th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">IP Private</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{rowData[5]}}</td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black text-left align-top pr-[5.4px] pl-[5.4px]">IP Public</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px] text-left align-top ">{{rowData[6]}}</td>
                        <td class="border-1 border-black text-red-500 pr-[5.4px] pl-[5.4px]">SSH : 14321,RDP : 14322</td>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">Username</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">XXX</td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px] text-left align-top">Password</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">จัดส่งทางอีเมลล์ถัดไป ทาง Email : <br> XXX@XXX.com</td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
                    </tr>
                    <tr class="bg-[#70ad47] text-black border-1 border-black ">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">Specification</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">vCPU (core)</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{rowData[7]}}</td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">vRAM (GB)</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{rowData[8]}}</td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">vDisk (GB)</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{rowData[9]}}</td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
                    </tr>
                    <tr class=" text-black border-1 border-black ">
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">OS</th>
                        <td class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]">{{rowData[10]}}</td>
                        <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px]"></th>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="text-[12pt] text-left text-black font-bold">Policy Firewall</p>
        <table class="text-left text-[14px]">
            <tbody>
                <tr class="bg-[#ffc000] text-black">
                    <th class="border-1 border-black text-black w-[118px] pr-[5.4px] pl-[5.4px] text-left align-top">Port</th>
                    <th class="border-1 border-black text-black pr-[5.4px] pl-[5.4px] w-[73.5px] text-left align-top">TCP or UDP</th>
                    <td class="border-1 border-black text-black w-[441px] font-bold pr-[5.4px] pl-[5.4px] text-left align-top">Service or Protocol Name</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">53</th>
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP/UDP</th>
                    <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Domain Name System (DNS)</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">80</th>
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP</th>
                    <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Hypertext Transfer Protocol (HTTP)</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">433</th>
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP</th>
                    <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Secure Sockets Layer (SSL, or "HTTPS")</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">123</th>
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">UDP</th>
                    <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Network Time Protocol (NTP)</td>
                </tr>
                <tr class=" bg-white text-red-500 border-1 border-black">
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">14321</th>
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP</th>
                    <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">SSH (Secure Shell)</td>
                </tr>
                <tr class=" bg-white text-red-500 border-1 border-black">
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">14322</th>
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">TCP</th>
                    <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Remote Desktop Protocol (RDP)</td>
                </tr>
                <tr class=" bg-white text-black border-1 border-black">
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">-</th>
                    <th class="border-1 border-black pr-[5.4px] pl-[5.4px]">ICMP</th>
                    <td class="border-1 border-black pr-[5.4px] pl-[5.4px]">Internet Control Message Protocol</td>
                </tr>
            </tbody>
        </table>
        <br>
        <p class="text-black text-left">ทั้งนี้ ทาง INET หวังเป็นอย่างยิ่งว่าผู้ใช้บริการจะได้รับความสะดวกในการทดสอบ หากต้องการสอบถามเพิ่มเติม สามารถติดต่อทาง INET ได้ตลอด 24 ชั่วโมง ทาง <a href="mailto:noc@inet.co.th" class="text-[#44656f]">noc@inet.co.th</a> และ 02-257-7111</p>
        <br>
        <p class="text-black text-left font-bold">หมายเหตุ : </p>
        <p class="text-black text-left">
-หากทางผู้ใช้บริการต้องการให้ทาง INET ดำเนินการ Backup VM รบกวนแจ้งทาง INET ดำเนินการทาง <a href="mailto:noc@inet.co.th" class="text-[#44656f]">noc@inet.co.th</a><br>
- ปัจจุบันทาง INET มีการปิดสิทธิ์การเข้าใช้งาน Administrator และ Root และทำการสร้างบันชีขึ้นมาใหม่ ที่ระดับสิทธิ์เทียบเท่า เพื่อความปลอดภัยในการใช้งานระบบ Cloud หากทางผู้ใช้บริการต้องการเข้าถึงผ่าน Administrator และ Root รบกวนแจ้งทาง INET ดำเนินการทาง <a href="mailto:noc@inet.co.th" class="text-[#44656f]">noc@inet.co.th</a><br>
- หากทางผู้ใช้บริการต้องการต่ออายุทดสอบ รบกวนแจ้งทางฝ่ายขายก่อนหมดอายุทดสอบ 7 วัน มิเช่นนั้นทาง INET จะดำเนินการปิดทดสอบเมื่อครบกำหนดระยะเวลา<br>
- บริษัทฯ จัดทำเอกสาร INET Cloud Service Terms of Use เพื่อให้ข้อมูลเกี่ยวกับข้อกำหนดหรือเงื่อนไขสำหรับการใช้บริการ ระหว่างผู้ใช้บริการกับบริษัทฯ ทั้งนี้ ไม่ว่าในขณะใดขณะหนึ่งก็ตาม บริษัทฯ สามารถทำการแก้ไขปรับปรุงข้อกำหนดและเงื่อนไขต่าง ๆ ที่ปรากฎในเอกสารนี้ได้ อีกทั้ง บริษัทฯ ขอสงวนสิทธิในการเปลี่ยนแปลงรายละเอียดข้อกำหนดและเงื่อนไขต่าง ๆ ในเอกสารนี้ได้ โดยไม่ต้องทำการแจ้งให้ผู้ใช้บริการทราบแต่อย่างใด ให้ถือเป็นความรับผิดชอบของผู้ใช้บริการที่จะต้องตรวจสอบรายละเอียดข้อกำหนดและเงื่อนไขสำหรับการใช้บริการอย่างสม่ำเสมอ<br>
- ในการติดตั้ง Service ภายใน Operating System ของทางผู้ใช้บริการ ทาง INET แนะนำให้มีการ Setup Start Service Auto เพื่อเพิ่มประสิทธิภาพในการใช้บริการ Virtual Machine 
และสอดคล้องกับระบบ Virtual Machine ที่มีการ Auto Start กรณี Hardware Failure</p>
</div>
</div>
</template>
<style lang="">

</style>