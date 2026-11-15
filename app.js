/**
 * Namma Fix - Core Application Script
 * 
 * Manages UI interactions, smooth scrolling, active nav highlights, 
 * interactive multi-step pricing estimations, calendar date pickers, 
 * testimonials, and telemetry owner alerts logging.
 */

// ==========================================
// 1. GLOBAL CONFIGURATION BLOCK
// ==========================================
const CONFIG = {
  companyName: 'Namma Fix',
  phone: '9108868324',
  email: 'support@nammafix.in',
  ownerEmail: 'owner@nammafix.in',
  whatsAppNum: '9108868324',
  
  // Base Service Prices & Multipliers (INR)
  pricing: {
    // New Custom PC Options
    pcBrand: {
      custom: 22000, // Custom PC Base
      dell: 25000,
      hp: 26000,
      lenovo: 27000
    },
    pcCpu: {
      i3: 0,
      i5: 6000,
      i7: 14000,
      i9: 28000
    },
    pcRam: {
      8: 0,
      16: 2500,
      32: 6000
    },
    pcStorage: {
      'ssd-512': 0,
      'ssd-1000': 3000,
      'hdd-1000': -1000,
      'dual': 4000
    },
    
    // Repair Service Flat Estimates
    repairType: {
      slow: 1500,
      'no-boot': 2500,
      'blue-screen': 1200,
      network: 800,
      other: 1000
    },
    
    // CCTV System Base Configuration
    cctvBaseInstall: 2000, // General cable pulling & router config
    cctvCameraUnit: {
      dome: 1200,
      bullet: 1500,
      mix: 1350,
      ip: 2800
    },
    cctvSystemBase: {
      'dvr-4': 3500,
      'dvr-8': 5500,
      'nvr': 8500
    },
    cctvStorage: {
      1: 3500,
      2: 5500,
      4: 9000
    },
    
    // CCTV Maintenance Configurations
    cctvMaintenance: {
      once: 1500,
      amcBasePerCamera: 800, // AMC per camera multiplier
      amcMinimum: 3200
    }
  },
  
  // Endpoint configuration for activity tracking
  endpoints: {
    notifyOwner: '/notify-owner'
  }
};

// ==========================================
// 2. TELEMETRY & ACTIVITY TRACKING
// ==========================================
/**
 * Captures user interactions and logs them by executing a mock API post.
 * Outlines to beginners how to wire this to real notification integrations.
 * 
 * @param {string} eventType - The action captured (e.g. "quote_submitted", "whatsapp_click")
 * @param {object} payload - Metadata concerning the action
 */
async function trackEvent(eventType, payload) {
  const timestamp = new Date().toISOString();
  const alertData = {
    event: eventType,
    time: timestamp,
    data: payload
  };
  
  // Log to client developer console overlay for testing validation
  // Removed devConsole UI overlay
  
  console.log(`[Telemetry Logged]: ${eventType}`, alertData);
  
  try {
    // Attempt standard fetch callback
    const response = await fetch(CONFIG.endpoints.notifyOwner, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alertData)
    });
    
    if (response.ok) {
      console.log('Event successfully pushed to backend notification endpoint.');
    }
  } catch (err) {
    // Graceful error capture (since local development won't run this route natively)
    console.warn('Endpoint /notify-owner unavailable locally. Telemetry successfully simulated instead.');
    
    /* 
     * HOW TO WIRE THIS TO EXTERNAL SERVICES:
     * 
     * 1. EMAIL NOTIFICATION:
     *    In your Node.js/Express backend handler for /notify-owner, use Nodemailer:
     *    
     *    const nodemailer = require('nodemailer');
     *    app.post('/notify-owner', (req, res) => {
     *      const { event, time, data } = req.body;
     *      let transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'owner@nammafix.in', pass: 'yourpassword' } });
     *      let mailOptions = {
     *         from: 'support@nammafix.in',
     *         to: CONFIG.ownerEmail,
     *         subject: `ALERT: New Event Tracked - ${event}`,
     *         text: `Event occurred at ${time}. Details: ${JSON.stringify(data, null, 2)}`
     *      };
     *      transporter.sendMail(mailOptions);
     *      res.sendStatus(200);
     *    });
     * 
     * 2. WHATSAPP API:
     *    You can connect to WhatsApp Business API via Twilio or official meta endpoints:
     *    
     *    const axios = require('axios');
     *    // Inside express post handler:
     *    axios.post('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
     *       messaging_product: "whatsapp",
     *       to: `91${CONFIG.whatsAppNum}`,
     *       type: "text",
     *       text: { body: `Alert: ${event} submitted. Check email for specifications.` }
     *    }, { headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' } });
     * 
     * 3. ZAPIER WEBHOOKS:
     *    Replace the fetch endpoint with your Zapier Catch Webhook URL.
     *    Zapier will receive this JSON data and can automatically send SMS, email, or log in Google Sheets.
     */
  }
}

