// =========================================================
// TGV Worldwide Holidays - site interactions
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Graceful fallback for unavailable travel photos ---------- */
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.fallbackApplied || image.src.includes('tgv-logo.jpeg')) return;
      image.dataset.fallbackApplied = 'true';
      image.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
    });
  });

  /* ---------- Cinematic opening (homepage only) ---------- */
  const cinematicIntro = document.getElementById('cinematicIntro');
  if (cinematicIntro) {
    document.body.classList.add('intro-playing');
    window.setTimeout(() => {
      document.body.classList.remove('intro-playing');
      cinematicIntro.remove();
    }, 3400);
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav after clicking a link
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Back to top button ---------- */
  const backToTop = document.getElementById('backToTop');

  const toggleBackToTop = () => {
    if (!backToTop) return;
    if (window.scrollY > 480) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = document.querySelector('.site-header');
  const toggleHeaderShadow = () => {
    if (!header) return;
    if (window.scrollY > 12) {
      header.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.35)';
    } else {
      header.style.boxShadow = 'none';
    }
  };
  window.addEventListener('scroll', toggleHeaderShadow, { passive: true });
  toggleHeaderShadow();

  /* ---------- Gentle section entrance motion ---------- */
  const revealItems = document.querySelectorAll(
    '.section-head-row, .section > .section-inner > .eyebrow, .section > .section-inner > .section-title, .exp-card, .dest-card, .diff-card, .route-stop, .testimonial-card, .package-card, .moments-grid img, .contact-info, .contact-form'
  );

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    revealItems.forEach((item, index) => {
      item.classList.add('reveal');
      item.style.transitionDelay = `${Math.min(index % 6, 3) * 70}ms`;
      revealObserver.observe(item);
    });
  }

  /* ---------- Search form (Plan My Journey) ---------- */
  const searchForm = document.getElementById('searchForm');

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const destination = document.getElementById('destinationInput').value.trim();
      const dates = document.getElementById('travelDates').value.trim();
      const guests = document.getElementById('guestsSelect').value;
      const style = document.getElementById('travelStyle').value;

      // Pre-fill the contact form with the search details
      const destInterest = document.getElementById('destInterest');
      const messageBox = document.getElementById('messageBox');

      if (destInterest) {
        const optionExists = Array.from(destInterest.options)
          .some(opt => opt.value.toLowerCase() === destination.toLowerCase());
        if (optionExists) {
          destInterest.value = destination;
        }
      }

      if (messageBox) {
        const parts = [];
        if (destination) parts.push(`Destination: ${destination}`);
        if (dates) parts.push(`Travel dates: ${dates}`);
        if (guests) parts.push(`Guests: ${guests}`);
        if (style) parts.push(`Travel style: ${style}`);
        messageBox.value = parts.join('\n');
      }

      // Scroll to the contact / consultation form
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const fullName = document.getElementById('fullName');
        if (fullName) {
          setTimeout(() => fullName.focus(), 600);
        }
      }
    });
  }

  /* ---------- Contact / consultation form ---------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('emailAddr').value.trim();

      if (!fullName || !email) {
        showStatus(formStatus, 'Please fill in your name and email.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showStatus(formStatus, 'Please enter a valid email address.', 'error');
        return;
      }

      // No backend is connected - this simulates a successful submission.
      showStatus(formStatus, `Thank you, ${fullName.split(' ')[0]}! Your consultation request has been received. A concierge will reach out within 24 hours.`, 'success');
      contactForm.reset();
    });
  }

  /* ---------- Payment request (demo until gateway is connected) ---------- */
  const paymentForm = document.getElementById('paymentForm');
  const paymentStatus = document.getElementById('paymentStatus');
  const paymentModal = document.getElementById('paymentModal');
  const paymentCheckout = document.getElementById('paymentCheckout');
  const paymentSuccess = document.getElementById('paymentSuccess');
  const completeDemoPayment = document.getElementById('completeDemoPayment');
  let paymentTrigger = null;

  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const reference = document.getElementById('bookingRef').value.trim();
      const name = document.getElementById('payerName').value.trim();
      const email = document.getElementById('paymentEmail').value.trim();
      const amount = Number(document.getElementById('amount').value);

      if (!reference || !name || !isValidEmail(email) || amount <= 0) {
        showStatus(paymentStatus, 'Please complete all payment details correctly.', 'error');
        return;
      }

      document.getElementById('modalBookingRef').textContent = reference;
      document.getElementById('modalPayerName').textContent = name;
      document.getElementById('modalAmount').textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
      paymentTrigger = e.submitter;
      paymentCheckout.hidden = false;
      paymentSuccess.hidden = true;
      paymentModal.hidden = false;
      document.body.classList.add('modal-open');
      paymentModal.querySelector('.payment-modal-close').focus();
    });
  }

  if (paymentModal) {
    const closePaymentModal = () => {
      paymentModal.hidden = true;
      document.body.classList.remove('modal-open');
      if (paymentTrigger) paymentTrigger.focus();
    };

    paymentModal.querySelectorAll('[data-close-payment]').forEach((button) => button.addEventListener('click', closePaymentModal));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !paymentModal.hidden) closePaymentModal();
    });

    completeDemoPayment.addEventListener('click', () => {
      completeDemoPayment.disabled = true;
      completeDemoPayment.textContent = 'Simulating payment…';
      window.setTimeout(() => {
        document.getElementById('demoReceipt').textContent = `TGV-DEMO-${Date.now().toString().slice(-6)}`;
        paymentCheckout.hidden = true;
        paymentSuccess.hidden = false;
        completeDemoPayment.disabled = false;
        completeDemoPayment.textContent = 'Pay securely — demo';
        paymentSuccess.querySelector('button').focus();
      }, 900);
    });
  }

  /* ---------- Newsletter form ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterStatus = document.getElementById('newsletterStatus');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!isValidEmail(email)) {
        showStatus(newsletterStatus, 'Please enter a valid email address.', 'error');
        return;
      }

      showStatus(newsletterStatus, 'Subscribed! Watch your inbox for exclusive offers.', 'success');
      newsletterForm.reset();
    });
  }

  /* ---------- Helpers ---------- */
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('success', 'error');
    el.classList.add(type);
  }

});
