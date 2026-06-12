(function() {
  'use strict';

  const DEFAULT_BOOTSTRAP = {
    generatedAt: '',
    lineId: 'parichat4.vip',
    lineContactUrl: 'https://line.me/ti/p/~parichat4.vip',
    submitMode: 'iframe-postmessage',
    options: {
      patientTypes: ['ผู้ป่วยที่กำลังรักษาอยู่', 'ผู้ป่วยจองล่วงหน้า'],
      rights: [
        'บัตรทอง',
        'ประกันสังคม',
        'ประกันสังคมคลอดบุตร',
        'สิทธิ์สวัสดิการข้าราชการ (เบิกได้-จ่ายตรง)',
        'อสม.',
        'บุคคลในครอบครัวอสม.'
      ],
      departments: [
        'กุมารเวชกรรม',
        'อายุรกรรมหญิง',
        'อายุรกรรมชาย',
        'ศัลยกรรมกระดูก',
        'ศัลยกรรมทั่วไป',
        'จักษุ (ตา)',
        'โสต ศอ นาสิก (หูคอจมูก)',
        'อื่นๆ'
      ],
      roomPrices: ['1200', '1400', '1500']
    },
    roomConfigurations: []
  };

  const BENEFIT_POLICIES = [
    {
      rights: 'บัตรทอง',
      shortLabel: 'บัตรทอง',
      detail: 'ส่วนลดค่าห้องพิเศษจากราคาเต็ม 400 บาท / คืน',
      calculate(price) {
        const discount = Math.min(400, price);
        return { discount, payable: Math.max(price - discount, 0) };
      }
    },
    {
      rights: 'ประกันสังคม',
      shortLabel: 'ประกันสังคม',
      detail: 'ส่วนลดค่าห้องพิเศษจากราคาเต็ม 400 บาท / คืน',
      calculate(price) {
        const discount = Math.min(400, price);
        return { discount, payable: Math.max(price - discount, 0) };
      }
    },
    {
      rights: 'ประกันสังคมคลอดบุตร',
      shortLabel: 'ประกันสังคมคลอดบุตร',
      detail: 'ชำระค่าห้องพิเศษเต็มจำนวน',
      calculate(price) {
        return { discount: 0, payable: price };
      }
    },
    {
      rights: 'สิทธิ์สวัสดิการข้าราชการ (เบิกได้-จ่ายตรง)',
      shortLabel: 'สิทธิ์สวัสดิการข้าราชการ (เบิกได้-จ่ายตรง)',
      detail: 'ส่วนลดค่าห้องพิเศษ 1,000 บาท/คืน + ส่วนลดเพิ่ม 50% ของส่วนต่างที่เหลือ',
      calculate(price) {
        const baseDiscount = Math.min(1000, price);
        const remaining = price - baseDiscount;
        const extraDiscount = Math.round(remaining * 0.5);
        const totalDiscount = baseDiscount + extraDiscount;
        return { discount: totalDiscount, payable: price - totalDiscount };
      }
    },
    {
      rights: 'อสม.',
      shortLabel: 'อสม.',
      detail: 'ฟรีค่าห้องพิเศษได้ไม่เกิน 1,200 บาท / คืน',
      calculate(price) {
        const discount = Math.min(1200, price);
        return { discount, payable: Math.max(price - discount, 0) };
      }
    },
    {
      rights: 'บุคคลในครอบครัวอสม.',
      shortLabel: 'บุคคลในครอบครัว อสม.',
      detail: 'ส่วนลดค่าห้องพิเศษ 50% ไม่เกิน 600 บาท / คืน',
      calculate(price) {
        const discount = Math.min(Math.round(price * 0.5), 600);
        return { discount, payable: Math.max(price - discount, 0) };
      }
    }
  ];

  const BOOKING_GUIDES = {
    inpatient: [
      'ผู้ป่วยแจ้งความต้องการต่อเจ้าหน้าที่ ER, OPD หรือแผนกที่เข้ารับการรักษา',
      'แพทย์เจ้าของไข้อนุญาตให้เข้าพักห้องพิเศษได้ โดยพิจารณาจากอาการและความพร้อมของผู้ป่วย',
      'การเข้าพักขึ้นอยู่กับลำดับคิวจองของวันที่นั้น หากไม่มีห้องว่างต้องรอคิววันถัดไป',
      'หากต้องการยกเลิกคิวจอง กรุณาติดต่อเจ้าหน้าที่ประจำแผนกที่ผู้ป่วยพักรักษาอยู่',
      'ควรมีญาติเฝ้าอย่างน้อย 1 ท่านที่สามารถช่วยเหลือผู้ป่วย ให้ข้อมูล และเฝ้าได้ตลอดเวลา'
    ],
    advance: [
      'ผู้ป่วยต้องมีวันนัดนอนโรงพยาบาลและใบนัดแพทย์ที่ชัดเจน',
      'รองรับกรณีนัดผ่าตัดคลอด นัดผ่าตัดทั่วไป นัดส่องกล้องทางเดินอาหาร หรือการนอนเพื่อเตรียมทำหัตถการ',
      'การเข้าพักขึ้นอยู่กับห้องว่างในวันที่มาถึงและลำดับคิวของวันนั้น',
      'หากมีการเลื่อนนัดหรือไม่ได้มานอนตามนัด กรุณาแจ้งศูนย์รับจองห้องพิเศษ โทร 042-721111 ต่อ 4027, 4028',
      'การตรวจสอบราคาห้องตามสิทธิ์ สามารถสอบถามงานประกันสุขภาพ แผนกรักษา หรือศูนย์รับจองห้องพิเศษ'
    ]
  };

  const STATIC_ROOMS = [
    { roomName: 'ศัลยกรรมทั่วไป - ห้องพิเศษสามัญ (ราคา 1,200)', price: 1200, dept: 'ศัลยกรรมทั่วไป' },
    { roomName: 'ศัลยกรรมกระดูก - ห้องพิเศษสามัญ (ราคา 1,200)', price: 1200, dept: 'ศัลยกรรมกระดูก' },
    { roomName: 'สูติ-นรีเวช - ห้องพิเศษสามัญ (ราคา 1,200)', price: 1200, dept: 'สูติ-นรีเวช' },
    { roomName: 'สูติ-นรีเวช - ห้องพิเศษ VVIP (ราคา 1,500)', price: 1500, dept: 'สูติ-นรีเวช' },
    { roomName: 'พวงชมพู - หอผู้ป่วยพิเศษ (ราคา 1,400)', price: 1400, dept: 'อื่นๆ' },
    { roomName: 'กุมารเวชกรรม - ห้องพิเศษสามัญ (ราคา 1,200)', price: 1200, dept: 'กุมารเวชกรรม' },
    { roomName: 'อายุรกรรมชาย - ห้องพิเศษสามัญ (ราคา 1,200)', price: 1200, dept: 'อายุรกรรมชาย' },
    { roomName: 'อายุรกรรมหญิง - ห้องพิเศษสามัญ (ราคา 1,200)', price: 1200, dept: 'อายุรกรรมหญิง' },
    { roomName: 'ปาริฉัตร - หอผู้ป่วยพิเศษ (ราคา 1,400)', price: 1400, dept: 'อื่นๆ' },
    { roomName: 'เคมีบำบัด - ห้องพิเศษสามัญ (ราคา 1,000)', price: 1000, dept: 'อื่นๆ' }
  ];

  function createEmptyForm() {
    return {
      patientType: '',
      patientName: '',
      phone: '',
      bookingDate: todayIsoString(),
      checkinDate: '',
      rights: '',
      department: '',
      departmentOther: '',
      appointmentDetails: '',
      doctorName: '',
      roomPrices: [], // Array of checked prices (1200, 1400, 1500)
      roomBooked: [], // Array containing selected room name
      isStaffOrRelative: false,
      notes: '',
      staffName: ''
    };
  }

  function createEmptyLineState() {
    return {
      environment: '',
      channelId: '',
      liffId: '',
      liffUrl: '',
      initialized: false,
      loggedIn: false,
      inClient: false,
      loading: false,
      displayName: '',
      userId: '',
      pictureUrl: '',
      idToken: '',
      statusMessage: '',
      error: '',
      isMiniAppReady: false
    };
  }

  window.bookingApp = function bookingApp() {
    return {
      config: normalizeConfig(window.BOOKING_CONFIG || {}),
      bootstrap: cloneBootstrap(DEFAULT_BOOTSTRAP),
      bootstrapError: '',
      loadingBootstrap: false,
      submitting: false,
      pendingRequestId: '',
      bookingGuideTab: 'inpatient',
      lineState: createEmptyLineState(),
      form: createEmptyForm(),
      messageHandler: null,
      submitTimeoutId: null,

      // UI popups control
      showGuidanceModal: false,
      guidanceAccepted: false,
      selectedRightBenefit: null,

      async init() {
        this.messageHandler = this.handlePostMessage.bind(this);
        window.addEventListener('message', this.messageHandler);

        await this.initializeLineMiniApp();

        if (!this.config.apiUrl) {
          this.bootstrapError = 'ยังไม่ได้ตั้งค่า GAS Web App URL';
          return;
        }

        await this.loadBootstrap();
      },

      get lineContactUrl() {
        return this.bootstrap.lineContactUrl || buildLineUrl(this.bootstrap.lineId);
      },

      get benefitPolicies() {
        return BENEFIT_POLICIES;
      },

      get selectedBenefitPolicy() {
        return BENEFIT_POLICIES.find((policy) => policy.rights === this.form.rights) || null;
      },

      // Filtered rooms based on chosen price filters
      get filteredRooms() {
        return STATIC_ROOMS.filter(room => {
          if (this.form.roomPrices.length === 0) return true;
          return this.form.roomPrices.includes(String(room.price));
        });
      },

      // Calculate benefit breakdown card data
      get pricingPreview() {
        const selectedPolicy = this.selectedBenefitPolicy;
        if (!selectedPolicy || this.form.roomBooked.length === 0) {
          return null;
        }

        const roomObj = STATIC_ROOMS.find(r => r.roomName === this.form.roomBooked[0]);
        if (!roomObj) return null;

        const price = roomObj.price;
        const computed = selectedPolicy.calculate(price);
        return {
          fullPrice: price,
          discount: computed.discount,
          payable: computed.payable
        };
      },

      get currentGuideItems() {
        return BOOKING_GUIDES[this.bookingGuideTab] || BOOKING_GUIDES.inpatient;
      },

      get requiresLineLogin() {
        return !!this.config.line.requireLogin;
      },

      async initializeLineMiniApp() {
        const envConfig = resolveLineEnvironmentConfig(this.config.line);
        this.lineState.environment = envConfig.environment;
        this.lineState.channelId = envConfig.channelId;
        this.lineState.liffId = envConfig.liffId;
        this.lineState.liffUrl = envConfig.liffUrl;

        const isLineBrowser = /Line/i.test(navigator.userAgent);

        if (!envConfig.liffId) {
          this.lineState.statusMessage = 'ยังไม่ได้กำหนด LIFF ID';
          if (isLineBrowser) {
            this.lineState.inClient = true;
          }
          return;
        }

        if (!window.liff) {
          this.lineState.error = 'ไม่พบ LIFF SDK';
          this.lineState.statusMessage = 'ไม่สามารถเชื่อมต่อ LINE Mini App ได้';
          if (isLineBrowser) {
            this.lineState.inClient = true;
          }
          return;
        }

        this.lineState.loading = true;

        try {
          await window.liff.init({ liffId: envConfig.liffId });
          this.lineState.initialized = true;
          this.lineState.inClient = window.liff.isInClient();
          this.lineState.loggedIn = window.liff.isLoggedIn();
          this.lineState.idToken = window.liff.getIDToken() || '';

          // Auto-login if inside LINE environment and not logged in
          if (!this.lineState.loggedIn && (this.lineState.inClient || isLineBrowser)) {
            const redirectUrl = new URL(window.location.href);
            redirectUrl.searchParams.delete('code');
            redirectUrl.searchParams.delete('state');
            redirectUrl.searchParams.delete('liffClientId');
            redirectUrl.searchParams.delete('liffRedirectUri');
            window.liff.login({ redirectUri: redirectUrl.toString() });
            return;
          }

          if (typeof window.liff.getProfile === 'function' && this.lineState.loggedIn) {
            const profile = await window.liff.getProfile();
            this.lineState.displayName = profile && profile.displayName ? profile.displayName : '';
            this.lineState.userId = profile && profile.userId ? profile.userId : '';
            this.lineState.pictureUrl = profile && profile.pictureUrl ? profile.pictureUrl : '';
          }

          this.lineState.isMiniAppReady = this.lineState.loggedIn && !!this.lineState.idToken;
          this.lineState.statusMessage = this.lineState.isMiniAppReady
            ? 'เชื่อมต่อบัญชี LINE เรียบร้อยแล้ว'
            : 'กรุณาเปิดใช้งานผ่าน LINE เพื่อยืนยันตัวตน';
        } catch (error) {
          // If oauth parameters are in the URL but init failed, clean them up and reload
          const url = new URL(window.location.href);
          if (url.searchParams.has('code') || url.searchParams.has('state')) {
            url.searchParams.delete('code');
            url.searchParams.delete('state');
            url.searchParams.delete('liffClientId');
            url.searchParams.delete('liffRedirectUri');
            window.location.replace(url.toString());
            return;
          }

          this.lineState.error = getErrorMessage(error);
          this.lineState.statusMessage = 'เชื่อมต่อ LINE Mini App ไม่สำเร็จ';
          if (isLineBrowser) {
            this.lineState.inClient = true;
          }
        } finally {
          this.lineState.loading = false;
        }
      },

      async loadBootstrap() {
        this.loadingBootstrap = true;
        this.bootstrapError = '';

        try {
          const payload = await loadJsonp(
            buildUrl(this.config.apiUrl, {
              action: 'bootstrap',
              prefix: '__bookingBootstrapCallback__' + Date.now()
            })
          );

          if (!payload || payload.ok === false) {
            throw new Error('ไม่สามารถโหลดข้อมูลตั้งต้นจากระบบหลังบ้านได้');
          }

          this.bootstrap = normalizeBootstrap(payload);
        } catch (error) {
          this.bootstrapError = getErrorMessage(error) || 'เชื่อมต่อระบบหลังบ้านไม่สำเร็จ';
          Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถโหลดข้อมูลห้องจากระบบได้',
            text: this.bootstrapError
          });
        } finally {
          this.loadingBootstrap = false;
        }
      },

      handlePatientTypeChange() {
        if (!this.form.patientType) {
          this.guidanceAccepted = false;
          return;
        }
        this.bookingGuideTab = this.form.patientType === 'ผู้ป่วยจองล่วงหน้า' ? 'advance' : 'inpatient';
        // Reset acceptance
        this.guidanceAccepted = false;
        // Open the Guidance Modal immediately
        this.showGuidanceModal = true;
      },

      acceptGuidance() {
        this.guidanceAccepted = true;
        this.showGuidanceModal = false;
      },

      handleRightsChange() {
        this.selectedRightBenefit = this.selectedBenefitPolicy;
      },

      handleRoomChange(e) {
        const roomName = e.target.value;
        if (!roomName) {
          this.form.roomBooked = [];
          return;
        }
        this.form.roomBooked = [roomName];

        // Sync price checkbox
        const roomObj = STATIC_ROOMS.find(r => r.roomName === roomName);
        if (roomObj) {
          const priceStr = String(roomObj.price);
          // Auto check price checkbox if not already checked (if it's 1200, 1400, 1500)
          if (['1200', '1400', '1500'].includes(priceStr) && !this.form.roomPrices.includes(priceStr)) {
            this.form.roomPrices.push(priceStr);
          }
        }
      },

      openInLine() {
        if (this.lineState.liffUrl) {
          window.location.href = this.lineState.liffUrl;
        }
      },

      loginLine() {
        if (window.liff) {
          if (!window.liff.isLoggedIn()) {
            const redirectUrl = new URL(window.location.href);
            redirectUrl.searchParams.delete('code');
            redirectUrl.searchParams.delete('state');
            redirectUrl.searchParams.delete('liffClientId');
            redirectUrl.searchParams.delete('liffRedirectUri');
            window.liff.login({ redirectUri: redirectUrl.toString() });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถดำเนินการได้',
            text: 'ไม่พบ LINE LIFF SDK'
          });
        }
      },

      logoutLine() {
        if (window.liff) {
          if (window.liff.isLoggedIn()) {
            window.liff.logout();
            this.lineState = createEmptyLineState();
            window.location.replace(window.location.pathname);
          }
        }
      },

      validateForm() {
        if (!this.config.apiUrl) {
          return 'ยังไม่ได้ตั้งค่า GAS Web App URL';
        }
        if (this.requiresLineLogin && !this.lineState.loggedIn) {
          return 'กรุณายืนยันตัวตนผ่าน LINE (เข้าสู่ระบบหรือสแกน QR Code) ก่อนทำรายการ';
        }
        if (!this.form.patientType) {
          return 'กรุณาเลือกประเภทผู้ป่วย';
        }
        if (!this.guidanceAccepted) {
          return 'คุณต้องยอมรับรายละเอียดเงื่อนไขการจองห้องพิเศษก่อนทำรายการ';
        }
        if (!this.form.patientName.trim()) {
          return 'กรุณาระบุชื่อ-สกุลผู้เข้าพัก';
        }
        if (!this.form.phone.trim()) {
          return 'กรุณาระบุหมายเลขโทรศัพท์';
        }
        if (!/^\d{9,10}$/.test(this.form.phone.replace(/\D/g, ''))) {
          return 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก';
        }
        if (!this.form.bookingDate) {
          return 'กรุณาระบุวันที่จองห้อง';
        }
        if (this.form.patientType === 'ผู้ป่วยจองล่วงหน้า' && !this.form.checkinDate) {
          return 'กรุณาระบุวันที่ต้องการเข้าพัก (จำเป็นสำหรับการจองล่วงหน้า)';
        }
        if (this.form.checkinDate && this.form.checkinDate < this.form.bookingDate) {
          return 'วันที่ต้องการเข้าพักต้องไม่ก่อนวันที่จองห้อง';
        }
        if (!this.form.rights) {
          return 'กรุณาเลือกสิทธิ์การรักษา';
        }
        if (!this.form.department) {
          return 'กรุณาเลือกหอผู้ป่วยหรือแผนก';
        }
        if (this.form.department === 'อื่นๆ' && !this.form.departmentOther.trim()) {
          return 'กรุณาระบุแผนกอื่นๆ';
        }
        if (this.form.roomBooked.length === 0) {
          return 'กรุณาเลือกห้องพิเศษที่ต้องการ';
        }
        if (this.form.isStaffOrRelative && !this.form.notes.trim()) {
          return 'กรุณาระบุรายละเอียดเจ้าหน้าที่หรือญาติสายตรง';
        }
        return '';
      },

      submitBooking() {
        const validationError = this.validateForm();
        if (validationError) {
          Swal.fire({
            icon: 'warning',
            title: 'ตรวจสอบข้อมูลไม่ครบ',
            text: validationError,
            confirmButtonText: 'ตกลง'
          });
          return;
        }

        this.pendingRequestId = buildRequestId();
        this.submitting = true;

        // Show premium loading popup
        Swal.fire({
          title: 'กำลังส่งข้อมูลการจอง...',
          html: 'ระบบกำลังดำเนินการบันทึกข้อมูลและออกใบจอง PDF กรุณารอสักครู่',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Build request payload
        const finalDept = this.form.department === 'อื่นๆ' ? `อื่นๆ (${this.form.departmentOther.trim()})` : this.form.department;

        // Get room details
        const selectedRoomName = this.form.roomBooked[0];
        const roomObj = STATIC_ROOMS.find(r => r.roomName === selectedRoomName);
        const priceArray = roomObj ? [String(roomObj.price)] : this.form.roomPrices;

        const payload = Object.assign({}, this.form, {
          department: finalDept,
          roomPrices: priceArray,
          requestId: this.pendingRequestId,
          line: {
            environment: this.lineState.environment,
            channelId: this.lineState.channelId,
            liffId: this.lineState.liffId,
            idToken: this.lineState.idToken,
            displayName: this.lineState.displayName,
            userId: this.lineState.userId,
            pictureUrl: this.lineState.pictureUrl,
            inClient: this.lineState.inClient,
            loggedIn: this.lineState.loggedIn
          }
        });

        this.$refs.transportForm.action = this.config.apiUrl;
        this.$refs.originInput.value = window.location.origin || '';
        this.$refs.payloadInput.value = JSON.stringify(payload);
        this.$refs.transportForm.submit();

        window.clearTimeout(this.submitTimeoutId);
        this.submitTimeoutId = window.setTimeout(() => {
          if (!this.submitting) {
            return;
          }

          this.submitting = false;
          this.pendingRequestId = '';
          Swal.fire({
            icon: 'error',
            title: 'ยังไม่ได้รับผลการบันทึก',
            text: 'กรุณาตรวจสอบการเชื่อมต่อระบบ และทดลองส่งข้อมูลอีกครั้ง',
            confirmButtonText: 'ตกลง'
          });
        }, 30000);
      },

      handlePostMessage(event) {
        const payload = event.data;
        if (!payload || payload.type !== 'booking-submit-result') {
          return;
        }
        if (!this.pendingRequestId || payload.requestId !== this.pendingRequestId) {
          return;
        }

        window.clearTimeout(this.submitTimeoutId);
        this.submitting = false;
        this.pendingRequestId = '';

        if (payload.ok) {
          this.sendLineFlexMessage(payload.data || {});
          this.showSuccess(payload.data || {});
          this.resetForm();
          return;
        }

        Swal.fire({
          icon: 'error',
          title: 'บันทึกข้อมูลไม่สำเร็จ',
          text: payload.error && payload.error.message ? payload.error.message : 'เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล',
          confirmButtonText: 'ตกลง'
        });
      },

      async sendLineFlexMessage(data) {
        if (!window.liff || !window.liff.isInClient()) {
          console.log('Not in LINE client environment. Skipping Flex Message.');
          return;
        }

        const pdf = data.pdf || {};
        if (!pdf.url) {
          console.warn('No PDF URL available. Skipping Flex Message.');
          return;
        }

        const patientName = this.form.patientName || '-';
        const bookingRef = data.bookingReference || '-';
        const checkinDate = this.form.checkinDate || 'ตามคิวว่าง';
        const dept = this.form.department === 'อื่นๆ' ? this.form.departmentOther : this.form.department;
        const roomName = this.form.roomBooked[0] || '-';

        const flexContents = {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#0e3a46",
            contents: [
              {
                type: "text",
                text: "ใบยืนยันการจองห้องพิเศษ",
                weight: "bold",
                color: "#ffffff",
                size: "lg"
              },
              {
                type: "text",
                text: "โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน",
                color: "#a9d5df",
                size: "xs",
                margin: "xs"
              }
            ]
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "สถานะการจอง: สำเร็จ",
                    weight: "bold",
                    size: "md",
                    color: "#2b8a57"
                  },
                  {
                    type: "text",
                    text: "เลขอ้างอิง: " + bookingRef,
                    size: "xs",
                    color: "#888888",
                    margin: "xs"
                  }
                ]
              },
              {
                type: "separator"
              },
              {
                type: "box",
                layout: "vertical",
                spacing: "xs",
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "ชื่อผู้ป่วย",
                        color: "#aaaaaa",
                        size: "sm",
                        flex: 3
                      },
                      {
                        type: "text",
                        text: patientName,
                        color: "#333333",
                        size: "sm",
                        flex: 7,
                        weight: "bold"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "หอผู้ป่วย",
                        color: "#aaaaaa",
                        size: "sm",
                        flex: 3
                      },
                      {
                        type: "text",
                        text: dept,
                        color: "#333333",
                        size: "sm",
                        flex: 7
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "ห้องจอง",
                        color: "#aaaaaa",
                        size: "sm",
                        flex: 3
                      },
                      {
                        type: "text",
                        text: roomName,
                        color: "#333333",
                        size: "sm",
                        flex: 7,
                        wrap: true
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "วันที่เข้าพัก",
                        color: "#aaaaaa",
                        size: "sm",
                        flex: 3
                      },
                      {
                        type: "text",
                        text: checkinDate,
                        color: "#333333",
                        size: "sm",
                        flex: 7
                      }
                    ]
                  }
                ]
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "primary",
                color: "#0e3a46",
                action: {
                  type: "uri",
                  label: "เปิดไฟล์ใบจอง (PDF)",
                  uri: pdf.url
                }
              }
            ]
          }
        };

        try {
          console.log('Sending LINE Flex Message...');
          await window.liff.sendMessages([
            {
              type: 'flex',
              altText: 'ใบยืนยันการจองห้องพิเศษ - ' + bookingRef,
              contents: flexContents
            }
          ]);
          console.log('LINE Flex Message sent successfully.');
        } catch (err) {
          console.error('Failed to send LINE Flex Message:', err);
        }
      },

      showSuccess(data) {
        const pdf = data.pdf || {};
        const pdfLinkHtml = pdf.url
          ? '<div class="mt-3"><a class="btn btn-primary-action btn-sm w-100" href="' + escapeHtml(pdf.url) + '" target="_blank" rel="noopener noreferrer"><i class="fas fa-file-pdf"></i> ดาวน์โหลดใบจอง PDF</a></div>'
          : '';
        const pdfWarningHtml = pdf.enabled && pdf.error
          ? '<div class="alert alert-warning mt-3 mb-0">บันทึกสำเร็จ แต่สร้าง PDF ไม่สำเร็จ: ' + escapeHtml(pdf.error) + '</div>'
          : '';
        const lineVerifiedHtml = data.line && data.line.verified
          ? '<p class="mb-2"><strong>ผู้ทำรายการผ่าน LINE:</strong> ' + escapeHtml(data.line.displayName || '-') + '</p>'
          : '';

        Swal.fire({
          icon: 'success',
          title: 'บันทึกการจองสำเร็จ',
          html:
            '<div class="text-start fs-6">' +
            '<p class="mb-2"><strong>เลขอ้างอิง:</strong> ' + escapeHtml(data.bookingReference || '-') + '</p>' +
            '<p class="mb-2"><strong>เวลาบันทึก:</strong> ' + escapeHtml(data.savedAt || '-') + '</p>' +
            lineVerifiedHtml +
            pdfLinkHtml +
            pdfWarningHtml +
            '</div>',
          confirmButtonText: 'รับทราบ'
        });
      },

      resetForm() {
        this.form = createEmptyForm();
        this.guidanceAccepted = false;
        this.selectedRightBenefit = null;
        this.bookingGuideTab = 'inpatient';
      },

      formatBaht(value) {
        return Number(value || 0).toLocaleString('th-TH');
      }
    };
  };

  function normalizeConfig(rawConfig) {
    const rawLine = rawConfig.line || {};
    return {
      apiUrl: String(rawConfig.apiUrl || '').trim(),
      siteName: String(rawConfig.siteName || '').trim(),
      line: {
        defaultEnvironment: String(rawLine.defaultEnvironment || 'published').trim() || 'published',
        requireLogin: rawLine.requireLogin !== false,
        environments: normalizeLineEnvironments(rawLine.environments || {})
      }
    };
  }

  function normalizeLineEnvironments(environments) {
    return {
      developing: normalizeLineEnvironment('developing', environments.developing),
      review: normalizeLineEnvironment('review', environments.review),
      published: normalizeLineEnvironment('published', environments.published)
    };
  }

  function normalizeLineEnvironment(name, envConfig) {
    const config = envConfig || {};
    return {
      name: name,
      channelId: String(config.channelId || '').trim(),
      liffId: String(config.liffId || '').trim(),
      liffUrl: String(config.liffUrl || '').trim()
    };
  }

  function resolveLineEnvironmentConfig(lineConfig) {
    const params = new URLSearchParams(window.location.search);
    const requestedEnvironment = String(params.get('lineEnv') || lineConfig.defaultEnvironment || 'published').trim().toLowerCase();
    const environmentName = ['developing', 'review', 'published'].includes(requestedEnvironment)
      ? requestedEnvironment
      : 'published';
    const envConfig = lineConfig.environments[environmentName] || {};

    return {
      environment: environmentName,
      channelId: envConfig.channelId || '',
      liffId: envConfig.liffId || '',
      liffUrl: envConfig.liffUrl || ''
    };
  }

  function normalizeBootstrap(payload) {
    return {
      generatedAt: payload.generatedAt || '',
      lineId: payload.lineId || DEFAULT_BOOTSTRAP.lineId,
      lineContactUrl: payload.lineContactUrl || buildLineUrl(payload.lineId || DEFAULT_BOOTSTRAP.lineId),
      submitMode: payload.submitMode || DEFAULT_BOOTSTRAP.submitMode,
      options: payload.options || cloneBootstrap(DEFAULT_BOOTSTRAP).options,
      roomConfigurations: Array.isArray(payload.roomConfigurations) ? payload.roomConfigurations : []
    };
  }

  function cloneBootstrap(source) {
    return JSON.parse(JSON.stringify(source));
  }

  function loadJsonp(url) {
    return new Promise(function(resolve, reject) {
      const callbackMatch = url.match(/[?&]prefix=([^&]+)/);
      if (!callbackMatch) {
        reject(new Error('ไม่พบชื่อ callback สำหรับ JSONP'));
        return;
      }

      const callbackName = decodeURIComponent(callbackMatch[1]);
      const script = document.createElement('script');
      const cleanup = function() {
        delete window[callbackName];
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      window[callbackName] = function(payload) {
        cleanup();
        resolve(payload);
      };

      script.onerror = function() {
        cleanup();
        reject(new Error('โหลดข้อมูลห้องจาก GAS ไม่สำเร็จ'));
      };

      script.src = url;
      document.head.appendChild(script);
    });
  }

  function buildUrl(baseUrl, params) {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(function(key) {
      url.searchParams.set(key, params[key]);
    });
    return url.toString();
  }

  function todayIsoString() {
    const now = new Date();
    const localTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localTime.toISOString().slice(0, 10);
  }

  function buildRequestId() {
    return 'REQ-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function buildLineUrl(lineId) {
    return lineId ? 'https://line.me/ti/p/~' + encodeURIComponent(lineId) : '';
  }

  function getErrorMessage(error) {
    return error && error.message ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