// ==========================================
// 3. UI ELEMENT BEHAVIORS
// ==========================================

// Scroll progress bar
window.addEventListener('scroll', () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById('scrollProgress').style.width = scrolled + '%';
  
  // Shrink header and add shadow
  const header = document.getElementById('header');
  if (winScroll > 50) {
    header.classList.add('shrink');
  } else {
    header.classList.remove('shrink');
  }
});

// Mobile burger menu
const burgerBtn = document.getElementById('burgerBtn');
const navMenu = document.getElementById('navMenu');

burgerBtn.addEventListener('click', () => {
  burgerBtn.classList.toggle('open');
  navMenu.classList.toggle('open');
});

// Close mobile menu on click nav link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    burgerBtn.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

// Navigation scroll active highlight
window.addEventListener('scroll', () => {
  let scrollPos = window.scrollY || document.documentElement.scrollTop;
  scrollPos += 120; // Offset for header height
  
  navLinks.forEach(link => {
    const sectionId = link.getAttribute('data-sec');
    if (!sectionId) return;
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const top = section.offsetTop;
    const height = section.offsetHeight;
    
    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
});

// Scroll Reveal Trigger Animation
const scrollElements = document.querySelectorAll('.scroll-trigger-element');

const elementInView = (el, dividend = 1) => {
  const elementTop = el.getBoundingClientRect().top;
  return (
    elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
  );
};

const displayScrollElement = (element) => {
  element.classList.add('animate');
};

const handleScrollAnimation = () => {
  scrollElements.forEach((el) => {
    if (elementInView(el, 1.15)) {
      displayScrollElement(el);
    }
  });
};

window.addEventListener('scroll', () => {
  handleScrollAnimation();
});
// Trigger once on load
handleScrollAnimation();

// FAQs accordion toggle
const faqHeaders = document.querySelectorAll('.faq-header');
faqHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const parent = header.parentElement;
    const isActive = parent.classList.contains('active');
    
    // Close other FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
    });
    
    if (!isActive) {
      parent.classList.add('active');
      trackEvent('faq_click', { question: header.querySelector('.faq-question').textContent });
    }
  });
});

// Testimonials Carousel
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialDots = document.querySelectorAll('.testimonial-dot');
const prevBtn = document.getElementById('testimonialPrev');
const nextBtn = document.getElementById('testimonialNext');
let currentTestimonialIndex = 0;

function switchTestimonial(index) {
  testimonialCards.forEach(card => card.classList.remove('active'));
  testimonialDots.forEach(dot => dot.classList.remove('active'));
  
  testimonialCards[index].classList.add('active');
  testimonialDots[index].classList.add('active');
  currentTestimonialIndex = index;
}

prevBtn.addEventListener('click', () => {
  let index = currentTestimonialIndex - 1;
  if (index < 0) index = testimonialCards.length - 1;
  switchTestimonial(index);
  trackEvent('testimonial_nav', { direction: 'previous', index: index });
});

nextBtn.addEventListener('click', () => {
  let index = currentTestimonialIndex + 1;
  if (index >= testimonialCards.length) index = 0;
  switchTestimonial(index);
  trackEvent('testimonial_nav', { direction: 'next', index: index });
});

testimonialDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const index = parseInt(dot.getAttribute('data-index'));
    switchTestimonial(index);
    trackEvent('testimonial_dot_click', { index: index });
  });
});

// Floating WhatsApp widget show/hide toggle
const whatsappTriggerBtn = document.getElementById('whatsappTriggerBtn');
const whatsappChatPanel = document.getElementById('whatsappChatPanel');
const whatsappChatClose = document.getElementById('whatsappChatClose');

