'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  // Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Quick Book State
  const [quickSvc, setQuickSvc] = useState('daily')
  const [quickSize, setQuickSize] = useState('500')
  const [price, setPrice] = useState('₹ 349')

  // Modal State
  const [modalSvc, setModalSvc] = useState('daily')
  const [modalSize, setModalSize] = useState('500')
  const [modalPrice, setModalPrice] = useState('₹ 349')
  
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const prices = {
    daily:   {500: 299, 1000: 399, 1500: 499, 2500: 699, 3500: 899},
    deep:    {500: 799, 1000: 1199, 1500: 1599, 2500: 2199, 3500: 2799},
    kitchen: {500: 399, 1000: 499, 1500: 699, 2500: 899, 3500: 1099},
    laundry: {500: 199, 1000: 299, 1500: 399, 2500: 499, 3500: 599},
    pest:    {500: 799, 1000: 999, 1500: 1299, 2500: 1699, 3500: 2199},
  }

  // Calculate Quick Book Price
  useEffect(() => {
    const priceMap = prices[quickSvc as keyof typeof prices]
    const sizeNum = parseInt(quickSize)
    const validSizes = [500, 1000, 1500, 2500, 3500]
    const closestSize = validSizes.find(s => sizeNum <= s) || 3500
    setPrice('₹ ' + priceMap[closestSize as keyof typeof priceMap].toLocaleString('en-IN'))
  }, [quickSvc, quickSize])

  // Calculate Modal Price
  useEffect(() => {
    const priceMap = prices[modalSvc as keyof typeof prices]
    const sizeNum = parseInt(modalSize)
    const validSizes = [500, 1000, 1500, 2500, 3500]
    const closestSize = validSizes.find(s => sizeNum <= s) || 3500
    setModalPrice('₹ ' + priceMap[closestSize as keyof typeof priceMap].toLocaleString('en-IN'))
  }, [modalSvc, modalSize])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const dateInput = document.getElementById('quick-date') as HTMLInputElement
    if (dateInput) {
      dateInput.min = today
      dateInput.value = today
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { 
        if(e.isIntersecting) e.target.classList.add('visible'); 
      });
    }, {threshold: 0.12});

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }, [])

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  const confirmBooking = () => {
    setShowModal(false);
    showToastMessage('Booking confirmed! You\'ll receive a call within 30 minutes. ✓');
  }

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false); // Close menu on click
    document.getElementById(sectionId)?.scrollIntoView({behavior:'smooth'});
  }

  return (
    <>
      <nav>
        <div className="logo">Basic<span>Jobs</span></div>
        
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><button onClick={() => scrollToSection('services')} className="nav-text-btn">Services</button></li>
          <li><button onClick={() => scrollToSection('how-it-works')} className="nav-text-btn">How It Works</button></li>
          <li><button onClick={() => scrollToSection('pricing')} className="nav-text-btn">Pricing</button></li>
          <li><button onClick={() => scrollToSection('why')} className="nav-text-btn">Why Us</button></li>
          <li><button onClick={() => scrollToSection('worker')} className="nav-text-btn">For Workers</button></li>
          <li className="mobile-only">
             <Link href="/bookings"><button className="nav-cta" style={{width: '100%'}}>Book Now</button></Link>
          </li>
        </ul>

        <div className="desktop-only">
          <Link href="/bookings">
            <button className="nav-cta">Book Now</button>
          </Link>
        </div>
      </nav>

      <section id="hero">
        <div className="hero-left fade-in">
          <div className="hero-badge">Live in Delhi, Mumbai & Bangalore</div>
          <h1>India's Most <em>Reliable</em> Home Services Platform</h1>
          <p className="hero-sub">Stop chasing maids. Start using a system. Verified workers, area-based pricing, and instant backup — so your home stays clean, always.</p>
          <div className="hero-actions">
            <Link href="/bookings">
              <button className="btn-primary">📅 Book a Service</button>
            </Link>
            <button className="btn-outline" onClick={() => scrollToSection('how-it-works')}>How It Works →</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><div className="number">12K+</div><div className="label">Happy Homes</div></div>
            <div className="stat-item"><div className="number">800+</div><div className="label">Verified Workers</div></div>
            <div className="stat-item"><div className="number">98%</div><div className="label">On-time Rate</div></div>
            <div className="stat-item"><div className="number">4.8★</div><div className="label">Avg. Rating</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="booking-card fade-in">
            <h3>⚡ Quick Book</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Service Type</label>
                <select value={quickSvc} onChange={(e) => setQuickSvc(e.target.value)}>
                  <option value="daily">Daily Cleaning</option>
                  <option value="deep">Deep Cleaning</option>
                  <option value="kitchen">Kitchen Cleaning</option>
                  <option value="laundry">Laundry Service</option>
                </select>
              </div>
              <div className="form-group">
                <label>Home Size (sq ft)</label>
                <select value={quickSize} onChange={(e) => setQuickSize(e.target.value)}>
                  <option value="500">Up to 500</option>
                  <option value="1000">500–1000</option>
                  <option value="1500">1000–1500</option>
                  <option value="2500">1500–2500</option>
                  <option value="3500">2500+</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" id="quick-date" />
              </div>
              <div className="form-group">
                <label>Time</label>
                <select>
                  <option>8:00 AM</option><option>9:00 AM</option>
                  <option>10:00 AM</option><option>11:00 AM</option>
                  <option>2:00 PM</option><option>3:00 PM</option>
                </select>
              </div>
            </div>
            <div className="price-preview">
              <span className="price-label">Estimated Price</span>
              <span className="price-amount">{price}</span>
            </div>
            <Link href="/bookings">
              <button className="book-btn">Book This Slot →</button>
            </Link>
          </div>
          <div className="trust-badges">
            <div className="badge"><div className="badge-icon">🛡️</div><div className="badge-text">Background Verified</div></div>
            <div className="badge"><div className="badge-icon">🔁</div><div className="badge-text">Backup Guaranteed</div></div>
            <div className="badge"><div className="badge-icon">📐</div><div className="badge-text">Area-based Pricing</div></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div style={{textAlign:'center', maxWidth:'600px', margin:'0 auto 0'}}>
          <span className="section-tag">The Process</span>
          <h2 className="section-title">Simple, Transparent, <em style={{color:'var(--saffron)',fontStyle:'normal'}}>Reliable</em></h2>
          <p className="section-sub" style={{margin:'0 auto'}}>No phone calls. No negotiations. Just reliable home services, every time.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card fade-in">
            <div className="step-number">01</div>
            <div className="step-icon">📐</div>
            <h4>Enter Your Details</h4>
            <p>Tell us your home size, preferred service, and schedule. Our area-based pricing is instantly calculated — no surprises.</p>
          </div>
          <div className="step-card fade-in">
            <div className="step-number">02</div>
            <div className="step-icon">👷</div>
            <h4>We Assign a Worker</h4>
            <p>A trained, background-verified local worker is assigned to your booking within minutes.</p>
          </div>
          <div className="step-card fade-in">
            <div className="step-number">03</div>
            <div className="step-icon">🏠</div>
            <h4>Service Delivered</h4>
            <p>Your worker arrives on time with company-provided equipment. You don't need to arrange anything.</p>
          </div>
          <div className="step-card fade-in">
            <div className="step-number">04</div>
            <div className="step-icon">⭐</div>
            <h4>Rate & Repeat</h4>
            <p>Rate your experience. Subscribe for priority access and exclusive discounts on future bookings.</p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="services-header">
          <div>
            <span className="section-tag">What We Offer</span>
            <h2 className="section-title">All Your Home Services,<br/>One Platform</h2>
          </div>
          <Link href="/bookings">
            <button className="btn-outline">Book Any Service →</button>
          </Link>
        </div>
        <div className="services-grid">
          <div className="service-card fade-in" onClick={() => window.location.href='/bookings'}>
            <div className="popular-tag">POPULAR</div>
            <div className="service-emoji">🧹</div>
            <h4>Daily Cleaning</h4>
            <p>Regular sweeping, mopping, and dusting. Consistent workers assigned to your home on your chosen schedule.</p>
            <div className="service-price">From ₹ 299/visit</div>
          </div>
          <div className="service-card fade-in" onClick={() => window.location.href='/bookings'}>
            <div className="service-emoji">🫧</div>
            <h4>Deep Cleaning</h4>
            <p>Complete top-to-bottom cleaning including inside cabinets, appliances, tiles, and hard-to-reach areas.</p>
            <div className="service-price">From ₹ 999/session</div>
          </div>
          <div className="service-card fade-in" onClick={() => window.location.href='/bookings'}>
            <div className="service-emoji">🍳</div>
            <h4>Kitchen Cleaning</h4>
            <p>Degreasing, appliance cleaning, shelf and countertop sanitization. Leave your kitchen sparkling.</p>
            <div className="service-price">From ₹ 499/session</div>
          </div>
          <div className="service-card fade-in" onClick={() => window.location.href='/bookings'}>
            <div className="service-emoji">👕</div>
            <h4>Laundry Service</h4>
            <p>Wash, dry, fold and arrange your clothes. Available as standalone or add-on to your regular cleaning.</p>
            <div className="service-price">From ₹ 199/load</div>
          </div>
          <div className="service-card fade-in" onClick={() => window.location.href='/bookings'}>
            <div className="service-emoji">🐜</div>
            <h4>Pest Control</h4>
            <p>Safe, certified pest treatment for cockroaches, ants, mosquitoes, and more. Safe for families & pets.</p>
            <div className="service-price">From ₹ 799/treatment</div>
          </div>
          <div className="service-card fade-in" onClick={() => window.location.href='/bookings'}>
            <div className="service-emoji">🏢</div>
            <h4>Society Contracts</h4>
            <p>Monthly agreements with RWAs and housing societies. Dedicated team, bulk pricing, and priority support.</p>
            <div className="service-price">Custom Pricing</div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="pricing-intro fade-in">
          <span className="section-tag">Transparent Pricing</span>
          <h2 className="section-title">Area-Based. Fair.<br/><em style={{color:'var(--saffron)',fontStyle:'normal'}}>No Hidden Costs.</em></h2>
          <p className="section-sub">We charge based on your home's size — not a flat rate. Bigger home? Slightly more. Small flat? You save. Finally, pricing that makes sense.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card fade-in">
            <div className="pricing-tier">Studio / 1BHK</div>
            <div className="pricing-size">Up to 800 sq ft</div>
            <div className="pricing-amount">₹299</div>
            <div className="pricing-freq">per daily cleaning visit</div>
            <ul className="pricing-features">
              <li>Sweeping & mopping all rooms</li>
              <li>Kitchen & bathroom wipe-down</li>
              <li>Trash removal</li>
              <li>Company equipment included</li>
              <li>Backup worker guarantee</li>
            </ul>
            <button className="pricing-btn" onClick={() => window.location.href='/bookings'}>Get Started</button>
          </div>
          <div className="pricing-card featured fade-in">
            <div className="featured-label">MOST POPULAR</div>
            <div className="pricing-tier">2BHK / 3BHK</div>
            <div className="pricing-size">800–1500 sq ft</div>
            <div className="pricing-amount">₹499</div>
            <div className="pricing-freq">per daily cleaning visit</div>
            <ul className="pricing-features">
              <li>Full home sweep & mop</li>
              <li>2 bathrooms + kitchen</li>
              <li>Balcony cleaning</li>
              <li>Company equipment included</li>
              <li>Backup worker guarantee</li>
              <li>Priority scheduling</li>
            </ul>
            <button className="pricing-btn" onClick={() => window.location.href='/bookings'}>Book Now</button>
          </div>
          <div className="pricing-card fade-in">
            <div className="pricing-tier">4BHK / Villa</div>
            <div className="pricing-size">1500+ sq ft</div>
            <div className="pricing-amount">₹799</div>
            <div className="pricing-freq">per daily cleaning visit</div>
            <ul className="pricing-features">
              <li>Full home sweep & mop</li>
              <li>3+ bathrooms & kitchen</li>
              <li>All balconies & utility area</li>
              <li>Company equipment included</li>
              <li>Dedicated worker assigned</li>
              <li>Priority scheduling</li>
            </ul>
            <button className="pricing-btn" onClick={() => window.location.href='/bookings'}>Get Started</button>
          </div>
        </div>
        <p style={{textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:'0.8rem', marginTop:'20px'}}>Monthly subscription discounts available. Society contracts start at ₹4,999/month.</p>
      </section>

      {/* WHY BASIC JOBS */}
      <section id="why">
        <div className="fade-in">
          <span className="section-tag">Why Choose Us</span>
          <h2 className="section-title">We Build <em style={{color:'var(--saffron)',fontStyle:'normal'}}>Systems</em>,<br/>Not Marketplaces</h2>
          <p className="section-sub">Other apps connect you to random gig workers. We build organized workforce teams you can rely on, day after day.</p>
          <div style={{marginTop:'30px', display:'flex', flexDirection:'column', gap:'12px'}}>
            <div className="perk">
              <div className="perk-icon">🎯</div>
              <div><h5>System-First Model</h5><p>No dependency on one worker. If they're absent, a trained backup arrives automatically.</p></div>
            </div>
            <div className="perk">
              <div className="perk-icon">🛡️</div>
              <div><h5>100% Verified Workers</h5><p>Every worker goes through police verification, training, and ongoing performance reviews.</p></div>
            </div>
            <div className="perk">
              <div className="perk-icon">📦</div>
              <div><h5>Equipment Provided</h5><p>We supply all cleaning materials. You don't have to buy, store, or manage anything.</p></div>
            </div>
          </div>
        </div>
        <div className="fade-in">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Basic Jobs</th>
                <th style={{color:'rgba(255,255,255,0.4)'}}>Others</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Area-based pricing</td><td className="check">✓ Yes</td><td className="cross">✗ Flat</td></tr>
              <tr><td>Backup guarantee</td><td className="check">✓ Always</td><td className="cross">✗ No</td></tr>
              <tr><td>Background checks</td><td className="check">✓ 100%</td><td className="cross">✗ Partial</td></tr>
              <tr><td>Equipment provided</td><td className="check">✓ Included</td><td className="cross">✗ Customer pays</td></tr>
              <tr><td>Trained workforce</td><td className="check">✓ Certified</td><td className="cross">✗ Unverified</td></tr>
              <tr><td>Society contracts</td><td className="check">✓ Available</td><td className="cross">✗ No</td></tr>
              <tr><td>Government readiness</td><td className="check">✓ Scaling</td><td className="cross">✗ No</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div style={{textAlign:'center', maxWidth:'540px', margin:'0 auto'}}>
          <span className="section-tag">Real Reviews</span>
          <h2 className="section-title">Loved by Families<br/>Across India</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card fade-in">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"Finally a service I can actually rely on! My regular worker was on leave and a replacement showed up without me even calling. That's what I was always missing."</p>
            <div className="reviewer">
              <div className="reviewer-avatar">P</div>
              <div><div className="reviewer-name">Priya Sharma</div><div className="reviewer-loc">Gurgaon, Delhi NCR</div></div>
            </div>
          </div>
          <div className="testimonial-card fade-in">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"The area-based pricing is such a smart idea. I have a small 1BHK and used to pay the same as my neighbor with a 3BHK. Now I pay ₹299 and she pays ₹499. Makes total sense!"</p>
            <div className="reviewer">
              <div className="reviewer-avatar">R</div>
              <div><div className="reviewer-name">Rahul Mehta</div><div className="reviewer-loc">Andheri, Mumbai</div></div>
            </div>
          </div>
          <div className="testimonial-card fade-in">
            <div className="stars">★★★★☆</div>
            <p className="testimonial-text">"Our housing society switched to Basic Jobs for common area cleaning. The team is professional, on time every single day, and the monthly contract pricing is very competitive."</p>
            <div className="reviewer">
              <div className="reviewer-avatar">S</div>
              <div><div className="reviewer-name">Sunita Reddy</div><div className="reviewer-loc">Whitefield, Bangalore</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKER CTA */}
      <section id="worker">
        <div className="fade-in">
          <span className="section-tag">Join Our Team</span>
          <h2 className="section-title">Work With Us.<br/><em style={{color:'var(--saffron)',fontStyle:'normal'}}>Earn More. Grow More.</em></h2>
          <p className="section-sub">We offer stable income, training, and a career path — not just gig work. Join 800+ workers already earning with Basic Jobs.</p>
          <div className="worker-perks">
            <div className="perk">
              <div className="perk-icon">💰</div>
              <div><h5>Guaranteed Weekly Pay</h5><p>₹12,000–₹22,000/month depending on experience and hours.</p></div>
            </div>
            <div className="perk">
              <div className="perk-icon">📚</div>
              <div><h5>Free Skill Training</h5><p>Learn cleaning techniques, safety standards, and professional conduct.</p></div>
            </div>
            <div className="perk">
              <div className="perk-icon">🏆</div>
              <div><h5>Performance Bonuses</h5><p>Top-rated workers earn monthly bonuses and get priority assignments.</p></div>
            </div>
          </div>
        </div>
        <div className="worker-form-card fade-in">
          <h3>🙋 Apply to Join Our Team</h3>
          <div className="wf-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your full name" />
          </div>
          <div className="wf-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="wf-group">
            <label>City</label>
            <select>
              <option>Delhi / NCR</option>
              <option>Mumbai</option>
              <option>Bangalore</option>
              <option>Hyderabad</option>
              <option>Pune</option>
            </select>
          </div>
          <div className="wf-group">
            <label>Experience</label>
            <select>
              <option>No experience (will train)</option>
              <option>Less than 1 year</option>
              <option>1–3 years</option>
              <option>3+ years</option>
            </select>
          </div>
          <button className="btn-primary" style={{width:'100%', justifyContent:'center', marginTop:'6px'}} onClick={() => showToastMessage('Application submitted! We will call you within 24 hours. 🎉')}>Submit Application →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo">Basic<span>Jobs</span></div>
            <p className="footer-about">India's most reliable home services platform. We build systems that ensure your home is always clean — with or without your usual worker.</p>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              <li><a href="#">Daily Cleaning</a></li>
              <li><a href="#">Deep Cleaning</a></li>
              <li><a href="#">Kitchen Cleaning</a></li>
              <li><a href="#">Laundry</a></li>
              <li><a href="#">Pest Control</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Safety Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p> 2025 Basic Jobs. All rights reserved. Built for urban India. 🇮🇳</p>
          <div className="social-links">
            <a href="#">𝕏</a>
            <a href="#">in</a>
            <a href="#">f</a>
            <a href="#">▶</a>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-title">📅 Book a Service</div>
            <div className="modal-sub">Fill in your details and we'll confirm within 30 minutes.</div>
            <div className="wf-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your name" />
            </div>
            <div className="wf-group">
              <label>Phone</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="wf-group">
              <label>Address / Society Name</label>
              <input type="text" placeholder="Your home address" />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div className="wf-group">
                <label>Service</label>
                <select value={modalSvc} onChange={(e) => setModalSvc(e.target.value)}>
                  <option value="daily">Daily Cleaning</option>
                  <option value="deep">Deep Cleaning</option>
                  <option value="kitchen">Kitchen Cleaning</option>
                  <option value="laundry">Laundry</option>
                  <option value="pest">Pest Control</option>
                </select>
              </div>
              <div className="wf-group">
                <label>Home Size</label>
                <select value={modalSize} onChange={(e) => setModalSize(e.target.value)}>
                  <option value="500">Up to 500 sq ft</option>
                  <option value="1000">500–1000 sq ft</option>
                  <option value="1500">1000–1500 sq ft</option>
                  <option value="2500">1500–2500 sq ft</option>
                </select>
              </div>
            </div>
            <div className="price-preview" style={{marginTop:'4px'}}>
              <span className="price-label">Estimated Price</span>
              <span className="price-amount">{modalPrice}</span>
            </div>
            <button className="btn-primary" style={{width:'100%', justifyContent:'center', marginTop:'4px'}} onClick={confirmBooking}>Confirm Booking ✓</button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div className={`toast ${showToast ? 'show' : ''}`}>
          ✓ <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}
