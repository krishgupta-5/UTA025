'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './bookings.module.css'
import SizeSlider from '../../components/SizeSlider'

export default function Bookings() {
  // Demo OTP and valid coupon codes are kept exclusively in JS state
  const DEMO_OTP = '123456'
  const VALID_COUPONS: Record<string, number> = { 'BASIC50': 50, 'FIRST100': 100 }

  const [state, setState] = useState({
    service: 'daily',
    serviceName: 'Daily Cleaning',
    basePrice: 299,
    size: 800,
    selectedDate: '',
    selectedTime: '',
    addons: {} as Record<string, number>,
    addonTotal: 0,
    paymentMethod: 'upi',
    couponDiscount: 0,
    phone: '',
    currentStep: 1,
    otpVerified: false,
    computedTotal: 419,
  })

  const [otpTimer, setOtpTimer] = useState<NodeJS.Timeout | null>(null)
  const [otpCountdown, setOtpCountdown] = useState(30)
  const [showResendBtn, setShowResendBtn] = useState(false)

  const sizePriceMap: Record<string, (s: number) => number> = {
    daily:   (s) => s<=500?299:s<=1000?399:s<=1500?499:s<=2500?699:899,
    deep:    (s) => s<=500?799:s<=1000?1199:s<=1500?1599:s<=2500?2199:2799,
    kitchen: (s) => s<=500?399:s<=1000?499:s<=1500?699:s<=2500?899:1099,
    laundry: (s) => s<=500?199:s<=1000?299:s<=1500?399:s<=2500?499:599,
    pest:    (s) => s<=500?799:s<=1000?999:s<=1500?1299:s<=2500?1699:2199,
    society: () => 4999,
  }

  useEffect(() => {
    buildDates()
    buildTimes()
    updateSummary()
  }, [])

  const buildDates = () => {
    const container = document.getElementById('date-slots')
    if (!container) return
    
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const today = new Date()
    container.innerHTML = ''
    
    for(let i=0;i<7;i++) {
      const d = new Date(today)
      d.setDate(today.getDate()+i)
      const div = document.createElement('div')
      div.className = `${styles.dateSlot}${i===0 ? ` ${styles.selected}` : ''}`
      div.innerHTML = `<div class="${styles.dsDay}">${i===0?'Today':days[d.getDay()]}</div><div class="${styles.dsDate}">${d.getDate()}</div><div class="${styles.dsMonth}">${months[d.getMonth()]}</div>`
      div.onclick = () => {
        document.querySelectorAll(`.${styles.dateSlot}`).forEach((x: any) => x.classList.remove(styles.selected))
        div.classList.add(styles.selected)
        setState(prev => ({ ...prev, selectedDate: `${d.getDate()} ${months[d.getMonth()]}` }))
        updateSummary()
      }
      if(i===0) setState(prev => ({ ...prev, selectedDate: `${d.getDate()} ${months[d.getMonth()]}` }))
      container.appendChild(div)
    }
  }

  const buildTimes = () => {
    const container = document.getElementById('time-grid')
    if (!container) return
    
    const slots = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM']
    const unavail = ['12:00 PM','6:00 PM']
    container.innerHTML = ''
    
    slots.forEach((t,i) => {
      const div = document.createElement('div')
      const isUnavail = unavail.includes(t)
      div.className = `${styles.timeSlot}${i===0 ? ` ${styles.selected}` : ''}${isUnavail ? ` ${styles.unavailable}` : ''}`
      div.textContent = t
      if(!isUnavail) {
        div.onclick = () => {
          document.querySelectorAll(`.${styles.timeSlot}:not(.${styles.unavailable})`).forEach((x: any) => x.classList.remove(styles.selected))
          div.classList.add(styles.selected)
          setState(prev => ({ ...prev, selectedTime: t }))
          updateSummary()
        }
      }
      if(i===0) setState(prev => ({ ...prev, selectedTime: t }))
      container.appendChild(div)
    })
  }

  const selectService = (el: HTMLElement, key: string, name: string, basePrice: number) => {
    document.querySelectorAll(`.${styles.serviceOpt}`).forEach((x: any) => x.classList.remove(styles.selected))
    el.classList.add(styles.selected)
    setState(prev => ({ 
      ...prev, 
      service: key, 
      serviceName: name, 
      basePrice: basePrice 
    }))
    updateSummary()
  }

  const updateSize = (val: number) => {
    setState(prev => ({ ...prev, size: val }))
    updateSummary()
  }

  const toggleAddon = (el: HTMLElement, name: string, price: number) => {
    el.classList.toggle(styles.selected)
    const check = el.querySelector(`.${styles.addonCheck}`)
    if(el.classList.contains(styles.selected)) {
      setState(prev => ({ 
        ...prev, 
        addons: { ...prev.addons, [name]: price },
        addonTotal: Object.values({ ...prev.addons, [name]: price }).reduce((a,b) => a+b, 0)
      }))
      if (check) check.textContent = '✓'
    } else {
      const newAddons = { ...state.addons }
      delete newAddons[name]
      setState(prev => ({ 
        ...prev, 
        addons: newAddons,
        addonTotal: Object.values(newAddons).reduce((a,b) => a+b, 0)
      }))
      if (check) check.textContent = ''
    }
    updateSummary()
  }

  const updateSummary = () => {
    const base = sizePriceMap[state.service](state.size)
    const computedTotal = base + state.addonTotal + 20 - state.couponDiscount
    
    setState(prev => ({ ...prev, basePrice: base, computedTotal }))

    const elements = {
      'sum-service': state.serviceName,
      'sum-size': state.size + ' sq ft',
      'sum-date': state.selectedDate || '—',
      'sum-time': state.selectedTime || '—',
      'sum-base': '₹' + base.toLocaleString('en-IN'),
      'sum-total': '₹' + computedTotal.toLocaleString('en-IN'),
      'pay-amount': computedTotal.toLocaleString('en-IN')
    }

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id)
      if (el) el.textContent = value
    })

    const cityEl = document.getElementById('city') as HTMLSelectElement
    if (cityEl) {
      const cityEl2 = document.getElementById('sum-city')
      if (cityEl2) cityEl2.textContent = cityEl.value || 'Delhi / NCR'
    }

    const addonRow = document.getElementById('addon-row')
    const sumAddons = document.getElementById('sum-addons')
    if(state.addonTotal > 0) {
      if (addonRow) addonRow.style.display = 'flex'
      if (sumAddons) sumAddons.textContent = '₹' + state.addonTotal
    } else {
      if (addonRow) addonRow.style.display = 'none'
    }

    const discountRow = document.getElementById('discount-row')
    const sumDiscount = document.getElementById('sum-discount')
    if(state.couponDiscount > 0) {
      if (discountRow) discountRow.style.display = 'flex'
      if (sumDiscount) sumDiscount.textContent = '-₹' + state.couponDiscount
    } else {
      if (discountRow) discountRow.style.display = 'none'
    }
  }

  const validateName = (el: HTMLInputElement) => {
    const err = document.getElementById('fname-err')
    if(el.value.trim().length < 2) { 
      el.classList.add('error'); 
      if (err) err.classList.add('show'); 
    } else { 
      el.classList.remove('error'); 
      el.classList.add('valid'); 
      if (err) err.classList.remove('show'); 
    }
  }

  const validatePhone = (el: HTMLInputElement) => {
    const err = document.getElementById('phone-err')
    if(el.value.length !== 10) { 
      el.classList.add('error'); 
      if (err) err.classList.add('show'); 
    } else { 
      el.classList.remove('error'); 
      el.classList.add('valid'); 
      if (err) err.classList.remove('show'); 
    }
  }

  const sendOTP = () => {
    const fname = (document.getElementById('fname') as HTMLInputElement)?.value.trim()
    const phone = (document.getElementById('phone') as HTMLInputElement)?.value.trim()
    const address = (document.getElementById('address') as HTMLInputElement)?.value.trim()
    
    if(!fname) { 
      const fnameEl = document.getElementById('fname') as HTMLInputElement
      if (fnameEl) fnameEl.classList.add('error')
      const err = document.getElementById('fname-err')
      if (err) err.classList.add('show')
      return
    }
    if(phone.length !== 10) { 
      const phoneEl = document.getElementById('phone') as HTMLInputElement
      if (phoneEl) phoneEl.classList.add('error')
      const err = document.getElementById('phone-err')
      if (err) err.classList.add('show')
      return
    }
    if(!address) { 
      const addrEl = document.getElementById('address') as HTMLInputElement
      if (addrEl) addrEl.classList.add('error')
      const err = document.getElementById('addr-err')
      if (err) err.classList.add('show')
      return
    }
    
    setState(prev => ({ ...prev, phone }))
    
    const btn = document.getElementById('otp-btn-text')
    const spinner = document.getElementById('otp-spinner')
    if (btn) btn.textContent = 'Sending…'
    if (spinner) spinner.style.display = 'block'
    
    setTimeout(() => {
      if (btn) btn.textContent = 'OTP Sent ✓'
      if (spinner) spinner.style.display = 'none'
      goToStep(3)
      
      const phoneDisplay = document.getElementById('otp-phone-display')
      if (phoneDisplay) phoneDisplay.textContent = phone.slice(0,2) + 'XXXXXXXX'
      
      startOtpTimer()
      setTimeout(() => {
        const o1 = document.getElementById('o1') as HTMLInputElement
        if (o1) o1.focus()
      }, 400)
    }, 1500)
  }

  const startOtpTimer = () => {
    let t = 30
    if (otpTimer) clearInterval(otpTimer)
    setShowResendBtn(false)
    
    const timer = setInterval(() => {
      t--
      setOtpCountdown(t)
      const countdownEl = document.getElementById('otp-countdown')
      if (countdownEl) countdownEl.textContent = t + 's'
      
      if(t <= 0) {
        clearInterval(timer)
        setOtpTimer(null)
        const timerEl = document.getElementById('otp-timer')
        const resendBtn = document.getElementById('resend-btn')
        if (timerEl) timerEl.style.display = 'none'
        if (resendBtn) resendBtn.style.display = 'inline'
        setShowResendBtn(true)
      }
    }, 1000)
    
    setOtpTimer(timer)
  }

  const otpInput = (el: HTMLInputElement, idx: number) => {
    el.value = el.value.replace(/\D/,'')
    if(el.value && idx < 6) {
      const nextEl = document.getElementById('o'+(idx+1)) as HTMLInputElement
      if (nextEl) nextEl.focus()
    }
    el.classList.toggle('filled', el.value.length > 0)
    
    const full = [1,2,3,4,5,6].map((i: number) => {
      const input = document.getElementById('o'+i) as HTMLInputElement
      return input?.value || ''
    }).join('')
    
    const verifyBtn = document.getElementById('verify-btn') as HTMLButtonElement
    if (verifyBtn) verifyBtn.disabled = full.length < 6
  }

  const otpBack = (e: React.KeyboardEvent, idx: number) => {
    if(e.key==='Backspace' && !(e.target as HTMLInputElement).value && idx > 1) {
      const prevEl = document.getElementById('o'+(idx-1)) as HTMLInputElement
      if (prevEl) prevEl.focus()
    }
  }

  const resendOTP = () => {
    [1,2,3,4,5,6].forEach((i: number) => { 
      const input = document.getElementById('o'+i) as HTMLInputElement
      if (input) {
        input.value = ''
        input.classList.remove('filled')
      }
    })
    
    const verifyBtn = document.getElementById('verify-btn') as HTMLButtonElement
    if (verifyBtn) verifyBtn.disabled = true
    
    startOtpTimer()
    setTimeout(() => {
      const o1 = document.getElementById('o1') as HTMLInputElement
      if (o1) o1.focus()
    }, 100)
  }

  const verifyOTP = () => {
    const entered = [1,2,3,4,5,6].map((i: number) => {
      const input = document.getElementById('o'+i) as HTMLInputElement
      return input?.value || ''
    }).join('')
    
    const btn = document.getElementById('verify-btn') as HTMLButtonElement
    const spinner = document.getElementById('verify-spinner')
    const btnLabel = document.getElementById('verify-btn-text')
    
    if (btnLabel) btnLabel.textContent = 'Verifying…'
    if (spinner) spinner.style.display = 'block'
    if (btn) btn.disabled = true
    
    setTimeout(() => {
      if(entered === DEMO_OTP) {
        if (spinner) spinner.style.display = 'none'
        if (btnLabel) btnLabel.textContent = 'Verified ✓'
        if (btn) {
          btn.style.background = 'var(--green)'
        }
        
        const inputSection = document.getElementById('otp-input-section')
        const verifiedSection = document.getElementById('verified-section')
        if (inputSection) inputSection.style.display = 'none'
        if (verifiedSection) verifiedSection.style.display = 'block'
        
        setState(prev => ({ ...prev, otpVerified: true }))
        setTimeout(() => goToStep(4), 800)
      } else {
        if (spinner) spinner.style.display = 'none'
        if (btnLabel) btnLabel.textContent = 'Verify & Continue →'
        if (btn) btn.disabled = false
        
        [1,2,3,4,5,6].forEach((i: number) => { 
          const input = document.getElementById('o'+i) as HTMLInputElement
          if (input) {
            input.classList.remove('filled')
            input.classList.add('error')
          }
        })
        setTimeout(() => {
          [1,2,3,4,5,6].forEach((i: number) => { 
            const input = document.getElementById('o'+i) as HTMLInputElement
            if (input) input.classList.remove('error')
          })
        }, 600)
      }
    }, 1200)
  }

  const selectPayment = (el: HTMLElement, method: string) => {
    document.querySelectorAll(`.${styles.paymentMethod}`).forEach((x: any) => x.classList.remove(styles.selected))
    el.classList.add(styles.selected)
    setState(prev => ({ ...prev, paymentMethod: method }))
    
    const upiForm = document.getElementById('upi-form')
    const cardForm = document.getElementById('card-form')
    if (upiForm) upiForm.className = `${styles.upiForm}${method==='upi' ? ` ${styles.show}` : ''}`
    if (cardForm) cardForm.className = `${styles.cardForm}${method==='card' ? ` ${styles.show}` : ''}`
  }

  const selectUpiApp = (el: HTMLElement) => {
    document.querySelectorAll(`.${styles.upiApp}`).forEach((x: any) => x.classList.remove(styles.selected))
    el.classList.add(styles.selected)
  }

  const formatCard = (el: HTMLInputElement) => {
    let v = el.value.replace(/\D/g,'').substring(0,16)
    el.value = v.replace(/(.{4})/g,'$1 ').trim()
  }

  const formatExpiry = (el: HTMLInputElement) => {
    let v = el.value.replace(/\D/g,'')
    if(v.length >= 2) v = v.slice(0,2) + ' / ' + v.slice(2,4)
    el.value = v
  }

  const applyCoupon = () => {
    const code = (document.getElementById('coupon') as HTMLInputElement)?.value.trim().toUpperCase()
    const msg = document.getElementById('coupon-msg')
    if (msg) msg.style.display = 'block'
    
    if(VALID_COUPONS[code!] !== undefined) {
      setState(prev => ({ ...prev, couponDiscount: VALID_COUPONS[code!] }))
      if (msg) {
        msg.style.color = 'var(--green)'
        msg.textContent = '✓ Coupon applied! ₹' + VALID_COUPONS[code!] + ' off your booking.'
      }
      updateSummary()
    } else {
      if (msg) {
        msg.style.color = 'var(--red)'
        msg.textContent = '✗ Invalid or expired coupon code.'
      }
    }
  }

  const processPayment = () => {
    const payBtn = document.getElementById('pay-btn') as HTMLButtonElement
    const payLabel = document.getElementById('pay-btn-label')
    const spinner = document.getElementById('pay-spinner')
    
    if (payBtn) payBtn.disabled = true
    if (payLabel) payLabel.textContent = 'Processing…'
    if (spinner) spinner.style.display = 'block'
    
    setTimeout(() => {
      if (spinner) spinner.style.display = 'none'
      
      const stepper = document.getElementById('stepper')
      const step4 = document.getElementById('step4')
      const stepSuccess = document.getElementById('step-success')
      
      if (stepper) stepper.style.display = 'none'
      if (step4) step4.classList.remove(styles.active)
      if (stepSuccess) stepSuccess.classList.add(styles.active)
      
      const id = '#BJ-' + new Date().getFullYear() + '-' + Math.floor(1000+Math.random()*9000)
      const bookingIdVal = document.getElementById('booking-id-val')
      if (bookingIdVal) bookingIdVal.textContent = id
      
      const now = new Date()
      const tConfirmed = document.getElementById('t-confirmed')
      const tService = document.getElementById('t-service')
      if (tConfirmed) tConfirmed.textContent = now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})
      if (tService) tService.textContent = state.selectedDate + ' at ' + state.selectedTime
      
      setTimeout(() => {
        const dots = document.querySelectorAll('.track-dot')
        if (dots[2]) {
          dots[2].classList.remove('active')
          dots[2].classList.add('done')
          ;(dots[2] as HTMLElement).textContent = '✓'
        }
        const trackTime = document.querySelector('#track-steps .track-step:nth-child(3) .track-time')
        if (trackTime) trackTime.textContent = 'Priya D. · ⭐ 4.9 · Assigned ✓'
        if (dots[3]) {
          dots[3].classList.add('active')
          ;(dots[3] as HTMLElement).textContent = '⟳'
        }
      }, 2000)
    }, 2200)
  }

  const downloadReceipt = () => {
    const bookingId = document.getElementById('booking-id-val')?.textContent || ''
    const fname = (document.getElementById('fname') as HTMLInputElement)?.value || ''
    const lname = (document.getElementById('lname') as HTMLInputElement)?.value || ''
    const phone = (document.getElementById('phone') as HTMLInputElement)?.value || ''
    const address = (document.getElementById('address') as HTMLInputElement)?.value || ''
    const city = (document.getElementById('city') as HTMLSelectElement)?.value || ''
    const pincode = (document.getElementById('pincode') as HTMLInputElement)?.value || ''
    const notes = (document.getElementById('notes') as HTMLTextAreaElement)?.value || ''
    const addonNames = Object.keys(state.addons).join(', ')

    const totalDisplay = '₹' + state.computedTotal.toLocaleString('en-IN')
    const baseDisplay = '₹' + state.basePrice.toLocaleString('en-IN')

    const receiptHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${bookingId}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #FF6B1A; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; color: #0D0F14; }
    .logo span { color: #FF6B1A; }
    .booking-id { font-size: 18px; color: #666; margin-top: 10px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: bold; color: #FF6B1A; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
    .row:last-child { border-bottom: none; }
    .label { color: #666; }
    .value { font-weight: 600; }
    .total-row { font-size: 18px; font-weight: bold; color: #FF6B1A; border-top: 2px solid #eee; padding-top: 15px; margin-top: 10px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
    .status { background: #22C55E; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Basic<span>Jobs</span></div>
    <div class="booking-id">${bookingId}</div>
    <div class="status">✓ PAYMENT CONFIRMED</div>
  </div>
  <div class="section">
    <div class="section-title">Customer Details</div>
    <div class="row"><span class="label">Name:</span><span class="value">${fname} ${lname}</span></div>
    <div class="row"><span class="label">Phone:</span><span class="value">+91 ${phone}</span></div>
    <div class="row"><span class="label">Address:</span><span class="value">${address}, ${city}${pincode ? ' - ' + pincode : ''}</span></div>
  </div>
  <div class="section">
    <div class="section-title">Service Details</div>
    <div class="row"><span class="label">Service:</span><span class="value">${state.serviceName}</span></div>
    <div class="row"><span class="label">Home Size:</span><span class="value">${state.size} sq ft</span></div>
    <div class="row"><span class="label">Date:</span><span class="value">${state.selectedDate}</span></div>
    <div class="row"><span class="label">Time:</span><span class="value">${state.selectedTime}</span></div>
    ${addonNames ? `<div class="row"><span class="label">Add-ons:</span><span class="value">${addonNames}</span></div>` : ''}
    ${notes ? `<div class="row"><span class="label">Notes:</span><span class="value">${notes}</span></div>` : ''}
  </div>
  <div class="section">
    <div class="section-title">Payment Summary</div>
    <div class="row"><span class="label">Base Price:</span><span class="value">${baseDisplay}</span></div>
    ${state.addonTotal > 0 ? `<div class="row"><span class="label">Add-ons:</span><span class="value">₹${state.addonTotal}</span></div>` : ''}
    ${state.couponDiscount > 0 ? `<div class="row"><span class="label" style="color:#22C55E;">Coupon Discount:</span><span class="value" style="color:#22C55E;">-₹${state.couponDiscount}</span></div>` : ''}
    <div class="row"><span class="label">Platform Fee:</span><span class="value">₹20</span></div>
    <div class="row total-row"><span class="label">Total Paid:</span><span class="value">${totalDisplay}</span></div>
    <div class="row"><span class="label">Payment Method:</span><span class="value">${state.paymentMethod.toUpperCase()}</span></div>
  </div>
  <div class="footer">
    <p>Thank you for choosing BasicJobs!</p>
    <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
    <p>For support: support@basicjobs.com | 1800-123-4567</p>
  </div>
</body>
</html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(receiptHTML)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 250)
    }
  }

  const goToStep = (n: number) => {
    [1,2,3,4].forEach(i => {
      const card = document.getElementById('step'+i)
      if (card) card.classList.toggle(styles.active, i===n)
    })
    
    const stepSuccess = document.getElementById('step-success')
    if (stepSuccess) stepSuccess.classList.remove(styles.active)
    
    setState(prev => ({ ...prev, currentStep: n }))
    updateStepUI(n)
    window.scrollTo({top:0,behavior:'smooth'})
  }

  const updateStepUI = (n: number) => {
    for(let i=1;i<=5;i++) {
      const c = document.getElementById('sc'+i)
      const l = document.getElementById('sl'+i)
      if (c && l) {
        if(i < n) {
          c.className = `${styles.stepCircle} ${styles.done}`
          c.textContent = '✓'
          l.className = `${styles.stepLabel} ${styles.done}`
        } else if(i===n) {
          c.className = `${styles.stepCircle} ${styles.active}`
          c.textContent = i.toString()
          l.className = `${styles.stepLabel} ${styles.active}`
        } else {
          c.className = styles.stepCircle
          c.textContent = i.toString()
          l.className = styles.stepLabel
        }
      }
    }
    
    for(let i=1;i<=4;i++) {
      const line = document.getElementById('line'+i)
      if (line) {
        line.className = `${styles.stepLine}${i < n ? ` ${styles.done}` : ''}`
      }
    }
  }

  const goBack = () => {
    if(state.currentStep > 1) goToStep(state.currentStep - 1)
    else window.history.back()
  }

  return (
    <>
      <nav className={styles.nav}>
        <div className="logo">Basic<span>Jobs</span></div>
        <Link href="/" className={styles.navBack}>
          ← Back to Home
        </Link>
      </nav>

      <div className={styles.pageWrap}>
        <div>
          {/* STEPPER */}
          <div className={styles.stepper} id="stepper">
            <div className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${styles.active}`} id="sc1">1</div>
              <div className={`${styles.stepLabel} ${styles.active}`} id="sl1">Service</div>
            </div>
            <div className={styles.stepLine} id="line1"></div>
            <div className={styles.stepItem}>
              <div className={styles.stepCircle} id="sc2">2</div>
              <div className={styles.stepLabel} id="sl2">Details</div>
            </div>
            <div className={styles.stepLine} id="line2"></div>
            <div className={styles.stepItem}>
              <div className={styles.stepCircle} id="sc3">3</div>
              <div className={styles.stepLabel} id="sl3">Verify</div>
            </div>
            <div className={styles.stepLine} id="line3"></div>
            <div className={styles.stepItem}>
              <div className={styles.stepCircle} id="sc4">4</div>
              <div className={styles.stepLabel} id="sl4">Pay</div>
            </div>
            <div className={styles.stepLine} id="line4"></div>
            <div className={styles.stepItem}>
              <div className={styles.stepCircle} id="sc5">✓</div>
              <div className={styles.stepLabel} id="sl5">Confirm</div>
            </div>
          </div>

          {/* STEP 1 */}
          <div className={`${styles.flowCard} ${styles.active}`} id="step1">
            <div className={styles.cardHeader}>
              <div className={styles.cardTag}>Step 1 of 4</div>
              <div className={styles.cardTitle}>Choose Your Service</div>
              <div className={styles.cardSub}>Select a service and configure your home size & schedule.</div>
            </div>

            <span className={styles.secLabel}>Service Type</span>
            <div className={styles.serviceGrid} id="service-grid">
              <div className={`${styles.serviceOpt} ${styles.selected}`} onClick={(e) => selectService(e.currentTarget, 'daily', 'Daily Cleaning', 299)}>
                <div className={styles.svcIcon}>🧹</div>
                <div className={styles.svcName}>Daily Clean</div>
                <div className={styles.svcPrice}>From ₹299</div>
              </div>
              <div className={styles.serviceOpt} onClick={(e) => selectService(e.currentTarget, 'deep', 'Deep Cleaning', 999)}>
                <div className={styles.svcIcon}>🫧</div>
                <div className={styles.svcName}>Deep Clean</div>
                <div className={styles.svcPrice}>From ₹999</div>
              </div>
              <div className={styles.serviceOpt} onClick={(e) => selectService(e.currentTarget, 'kitchen', 'Kitchen Clean', 499)}>
                <div className={styles.svcIcon}>🍳</div>
                <div className={styles.svcName}>Kitchen</div>
                <div className={styles.svcPrice}>From ₹499</div>
              </div>
              <div className={styles.serviceOpt} onClick={(e) => selectService(e.currentTarget, 'laundry', 'Laundry', 199)}>
                <div className={styles.svcIcon}>👕</div>
                <div className={styles.svcName}>Laundry</div>
                <div className={styles.svcPrice}>From ₹199</div>
              </div>
              <div className={styles.serviceOpt} onClick={(e) => selectService(e.currentTarget, 'pest', 'Pest Control', 799)}>
                <div className={styles.svcIcon}>🐜</div>
                <div className={styles.svcName}>Pest Control</div>
                <div className={styles.svcPrice}>From ₹799</div>
              </div>
              <div className={styles.serviceOpt} onClick={(e) => selectService(e.currentTarget, 'society', 'Society Contract', 4999)}>
                <div className={styles.svcIcon}>🏢</div>
                <div className={styles.svcName}>Society</div>
                <div className={styles.svcPrice}>From ₹4999</div>
              </div>
            </div>

            <span className={styles.secLabel}>Home Size</span>
            <SizeSlider 
              defaultValue={800}
              onChange={(value) => updateSize(value)}
            />

            <span className={styles.secLabel}>Pick a Date</span>
            <div className={styles.dateSlots} id="date-slots"></div>

            <span className={styles.secLabel}>Pick a Time</span>
            <div className={styles.timeGrid} id="time-grid"></div>

            <span className={styles.secLabel} style={{marginTop:'20px'}}>Add-ons (Optional)</span>
            <div className={styles.addonList}>
              <div className={styles.addonItem} onClick={(e) => toggleAddon(e.currentTarget, 'Equipment Kit', 99)}>
                <div className={styles.addonLeft}>
                  <div className={styles.addonIcon}>🧴</div>
                  <div><div className={styles.addonName}>Premium Equipment Kit</div><div className={styles.addonDesc}>Professional-grade cleaning supplies</div></div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <div className={styles.addonPrice}>+₹99</div>
                  <div className={styles.addonCheck}></div>
                </div>
              </div>
              <div className={styles.addonItem} onClick={(e) => toggleAddon(e.currentTarget, 'Sanitization', 149)}>
                <div className={styles.addonLeft}>
                  <div className={styles.addonIcon}>💦</div>
                  <div><div className={styles.addonName}>Floor Sanitization</div><div className={styles.addonDesc}>Disinfect with hospital-grade solution</div></div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <div className={styles.addonPrice}>+₹149</div>
                  <div className={styles.addonCheck}></div>
                </div>
              </div>
              <div className={styles.addonItem} onClick={(e) => toggleAddon(e.currentTarget, 'Waste Disposal', 79)}>
                <div className={styles.addonLeft}>
                  <div className={styles.addonIcon}>🗑️</div>
                  <div><div className={styles.addonName}>Waste Disposal</div><div className={styles.addonDesc}>Segregated pickup + disposal</div></div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <div className={styles.addonPrice}>+₹79</div>
                  <div className={styles.addonCheck}></div>
                </div>
              </div>
            </div>

            <button className={styles.btnPrimary} onClick={() => goToStep(2)}>Continue to Details →</button>
          </div>

          {/* STEP 2 */}
          <div className={styles.flowCard} id="step2">
            <div className={styles.cardHeader}>
              <div className={styles.cardTag}>Step 2 of 4</div>
              <div className={styles.cardTitle}>Your Details</div>
              <div className={styles.cardSub}>We'll use this to confirm your booking and assign a worker.</div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>First Name</label>
                <input type="text" id="fname" placeholder="Rahul" onInput={(e) => validateName(e.target as HTMLInputElement)} />
                <div className={styles.inputError} id="fname-err">Please enter your name</div>
              </div>
              <div className={styles.formGroup}>
                <label>Last Name</label>
                <input type="text" id="lname" placeholder="Mehta" />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Phone Number</label>
                <div className={styles.phoneWrap}>
                  <div className={styles.phonePrefix}>🇮🇳 +91</div>
                  <input type="tel" id="phone" placeholder="98765 43210" maxLength={10} onInput={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g,''); validatePhone(e.target as HTMLInputElement); }} />
                </div>
                <div className={styles.inputError} id="phone-err">Please enter a valid 10-digit number</div>
                <div className={styles.inputHint}>We'll send an OTP to verify your number</div>
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Full Address</label>
                <input type="text" id="address" placeholder="Flat 4B, Sunshine Towers, Sector 18..." />
                <div className={styles.inputError} id="addr-err">Please enter your address</div>
              </div>
              <div className={styles.formGroup}>
                <label>City</label>
                <select id="city" onChange={updateSummary}>
                  <option>Delhi / NCR</option>
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                  <option>Hyderabad</option>
                  <option>Pune</option>
                  <option>Chennai</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Pincode</label>
                <input type="text" id="pincode" placeholder="110001" maxLength={6} onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g,'')} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Special Instructions (Optional)</label>
                <textarea id="notes" placeholder="e.g. Focus on kitchen, avoid bedroom, call before arriving…" rows={3} style={{resize:'vertical'}}></textarea>
              </div>
            </div>

            <button className={styles.btnPrimary} onClick={sendOTP}>
              <span id="otp-btn-text">Send OTP to Verify →</span>
              <div className={styles.spinner} id="otp-spinner"></div>
            </button>
            <button className={styles.btnGhost} onClick={() => goToStep(1)}>← Back</button>
          </div>

          {/* STEP 3 */}
          <div className={styles.flowCard} id="step3">
            <div className={styles.cardHeader}>
              <div className={styles.cardTag}>Step 3 of 4</div>
              <div className={styles.cardTitle}>Verify Your Number</div>
              <div className={styles.cardSub}>Enter the 6-digit OTP sent to your phone.</div>
            </div>

            <div className={styles.otpWrap}>
              <div className={styles.otpPhoneDisplay}>
                📱 +91 <span id="otp-phone-display">XXXXXXXXXX</span>
              </div>
              <div id="otp-input-section">
                <div className={styles.otpInputs}>
                  <input type="text" className={styles.otpBox} maxLength={1} id="o1" onInput={(e) => otpInput(e.target as HTMLInputElement, 1)} onKeyDown={(e) => otpBack(e, 1)} />
                  <input type="text" className={styles.otpBox} maxLength={1} id="o2" onInput={(e) => otpInput(e.target as HTMLInputElement, 2)} onKeyDown={(e) => otpBack(e, 2)} />
                  <input type="text" className={styles.otpBox} maxLength={1} id="o3" onInput={(e) => otpInput(e.target as HTMLInputElement, 3)} onKeyDown={(e) => otpBack(e, 3)} />
                  <input type="text" className={styles.otpBox} maxLength={1} id="o4" onInput={(e) => otpInput(e.target as HTMLInputElement, 4)} onKeyDown={(e) => otpBack(e, 4)} />
                  <input type="text" className={styles.otpBox} maxLength={1} id="o5" onInput={(e) => otpInput(e.target as HTMLInputElement, 5)} onKeyDown={(e) => otpBack(e, 5)} />
                  <input type="text" className={styles.otpBox} maxLength={1} id="o6" onInput={(e) => otpInput(e.target as HTMLInputElement, 6)} onKeyDown={(e) => otpBack(e, 6)} />
                </div>
                <div className={styles.otpTimer} id="otp-timer">Resend OTP in <strong id="otp-countdown">{otpCountdown}s</strong></div>
                <button className={styles.otpResend} id="resend-btn" style={{display: showResendBtn ? 'inline' : 'none'}} onClick={resendOTP}>Resend OTP</button>
              </div>
              <div id="verified-section" style={{display:'none'}}>
                <div className={styles.verifiedBadge}>✓ Phone number verified successfully!</div>
              </div>
            </div>

            <button className={styles.btnPrimary} id="verify-btn" onClick={verifyOTP} disabled>
              <span id="verify-btn-text">Verify & Continue →</span>
              <div className={styles.spinner} id="verify-spinner"></div>
            </button>
            <button className={styles.btnGhost} onClick={() => goToStep(2)}>← Change Number</button>
          </div>

          {/* STEP 4 */}
          <div className={styles.flowCard} id="step4">
            <div className={styles.cardHeader}>
              <div className={styles.cardTag}>Step 4 of 4</div>
              <div className={styles.cardTitle}>Payment</div>
              <div className={styles.cardSub}>Choose your preferred payment method. All transactions are secure.</div>
            </div>

            <div className={styles.paymentMethods}>
              <div className={`${styles.paymentMethod} ${styles.selected}`} onClick={(e) => selectPayment(e.currentTarget, 'upi')}>
                <div className={styles.pmLeft}>
                  <div className={styles.pmIcon} style={{background:'rgba(79,70,229,0.15)'}}>🔷</div>
                  <div>
                    <div className={styles.pmName}>UPI</div>
                    <div className={styles.pmDesc}>PhonePe, GPay, Paytm, BHIM & more</div>
                  </div>
                </div>
                <div className={styles.pmRadio}></div>
              </div>
              <div className={styles.paymentMethod} onClick={(e) => selectPayment(e.currentTarget, 'card')}>
                <div className={styles.pmLeft}>
                  <div className={styles.pmIcon} style={{background:'rgba(59,130,246,0.15)'}}>💳</div>
                  <div>
                    <div className={styles.pmName}>Credit / Debit Card</div>
                    <div className={styles.pmDesc}>Visa, Mastercard, RuPay</div>
                  </div>
                </div>
                <div className={styles.pmRadio}></div>
              </div>
              <div className={styles.paymentMethod} onClick={(e) => selectPayment(e.currentTarget, 'netbanking')}>
                <div className={styles.pmLeft}>
                  <div className={styles.pmIcon} style={{background:'rgba(34,197,94,0.15)'}}>🏦</div>
                  <div>
                    <div className={styles.pmName}>Net Banking</div>
                    <div className={styles.pmDesc}>All major Indian banks supported</div>
                  </div>
                </div>
                <div className={styles.pmRadio}></div>
              </div>
              <div className={styles.paymentMethod} onClick={(e) => selectPayment(e.currentTarget, 'cod')}>
                <div className={styles.pmLeft}>
                  <div className={styles.pmIcon} style={{background:'rgba(245,158,11,0.15)'}}>💵</div>
                  <div>
                    <div className={styles.pmName}>Pay After Service</div>
                    <div className={styles.pmDesc}>Cash or UPI at time of service</div>
                  </div>
                </div>
                <div className={styles.pmRadio}></div>
              </div>
            </div>

            {/* UPI Form */}
            <div className={`${styles.upiForm} ${styles.show}`} id="upi-form">
              <span className={styles.secLabel}>Choose UPI App</span>
              <div className={styles.upiApps}>
                <div className={`${styles.upiApp} ${styles.selected}`} onClick={(e) => selectUpiApp(e.currentTarget)}>
                  <div className={styles.upiLogo}>📱</div>PhonePe
                </div>
                <div className={styles.upiApp} onClick={(e) => selectUpiApp(e.currentTarget)}>
                  <div className={styles.upiLogo}>🟢</div>GPay
                </div>
                <div className={styles.upiApp} onClick={(e) => selectUpiApp(e.currentTarget)}>
                  <div className={styles.upiLogo}>🔵</div>Paytm
                </div>
                <div className={styles.upiApp} onClick={(e) => selectUpiApp(e.currentTarget)}>
                  <div className={styles.upiLogo}>🟠</div>BHIM
                </div>
              </div>
              <div className={styles.dividerLabel}>or enter UPI ID</div>
              <div className={styles.formGroup}>
                <label>UPI ID</label>
                <input type="text" placeholder="yourname@upi" id="upi-id" />
                <div className={styles.inputHint}>e.g. 9876543210@paytm, name@okaxis</div>
              </div>
            </div>

            {/* Card Form */}
            <div className={styles.cardForm} id="card-form">
              <div className={styles.formGroup}>
                <label>Card Number</label>
                <div className={styles.cardNumberWrap}>
                  <input type="text" id="card-num" placeholder="1234 5678 9012 3456" maxLength={19} onInput={(e) => formatCard(e.target as HTMLInputElement)} />
                  <div className={styles.cardIcons}>💳</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div className={styles.formGroup}>
                  <label>Expiry</label>
                  <input type="text" placeholder="MM / YY" maxLength={7} onInput={(e) => formatExpiry(e.target as HTMLInputElement)} />
                </div>
                <div className={styles.formGroup}>
                  <label>CVV</label>
                  <input type="password" placeholder="•••" maxLength={3} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Name on Card</label>
                <input type="text" placeholder="Rahul Mehta" />
              </div>
            </div>

            {/* Coupon */}
            <div style={{marginTop:'20px'}}>
              <span className={styles.secLabel}>Coupon Code</span>
              <div style={{display:'flex',gap:'10px'}}>
                <input type="text" id="coupon" placeholder="Enter coupon code" style={{flex:1}} />
                <button onClick={applyCoupon} style={{background:'var(--saffron)',color:'white',border:'none',padding:'0 18px',borderRadius:'10px',fontWeight:'700',cursor:'pointer',fontSize:'0.88rem',whiteSpace:'nowrap'}}>Apply</button>
              </div>
              <div id="coupon-msg" style={{fontSize:'0.78rem',marginTop:'6px',display:'none'}}></div>
            </div>

            <button className={styles.btnPrimary} onClick={processPayment} id="pay-btn">
              <span id="pay-btn-label">Pay ₹<span id="pay-amount">499</span></span>
              <div className={styles.spinner} id="pay-spinner"></div>
            </button>
            <div style={{textAlign:'center',marginTop:'10px',fontSize:'0.75rem',color:'var(--muted)'}}>🔒 Secured by Razorpay · 256-bit SSL</div>
            <button className={styles.btnGhost} onClick={() => goToStep(3)}>← Back</button>
          </div>

          {/* SUCCESS */}
          <div id="step-success" className={styles.stepSuccess}>
            <div className={`${styles.flowCard} ${styles.active}`} style={{textAlign:'center'}}>
              <div className={styles.successIcon}>✓</div>
              <div className={styles.successTitle}>Booking Confirmed!</div>
              <div className={styles.successSub}>Your service has been booked successfully. A verified worker has been assigned to you.</div>
              <div className={styles.bookingId}>Booking ID: <span id="booking-id-val">#BJ-2025-XXXX</span></div>

              <div className={styles.trackingCard}>
                <div className={styles.trackingTitle}>📍 Live Booking Status</div>
                <div className={styles.trackSteps} id="track-steps">
                  <div className={styles.trackStep}>
                    <div className={`${styles.trackDot} ${styles.done}`}>✓</div>
                    <div className={styles.trackInfo}>
                      <div className={styles.trackLabel}>Booking Confirmed</div>
                      <div className={styles.trackTime} id="t-confirmed">Just now</div>
                    </div>
                  </div>
                  <div className={styles.trackStep}>
                    <div className={`${styles.trackDot} ${styles.done}`}>✓</div>
                    <div className={styles.trackInfo}>
                      <div className={styles.trackLabel}>Payment Received</div>
                      <div className={styles.trackTime}>Verified ✓</div>
                    </div>
                  </div>
                  <div className={styles.trackStep}>
                    <div className={`${styles.trackDot} ${styles.active}`}>⟳</div>
                    <div className={styles.trackInfo}>
                      <div className={styles.trackLabel}>Worker Assigned</div>
                      <div className={styles.trackTime}>Priya D. · ⭐ 4.9 · Assigning…</div>
                    </div>
                  </div>
                  <div className={styles.trackStep}>
                    <div className={styles.trackDot}>4</div>
                    <div className={styles.trackInfo}>
                      <div className={styles.trackLabel}>Worker En Route</div>
                      <div className={styles.trackTime} id="t-service">Scheduled for your slot</div>
                    </div>
                  </div>
                  <div className={styles.trackStep}>
                    <div className={styles.trackDot}>5</div>
                    <div className={styles.trackInfo}>
                      <div className={styles.trackLabel}>Service Complete</div>
                      <div className={styles.trackTime}>Pending</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center'}}>
                <button className={styles.btnPrimary} style={{maxWidth:'200px',marginTop:'0'}} onClick={() => window.location.reload()}>Book Another →</button>
                <button className={styles.btnPrimary} style={{maxWidth:'200px',marginTop:'0',background:'var(--slate)'}} onClick={downloadReceipt}>Download Receipt</button>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>📋 Order Summary</div>

            <div className={styles.summaryItem}>
              <span className={styles.siLabel}>Service</span>
              <span className={styles.siVal} id="sum-service">Daily Cleaning</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.siLabel}>Home Size</span>
              <span className={styles.siVal} id="sum-size">800 sq ft</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.siLabel}>Date</span>
              <span className={styles.siVal} id="sum-date">—</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.siLabel}>Time</span>
              <span className={styles.siVal} id="sum-time">—</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.siLabel}>City</span>
              <span className={styles.siVal} id="sum-city">Delhi / NCR</span>
            </div>

            <hr className={styles.summaryDivider} />

            <div className={styles.summaryItem}>
              <span className={styles.siLabel}>Base Price</span>
              <span className={styles.siVal} id="sum-base">₹399</span>
            </div>
            <div className={styles.summaryItem} id="addon-row" style={{display:'none'}}>
              <span className={styles.siLabel}>Add-ons</span>
              <span className={styles.siVal} id="sum-addons">₹0</span>
            </div>
            <div className={styles.summaryItem} id="discount-row" style={{display:'none'}}>
              <span className={styles.siLabel} style={{color:'var(--green)'}}>Coupon Discount</span>
              <span className={styles.siVal} style={{color:'var(--green)'}} id="sum-discount">-₹0</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.siLabel}>Platform Fee</span>
              <span className={styles.siVal}>₹20</span>
            </div>

            <hr className={styles.summaryDivider} />

            <div className={styles.summaryTotal}>
              <span className={styles.tLabel}>Total</span>
              <span className={styles.tAmount} id="sum-total">₹419</span>
            </div>

            <div className={styles.summaryTag}>✓ Area-based fair pricing · No hidden charges</div>

            <div className={styles.workerPreview}>
              <div className={styles.workerAvatar}>P</div>
              <div className={styles.workerInfo}>
                <div className={styles.wn}>Priya Devi</div>
                <div className={styles.wr}>⭐ 4.9 · 312 services</div>
                <div className={styles.wv}>✓ Background verified</div>
              </div>
            </div>

            <div className={styles.trustList}>
              <div className={styles.trustItem}>Backup worker guarantee</div>
              <div className={styles.trustItem}>Company equipment provided</div>
              <div className={styles.trustItem}>Free cancellation up to 2hrs</div>
              <div className={styles.trustItem}>Razorpay secure payment</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