whatsappTriggerBtn.addEventListener('click', () => {
  whatsappChatPanel.classList.toggle('active');
  if (whatsappChatPanel.classList.contains('active')) {
    trackEvent('whatsapp_widget_opened', { status: 'open' });
  }
});

whatsappChatClose.addEventListener('click', (e) => {
  e.stopPropagation();
  whatsappChatPanel.classList.remove('active');
});

// Call / WhatsApp tracking events
document.getElementById('headerPhoneLink').addEventListener('click', () => {
  trackEvent('call_initiated', { location: 'header' });
});
document.getElementById('contactPhoneBtn').addEventListener('click', () => {
  trackEvent('call_initiated', { location: 'contact_section' });
});
document.getElementById('mobileActionCall').addEventListener('click', () => {
  trackEvent('call_initiated', { location: 'mobile_action_bar' });
});

document.getElementById('mobileActionWhatsApp').addEventListener('click', () => {
  trackEvent('whatsapp_click', { location: 'mobile_action_bar' });
});
document.getElementById('widgetWhatsAppSubmitBtn').addEventListener('click', () => {
  trackEvent('whatsapp_click', { location: 'whatsapp_widget_box' });
});
document.getElementById('heroWhatsAppBtn').addEventListener('click', () => {
  trackEvent('whatsapp_click', { location: 'hero_section' });
});


// ==========================================
// ==========================================
// 4. SERVICE REQUEST FORM & GPS
// ==========================================

const quoteForm = document.getElementById('quoteForm');
const quoteConfirmPanel = document.getElementById('quoteConfirmPanel');
const quoteSummaryBox = document.getElementById('quoteSummaryBox');

// Monitor category selection changes
const serviceCards = document.querySelectorAll('.service-select-card');
serviceCards.forEach(card => {
  const radio = card.querySelector('input[type="radio"]');
  card.addEventListener('click', () => {
    serviceCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    radio.checked = true;
    trackEvent('quote_service_selected', { service: radio.value });
  });
});

// Request GPS Location
function requestGPSLocation(context) {
  const btn = document.getElementById(`${context}GetLocationBtn`);
  const statusEl = document.getElementById(`${context}GpsStatus`);
  const dataInput = document.getElementById(`${context}LocationData`);
  
  if (!navigator.geolocation) {
    statusEl.innerHTML = "Geolocation is not supported by your browser.";
    statusEl.className = "gps-status error";
    return;
  }
  
  // UI Loading state
  btn.classList.add('loading');
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
    Locating...
  `;
  statusEl.innerHTML = "Requesting permission...";
  statusEl.className = "gps-status";
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
      
      dataInput.value = mapsLink;
      
      btn.classList.remove('loading');
      btn.classList.add('success');
      btn.innerHTML = `✓ Location Captured`;
      
      statusEl.innerHTML = "GPS coordinate securely attached.";
      statusEl.className = "gps-status success";
      
      trackEvent('gps_location_shared', { context: context, success: true });
    },
    (error) => {
      btn.classList.remove('loading');
      btn.innerHTML = `📍 Send My Current Location`;
      
      let errMsg = "Unable to retrieve your location.";
      if (error.code === error.PERMISSION_DENIED) {
        errMsg = "Location permission denied.";
      }
      
      statusEl.innerHTML = errMsg;
      statusEl.className = "gps-status error";
      
      trackEvent('gps_location_shared', { context: context, success: false, error: error.code });
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// Form Submission
quoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const serviceType = document.querySelector('input[name="serviceType"]:checked').value;
  const userName = document.getElementById('user-name').value;
  const userPhone = document.getElementById('user-phone').value;
  const userArea = document.getElementById('user-area').value;
  const userMsg = document.getElementById('user-msg').value;
  const locationData = document.getElementById('quoteLocationData').value || "Not provided";
  
  const details = `Service: ${serviceType} | Area: ${userArea} | Message: ${userMsg} | Location: ${locationData}`;
  
  // Save to Python SQLite Database
  try {
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'Service Request',
        customer_name: userName,
        phone: userPhone,
        details: details
      })
    });
  } catch (err) {
    console.warn('Backend unavailable, skipping DB save.');
  }
  
  // Build WhatsApp message and redirect
  const waMsg = `Hi Namma Fix, I need help.\n\n*Service:* ${serviceType}\n*Name:* ${userName}\n*Phone:* ${userPhone}\n*Area:* ${userArea}\n*Issue:* ${userMsg}\n*Location:* ${locationData}`;
  const waUrl = `https://wa.me/919108868324?text=${encodeURIComponent(waMsg)}`;
  window.open(waUrl, '_blank');
  
  // Hide form scaffolding
  quoteForm.style.display = 'none';
  
  // Show Confirmation Box
  quoteConfirmPanel.classList.add('active');
});

