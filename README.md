# ระบบจองห้องพิเศษออนไลน์

ระบบนี้ออกแบบให้ใช้งานได้ 2 ทางพร้อมกัน

- `LINE Mini App` สำหรับผู้รับบริการและเจ้าหน้าที่ที่เปิดผ่าน `LINE Official Account`
- `Google Apps Script Web App` สำหรับระบบหลังบ้านที่บันทึกข้อมูลลง Google Sheet และสร้าง PDF

## โครงสร้างไฟล์

```text
.
├── AGENTS.md
├── Code.gs
├── appsscript.json
├── hospital-logo.jpg
├── index.html
└── assets
    ├── app.js
    ├── config.js
    └── styles.css
```

## สถาปัตยกรรม

### Frontend

- หน้าเว็บ static ใช้ `Bootstrap 5`, `Alpine.js`, `SweetAlert2`, และ `LIFF SDK`
- รองรับการเปิดจาก `LINE Mini App` และหน้าเว็บทั่วไป
- เมื่อเปิดผ่าน LINE ระบบจะเรียก `liff.init()` และส่ง `ID token` ไปให้ GAS ตรวจสอบ
- โหลดข้อมูลตั้งต้นจาก GAS ผ่าน `JSONP`
- ส่งคำขอจองผ่าน `POST` เข้า hidden iframe และรับผลกลับด้วย `postMessage`

### Backend

- `doGet(e)` ใช้สำหรับ `bootstrap`, `health`
- `doPost(e)` ใช้สำหรับ `submitBooking`
- บันทึกข้อมูลลง Google Sheet ด้วย `LockService`
- อ่าน room configuration ด้วย `CacheService`
- สร้าง PDF จาก Google Docs template ได้
- ตรวจสอบ `LINE ID token` กับ LINE Platform ก่อนผูกข้อมูลผู้ใช้งานเข้ากับรายการจอง

## LINE Mini App ที่ใช้

ข้อมูลที่ตั้งไว้ใน [assets/config.js](/D:/NUT/จองห้องพิเศษสำหรับทั่วไป/assets/config.js)

```text
Developing
- Channel ID: 2010054954
- LIFF ID: 2010054954-37JuM83q
- LIFF URL: https://miniapp.line.me/2010054954-37JuM83q

Review
- Channel ID: 2010054955
- LIFF ID: 2010054955-qYnDrmpP
- LIFF URL: https://miniapp.line.me/2010054955-qYnDrmpP

Published
- Channel ID: 2010054956
- LIFF ID: 2010054956-1yXGQe9P
- LIFF URL: https://miniapp.line.me/2010054956-1yXGQe9P
```

หมายเหตุ:

- `Channel ID` ใช้ฝั่ง GAS สำหรับ verify token
- `LIFF ID` คือค่าที่ใช้ใน `liff.init()`
- `LIFF URL` คือ URL ที่ใช้เปิด Mini App จาก LINE OA

## การตั้งค่า Endpoint URL สำหรับแต่ละ environment

ถ้าต้องการใช้หน้าเว็บชุดเดียวกันกับทั้ง `Developing`, `Review`, `Published` ให้ตั้ง Endpoint URL ของแต่ละ internal channel แยกด้วย query string ดังนี้

```text
Developing
https://<your-github-pages-url>/index.html?lineEnv=developing

Review
https://<your-github-pages-url>/index.html?lineEnv=review

Published
https://<your-github-pages-url>/index.html?lineEnv=published
```

ตอนนี้ในโค้ดตั้ง `published` เป็นค่าเริ่มต้นไว้แล้ว ถ้าไม่มี `lineEnv` ระบบจะใช้ `Published` อัตโนมัติ

## การตั้งค่า Backend (GAS)

1. สร้างโปรเจกต์ Google Apps Script แบบ Standalone
2. คัดลอก [Code.gs](/D:/NUT/จองห้องพิเศษสำหรับทั่วไป/Code.gs) และ [appsscript.json](/D:/NUT/จองห้องพิเศษสำหรับทั่วไป/appsscript.json) ไปวาง
3. ตั้ง Script Properties ตามนี้

```text
SPREADSHEET_ID=1P5bFZMpQ1Ws_-Vu1JnyyF-Obh4qYoHnHLqRrGH72WCM
SHEET_NAME=จองห้องพิเศษ
ROOM_CONFIG_RANGE_NAME=ROOM_CONFIG
ROOM_CONFIG_SHEET_NAME=RoomConfig
TEMPLATE_DOC_ID=YOUR_TEMPLATE_DOC_ID
OUTPUT_FOLDER_ID=YOUR_OUTPUT_FOLDER_ID
LINE_ID=parichat4.vip
LINE_CHANNEL_IDS=2010054954,2010054955,2010054956
FRONTEND_ORIGIN=https://<your-github-pages-domain>
BOOKING_START_ROW=2
```

4. หากต้องการตั้งค่าเริ่มต้นอัตโนมัติ สามารถรัน `seedDefaultProperties()` ได้ 1 ครั้ง
5. Deploy เป็น `Web app`
   - Execute as: `Me`
   - Who has access: `Anyone`

## การตั้งค่า Frontend

1. แก้ค่าใน [assets/config.js](/D:/NUT/จองห้องพิเศษสำหรับทั่วไป/assets/config.js) ตาม environment จริง
2. นำไฟล์ขึ้น GitHub repository
3. เปิด GitHub Pages
4. ตั้ง Endpoint URL ของ LINE Mini App ให้ชี้มายัง URL ของ GitHub Pages ตาม environment

## Room Configuration

รองรับ 2 รูปแบบ

1. Named Range: `ROOM_CONFIG`
2. Sheet: `RoomConfig`

คอลัมน์ที่รองรับ:

```text
department | price | roomName | capacity | note | active
```

หรือใช้หัวตารางภาษาไทยก็ได้ เช่น

```text
หอผู้ป่วย/แผนก | ราคาห้อง | ห้องพิเศษ | จำนวนเตียง | หมายเหตุ | สถานะ
```

## Mapping ลง Google Sheet

ระบบเขียนข้อมูลเริ่มที่คอลัมน์ `C:Q`

```text
C  patientType
D  patientName
E  phone
F  bookingDate
G  checkinDate
H  rights
I  ว่าง
J  department
K  appointmentDetails
L  doctorName
M  roomPrices
N  roomBooked
O  isStaffOrRelative
P  notes + LINE info + booking reference + timestamp
Q  staffName
```

## หมายเหตุสำคัญ

- หน้าเว็บนี้ยังเปิดใช้งานแบบ web ปกติได้ แต่ถ้าตั้ง `requireLogin: true` ระบบจะบังคับให้ทำรายการผ่าน LINE Mini App
- ถ้าต้องการ verify ผู้ใช้ LINE ให้ deploy GAS เวอร์ชันล่าสุด เพราะมีการเรียก LINE verify endpoint แล้ว
- ใน [appsscript.json](/D:/NUT/จองห้องพิเศษสำหรับทั่วไป/appsscript.json) มี scope `script.external_request` แล้วสำหรับ verify token
- ถ้าต้องการสร้าง PDF ต้องกำหนด `TEMPLATE_DOC_ID` และ `OUTPUT_FOLDER_ID`
