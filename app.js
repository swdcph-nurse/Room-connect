(function() {
  'use strict';

  const DEFAULT_BOOTSTRAP = {
    generatedAt: '',
    lineId: 'parichat4.vip',
    lineContactUrl: 'https://line.me/ti/p/~parichat4.vip',
    submitMode: 'iframe-postmessage',
    options: {
      patientTypes: ['ผู้ป่วยที่กำลังนอนรักษาอยู่', 'ผู้ป่วยจองล่วงหน้า'],
      rights: [
        'บัตรทอง',
        'ประกันสังคม',
        'ประกันสังคม (คลอดบุตร)',
        'เบิกได้',
        'อสม.',
        'บุคคลในครอบครัวอสม.'
      ],
      departments: [
        'กุมารเวชกรรม',
        'อายุรกรรมหญิง',
        'อายุรกรรมชาย',
        'ศัลยกรรมทั่วไป',
        'ศัลยกรรมกระดูก',
        'สูติ-นรีเวชกรรม',
        'จักษุ',
        'โสต ศอ นาสิก',
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
      rights: 'ประกันสังคม (คลอดบุตร)',
      shortLabel: 'ประกันสังคม (คลอดบุตร)',
      detail: 'ชำระค่าห้องพิเศษเต็มจำนวน',
      calculate(price) {
        return { discount: 0, payable: price };
      }
    },
    {
      rights: 'เบิกได้',
      shortLabel: 'เบิกได้',
      detail: 'ส่วนลดค่าห้องพิเศษจากราคาเต็ม 1,000 บาท / คืน',
      calculate(price) {
        const discount = Math.min(1000, price);
        return { discount, payable: Math.max(price - discount, 0) };
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
      'ติดต่อจองที่ตึกพิเศษปาริฉัตร ชั้น 4 (ศูนย์รับจองห้องพิเศษ) เวลา 08.00-20.00 น.',
      'กรณีชำระค่าห้อง 1,000 บาท หรืออุปถัมภ์ห้องพัก สามารถเข้าพักล่วงหน้าก่อนวันนัดได้ ยกเว้นตึกพิเศษสูติกรรมและพิเศษพวงชมพู',
      'กรณีจองล่วงหน้าโดยยังไม่ได้ชำระเงิน การเข้าพักขึ้นอยู่กับห้องว่างในวันที่มาถึงและลำดับคิวของวันนั้น',
      'หากชำระเงินไว้แล้วแต่โรงพยาบาลไม่สามารถจัดห้องให้ได้ จะมีการแจ้งล่วงหน้า 1 วัน และสามารถติดต่อรับเงินคืนได้',
      'หากมีการเลื่อนนัดหรือไม่ได้มานอนตามนัด กรุณาแจ้งศูนย์รับจองห้องพิเศษ โทร 042-721111 ต่อ 4027, 4028',
      'การตรวจสอบราคาห้องตามสิทธิ์ สามารถสอบถามงานประกันสุขภาพ แผนกรักษา หรือศูนย์รับจองห้องพิเศษ'
    ]
  };

  function createEmptyForm() {
    return {
      patientType: '',
      patientName: '',
      phone: '',
      bookingDate: todayIsoString(),
      checkinDate: '',
      rights: '',
      department: '',
      appointmentDetails: '',
      doctorName: '',
      roomPrices: [],
      roomBooked: [],
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
      vipPriceWarning: false,
      bookingGuideTab: 'inpatient',
      lineState: createEmptyLineState(),
      form: createEmptyForm(),
      messageHandler: null,
      submitTimeoutId: null,

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

      get availableRooms() {
        const selectedDepartment = this.form.department;
        const selectedPrices = this.form.roomPrices;

        return this.bootstrap.roomConfigurations.filter(function(room) {
          return room.department === selectedDepartment && selectedPrices.includes(String(room.price));
        });
      },

      get pricingPreview() {
        const selectedPolicy = this.selectedBenefitPolicy;
        const selectedPrices = Array.from(new Set(this.form.roomPrices.map(function(price) {
          return Number(price);
        }).filter(function(price) {
          return Number.isFinite(price);
        }))).sort(function(left, right) {
          return left - right;
        });

        return selectedPrices.map(function(price) {
          const computed = selectedPolicy ? selectedPolicy.calculate(price) : { discount: 0, payable: price };
          return {
            fullPrice: price,
            discount: computed.discount,
            payable: computed.payable
          };
        });
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

        if (!envConfig.liffId) {
          this.lineState.statusMessage = 'ยังไม่ได้กำหนด LIFF ID';
          return;
        }

        if (!window.liff) {
          this.lineState.error = 'ไม่พบ LIFF SDK';
          this.lineState.statusMessage = 'ไม่สามารถเชื่อมต่อ LINE Mini App ได้';
          return;
        }

        this.lineState.loading = true;

        try {
          await window.liff.init({ liffId: envConfig.liffId });
          this.lineState.initialized = true;
          this.lineState.inClient = window.liff.isInClient();
          this.lineState.loggedIn = window.liff.isLoggedIn();
          this.lineState.idToken = window.liff.getIDToken() || '';

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
          this.lineState.error = getErrorMessage(error);
          this.lineState.statusMessage = 'เชื่อมต่อ LINE Mini App ไม่สำเร็จ';
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
          this.handleRoomFiltersChanged();
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
        this.bookingGuideTab = this.form.patientType === 'ผู้ป่วยจองล่วงหน้า' ? 'advance' : 'inpatient';
      },

      handleDepartmentChange() {
        if (this.form.department !== 'สูติ-นรีเวชกรรม' && this.form.roomPrices.includes('1500')) {
          this.form.roomPrices = this.form.roomPrices.filter(function(price) {
            return price !== '1500';
          });
          this.vipPriceWarning = true;
          Swal.fire({
            icon: 'warning',
            title: 'เงื่อนไขราคาห้อง',
            text: 'ราคาห้อง 1500 บาท ใช้ได้เฉพาะแผนกสูติ-นรีเวชกรรม'
          });
        } else {
          this.vipPriceWarning = false;
        }

        this.syncSelectedRooms();
      },

      handleRoomFiltersChanged() {
        this.vipPriceWarning = this.form.roomPrices.includes('1500') && this.form.department !== 'สูติ-นรีเวชกรรม';

        if (this.vipPriceWarning) {
          this.form.roomPrices = this.form.roomPrices.filter(function(price) {
            return price !== '1500';
          });
        }

        this.syncSelectedRooms();
      },

      syncSelectedRooms() {
        const allowedRoomNames = this.availableRooms.map(function(room) {
          return room.roomName;
        });

        this.form.roomBooked = this.form.roomBooked.filter(function(roomName) {
          return allowedRoomNames.includes(roomName);
        });
      },

      openInLine() {
        if (this.lineState.liffUrl) {
          window.location.href = this.lineState.liffUrl;
        }
      },

      validateForm() {
        if (!this.config.apiUrl) {
          return 'ยังไม่ได้ตั้งค่า GAS Web App URL';
        }
        if (this.requiresLineLogin && !this.lineState.idToken) {
          return 'กรุณาเปิดแบบฟอร์มผ่าน LINE Mini App เพื่อยืนยันตัวตนก่อนทำรายการ';
        }
        if (!this.form.patientType) {
          return 'กรุณาเลือกประเภทผู้ป่วย';
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
        if (!this.form.checkinDate) {
          return 'กรุณาระบุวันที่ต้องการเข้าพัก';
        }
        if (this.form.checkinDate < this.form.bookingDate) {
          return 'วันที่ต้องการเข้าพักต้องไม่ก่อนวันที่จองห้อง';
        }
        if (!this.form.rights) {
          return 'กรุณาเลือกสิทธิ์การรักษา';
        }
        if (!this.form.department) {
          return 'กรุณาเลือกหอผู้ป่วยหรือแผนก';
        }
        if (!this.form.roomPrices.length) {
          return 'กรุณาเลือกราคาห้องพิเศษอย่างน้อย 1 รายการ';
        }
        if (this.form.roomPrices.includes('1500') && this.form.department !== 'สูติ-นรีเวชกรรม') {
          return 'ราคาห้อง 1500 บาท ใช้ได้เฉพาะแผนกสูติ-นรีเวชกรรม';
        }
        if (!this.form.roomBooked.length) {
          return 'กรุณาเลือกห้องพิเศษอย่างน้อย 1 ห้อง';
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
            text: validationError
          });
          return;
        }

        this.pendingRequestId = buildRequestId();
        this.submitting = true;

        const payload = Object.assign({}, this.form, {
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
            text: 'กรุณาตรวจสอบการเชื่อมต่อระบบ และทดลองส่งข้อมูลอีกครั้ง'
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
          this.showSuccess(payload.data || {});
          this.resetForm();
          return;
        }

        Swal.fire({
          icon: 'error',
          title: 'บันทึกข้อมูลไม่สำเร็จ',
          text: payload.error && payload.error.message ? payload.error.message : 'เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล'
        });
      },

      showSuccess(data) {
        const pdf = data.pdf || {};
        const pdfLinkHtml = pdf.url
          ? '<div class="mt-3"><a class="btn btn-outline-primary btn-sm" href="' + escapeHtml(pdf.url) + '" target="_blank" rel="noopener noreferrer">เปิดใบจอง PDF</a></div>'
          : '';
        const pdfWarningHtml = pdf.enabled && pdf.error
          ? '<div class="alert alert-warning mt-3 mb-0">บันทึกข้อมูลสำเร็จแล้ว แต่สร้าง PDF ไม่สำเร็จ: ' + escapeHtml(pdf.error) + '</div>'
          : '';
        const lineVerifiedHtml = data.line && data.line.verified
          ? '<p class="mb-2"><strong>ผู้ทำรายการผ่าน LINE:</strong> ' + escapeHtml(data.line.displayName || '-') + '</p>'
          : '';

        Swal.fire({
          icon: 'success',
          title: 'บันทึกการจองสำเร็จ',
          html:
            '<div class="text-start">' +
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
        this.vipPriceWarning = false;
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
      roomConfigurations: Array.isArray(payload.roomConfigurations) ? payload.roomConfigurations.map(normalizeRoom) : []
    };
  }

  function normalizeRoom(room) {
    return {
      id: String(room.id || buildRequestId()),
      department: String(room.department || '').trim(),
      price: String(room.price || '').trim(),
      roomName: String(room.roomName || '').trim(),
      capacity: String(room.capacity || '').trim(),
      note: String(room.note || '').trim()
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