document.getElementById('quoteResetBtn').addEventListener('click', () => {
  // Reset fields
  quoteForm.reset();
  
  // Reset GPS button state
  const btn = document.getElementById('quoteGetLocationBtn');
  const statusEl = document.getElementById('quoteGpsStatus');
  const dataInput = document.getElementById('quoteLocationData');
  if(btn) {
    btn.classList.remove('loading', 'success');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
      📍 Send My Current Location
    `;
  }
  if(statusEl) {
    statusEl.innerHTML = "";
    statusEl.className = "gps-status";
  }
  if(dataInput) {
    dataInput.value = "";
  }
  
  // Show form elements
  quoteForm.style.display = 'block';
  quoteConfirmPanel.classList.remove('active');
  
  trackEvent('quote_reset_initiated', { status: 'reset' });
});


// ==========================================
// 5. CALENDAR & TIME SLOT PICKER LOGIC
// ==========================================
let selectedDateStr = "";
let selectedTimeStr = "";

function generateCalendar() {
  const calendarDaysContainer = document.getElementById('calendarDays');
  const calendarMonthLabel = document.getElementById('calendarMonthYear');
  
  // Empty old day elements (keep headers)
  const headerCount = 7;
  while(calendarDaysContainer.children.length > headerCount) {
    calendarDaysContainer.removeChild(calendarDaysContainer.lastChild);
  }
  
  // Use real current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // getDay() returns 0=Sun, 1=Mon,...,6=Sat
  const startDayOffset = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = `${monthNames[currentMonth]} ${currentYear}`;
  
  calendarMonthLabel.textContent = monthName;
  
  // Fill offset empty cells
  for (let i = 0; i < startDayOffset; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day-cell disabled';
    emptyCell.textContent = '';
    calendarDaysContainer.appendChild(emptyCell);
  }
  
  // Inject Days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    cell.textContent = dayNum;
    
    // Disable past days (strictly before today) and Sundays
    const dayOfWeekIndex = (startDayOffset + dayNum - 1) % 7;
    const isPast = dayNum < currentDay;
    const isSunday = dayOfWeekIndex === 0;
    
    // Mark today with a special class
    if (dayNum === currentDay && !isSunday) {
      cell.classList.add('today');
    }
    
    if (isPast || isSunday) {
      cell.classList.add('disabled');
    } else {
      cell.addEventListener('click', () => {
        // Toggle selected state
        document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('active'));
        cell.classList.add('active');
        
        const mm = String(currentMonth + 1).padStart(2, '0');
        const dd = String(dayNum).padStart(2, '0');
        selectedDateStr = `${currentYear}-${mm}-${dd}`;
        document.getElementById('selectedDateInput').value = selectedDateStr;
        
        trackEvent('booking_date_selected', { date: selectedDateStr });
      });
    }
    
    calendarDaysContainer.appendChild(cell);
  }
}


// Time slot buttons binding
const timeSlotBtns = document.querySelectorAll('.time-slot-btn');
timeSlotBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    timeSlotBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    selectedTimeStr = btn.getAttribute('data-slot');
    document.getElementById('selectedTimeInput').value = selectedTimeStr;
    
    trackEvent('booking_time_selected', { time: selectedTimeStr });
  });
});

// Booking Submission
const bookingForm = document.getElementById('bookingForm');
const bookingConfirmPanel = document.getElementById('bookingConfirmPanel');

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const selectedDate = document.getElementById('selectedDateInput').value;
  const selectedTime = document.getElementById('selectedTimeInput').value;
  
  if (!selectedDate) {
    alert("Please select a booking date on the calendar.");
    return;
  }
  if (!selectedTime) {
    alert("Please select a preferred booking time slot.");
    return;
  }
  
  const serviceType = document.getElementById('book-service-type').value;
  const bookName = document.getElementById('book-name').value;
  const bookPhone = document.getElementById('book-phone').value;
  
  const details = `Service: ${serviceType} | Date: ${selectedDate} | Time: ${selectedTime}`;
  
  // Save to Python SQLite Database
  try {
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'Appointment Booking',
        customer_name: bookName,
        phone: bookPhone,
        details: details
      })
    });
  } catch (err) {
    console.warn('Backend unavailable, skipping DB save.');
  }
  
  // Build WhatsApp message and redirect
  const waMsg = `Hi Namma Fix, I'd like to book an appointment.\n\n*Service:* ${serviceType}\n*Name:* ${bookName}\n*Phone:* ${bookPhone}\n*Date:* ${selectedDate}\n*Time:* ${selectedTime}`;
  const waUrl = `https://wa.me/919108868324?text=${encodeURIComponent(waMsg)}`;
  window.open(waUrl, '_blank');
  
  // Hide form content
  bookingForm.style.display = 'none';
  bookingConfirmPanel.classList.add('active');
});

document.getElementById('bookingResetBtn').addEventListener('click', () => {
  bookingForm.reset();
  selectedDateStr = "";
  selectedTimeStr = "";
  
  // Reset Calendar Selection
  document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('active'));
  document.getElementById('selectedDateInput').value = "";
  
  // Reset Time slot selection
  timeSlotBtns.forEach(b => b.classList.remove('active'));
  document.getElementById('selectedTimeInput').value = "";
  
  bookingForm.style.display = 'block';
  bookingConfirmPanel.classList.remove('active');
  
  trackEvent('booking_reset_initiated', { status: 'reset' });
});


// ==========================================
// 6. GENERAL CONTACT FORM SUBMISSION
// ==========================================
const contactForm = document.getElementById('contactForm');
const contactConfirmPanel = document.getElementById('contactConfirmPanel');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const contactName = document.getElementById('contact-name').value;
  const contactEmail = document.getElementById('contact-email').value;
  const contactPhone = document.getElementById('contact-phone').value;
  const contactMsg = document.getElementById('contact-msg').value;
  
  const details = `Email: ${contactEmail} | Message: ${contactMsg}`;
  
  // Save to Python SQLite Database
  try {
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'Contact Inquiry',
        customer_name: contactName,
        phone: contactPhone,
        details: details
      })
    });
  } catch (err) {
    console.warn('Backend unavailable, skipping DB save.');
  }
  
  // Build WhatsApp message and redirect
  const waMsg = `Hi Namma Fix, I have a question.\n\n*Name:* ${contactName}\n*Email:* ${contactEmail}\n*Phone:* ${contactPhone}\n*Message:* ${contactMsg}`;
  const waUrl = `https://wa.me/919108868324?text=${encodeURIComponent(waMsg)}`;
  window.open(waUrl, '_blank');
  
  contactForm.style.display = 'none';
  contactConfirmPanel.classList.add('active');
});

document.getElementById('contactResetBtn').addEventListener('click', () => {
  contactForm.reset();
  contactForm.style.display = 'block';
  contactConfirmPanel.classList.remove('active');
  trackEvent('contact_reset_initiated', { status: 'reset' });
});

// ==========================================
// 6.5. SERVICES DATABASE & AUTO-SEARCH (LocalRamu style)
// ==========================================
const SERVICES_DB = [
  { name: "New PC Sales & Custom Assembly", link: "#computer-details", keywords: ["pc", "computer", "desktop", "build", "gaming", "custom", "sales", "buy", "assemble"] },
  { name: "High-Speed SSD & RAM Upgrades", link: "#computer-details", keywords: ["ssd", "ram", "upgrade", "speed", "slow", "boost", "disk", "memory"] },
  { name: "OS Troubleshooting & Malware Cleansing", link: "#computer-details", keywords: ["os", "windows", "troubleshoot", "virus", "malware", "slow", "software", "clean"] },
  { name: "Office LAN / Wi-Fi Network Deployment", link: "#computer-details", keywords: ["lan", "wifi", "network", "cable", "switch", "router", "internet"] },
  { name: "CCTV Dome/Bullet Smart Installation", link: "#cctv-details", keywords: ["cctv", "camera", "install", "bullet", "dome", "security", "shop", "office"] },
  { name: "NVR/DVR System Upgrades", link: "#cctv-details", keywords: ["nvr", "dvr", "hdd", "storage", "hard drive", "record", "upgrade"] },
  { name: "Mobile Remote Access CCTV Config", link: "#cctv-details", keywords: ["mobile", "remote", "stream", "online", "phone", "app", "view"] },
  { name: "Annual Maintenance Contracts (AMC)", link: "#cctv-details", keywords: ["amc", "maintenance", "repair", "service", "clean", "lens", "yearly"] }
];

function initServiceSearch() {
  const searchInput = document.getElementById('serviceSearchInput');
  const searchClear = document.getElementById('btnSearchClear');
  const suggestionsBox = document.getElementById('searchSuggestions');
  
  if (!searchInput || !suggestionsBox) return;

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.toLowerCase().trim();
    if (val === '') {
      searchClear.style.display = 'none';
      suggestionsBox.style.display = 'none';
      suggestionsBox.innerHTML = '';
      return;
    }
    
    searchClear.style.display = 'block';
    
    // Filter services based on name or keywords matching input
    const matches = SERVICES_DB.filter(svc => 
      svc.name.toLowerCase().includes(val) || 
      svc.keywords.some(kw => kw.includes(val))
    );
    
    if (matches.length === 0) {
      suggestionsBox.innerHTML = '<div class="suggestion-item" style="cursor: default; opacity: 0.7;">No matching services found.</div>';
    } else {
      suggestionsBox.innerHTML = matches.map(svc => `
        <div class="suggestion-item" data-link="${svc.link}" data-name="${svc.name}">
          🎯 ${svc.name}
        </div>
      `).join('');
      
      // Bind click on items
      suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          const targetLink = item.getAttribute('data-link');
          const targetName = item.getAttribute('data-name');
          
          searchInput.value = targetName;
          suggestionsBox.style.display = 'none';
          
          // Scroll to target element
          const targetEl = document.querySelector(targetLink);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight animation class
            targetEl.classList.add('highlight-pulse');
            setTimeout(() => {
              targetEl.classList.remove('highlight-pulse');
            }, 3000);
          }
          
          trackEvent('hero_search_used', { query: targetName, target: targetLink });
        });
      });
    }
    
    suggestionsBox.style.display = 'block';
  });
  
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    suggestionsBox.style.display = 'none';
    suggestionsBox.innerHTML = '';
    searchInput.focus();
  });
  
  // Close suggestions box if user clicks outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
}

function initServiceToggles() {
  const compCard = document.querySelector('.services-cards-grid .service-overview-card:nth-child(1)');
  const cctvCard = document.querySelector('.services-cards-grid .service-overview-card:nth-child(2)');
  const compDetails = document.getElementById('computer-details');
  const cctvDetails = document.getElementById('cctv-details');
  
  if (!compCard || !cctvCard || !compDetails || !cctvDetails) return;
  
  const forceAnimate = (el) => {
    el.classList.add('animate');
    el.querySelectorAll('.scroll-trigger-element').forEach(child => {
      child.classList.add('animate');
    });
  };

  // Set initial state
  compCard.classList.add('active-tab');
  cctvDetails.style.display = 'none';
  forceAnimate(compDetails);
  
  compCard.addEventListener('click', (e) => {
    e.preventDefault();
    compCard.classList.add('active-tab');
    cctvCard.classList.remove('active-tab');
    
    compDetails.style.display = 'grid';
    cctvDetails.style.display = 'none';
    forceAnimate(compDetails);
    
    compDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    trackEvent('service_tab_changed', { tab: 'computer' });
  });
  
  cctvCard.addEventListener('click', (e) => {
    e.preventDefault();
    cctvCard.classList.add('active-tab');
    compCard.classList.remove('active-tab');
    
    cctvDetails.style.display = 'grid';
    compDetails.style.display = 'none';
    forceAnimate(cctvDetails);
    
    cctvDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    trackEvent('service_tab_changed', { tab: 'cctv' });
  });
}

// ==========================================
// 7. INITIALIZE AND START
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Build calendar cells
  generateCalendar();
  
  // Init Search Features
  initServiceSearch();
  
  // Init Service Overview Card Tabs
  initServiceToggles();

  trackEvent('landing_page_loaded', { viewport: `${window.innerWidth}x${window.innerHeight}` });
});


