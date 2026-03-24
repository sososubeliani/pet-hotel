/* =============================================
   PAWFECT STAY — JAVASCRIPT
   =============================================
   1. initNavbar       — sticky shadow + hamburger toggle
   2. initSmoothScroll — anchor link smooth scrolling
   3. initGalleryLightbox — gallery photo lightbox
   4. initTestimonialSlider — mobile reviews carousel
   5. initFormValidation  — booking form validation
   6. initScrollAnimations — IntersectionObserver fade-ins
   ============================================= */

(function () {
  'use strict';

  // ---- 1. Navbar ----
  function initNavbar() {
    var navbar     = document.getElementById('navbar');
    var hamburger  = document.getElementById('hamburger');
    var navMenu    = document.getElementById('navMenu');

    if (!navbar || !hamburger || !navMenu) return;

    // Sticky shadow on scroll
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        navbar.classList.add('navbar--scrolled');
      } else {
        navbar.classList.remove('navbar--scrolled');
      }
    }, { passive: true });

    // Hamburger toggle
    hamburger.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('navbar__nav--open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when a nav link is clicked
    var navLinks = navMenu.querySelectorAll('.navbar__link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('navbar__nav--open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }


  // ---- 2. Smooth Scroll ----
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        var navbarHeight = document.getElementById('navbar')
          ? document.getElementById('navbar').offsetHeight
          : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }


  // ---- 3. Gallery Lightbox ----
  function initGalleryLightbox() {
    var lightbox = document.getElementById('lightbox');
    var closeBtn = document.getElementById('lightboxClose');
    var content  = document.getElementById('lightboxContent');

    if (!lightbox || !content) return;

    function openLightbox(index) {
      var items = document.querySelectorAll('.gallery__item');
      var item  = items[index];
      if (!item) return;

      var realImg = item.querySelector('.gallery__img--real');
      if (realImg) {
        content.style.background = '';
        content.innerHTML = '<img src="' + realImg.src + '" alt="' + realImg.alt + '" style="max-width:100%;max-height:80vh;border-radius:12px;display:block;" />';
      } else {
        var img = item.querySelector('.gallery__img');
        content.innerHTML = '';
        content.style.background = img ? img.style.background : '';
        var span = img ? img.querySelector('span') : null;
        content.textContent = span ? span.textContent : '';
      }

      lightbox.classList.add('lightbox--active');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--active');
      document.body.style.overflow = '';
    }

    function attachItemListeners() {
      document.querySelectorAll('.gallery__item').forEach(function (item) {
        item.addEventListener('click', function () {
          openLightbox(parseInt(item.dataset.index, 10));
        });
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(parseInt(item.dataset.index, 10));
          }
        });
      });
    }

    attachItemListeners();
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });

    // Expose so gallery.html can re-attach after dynamic render
    window.initGallery = attachItemListeners;
  }


  // ---- 4. Testimonial Slider ----
  function initTestimonialSlider() {
    var track    = document.getElementById('reviewsTrack');
    var prevBtn  = document.getElementById('prevReview');
    var nextBtn  = document.getElementById('nextReview');
    var dots     = document.querySelectorAll('.reviews__dot');
    var controls = document.getElementById('reviewsControls');

    if (!track || !prevBtn || !nextBtn) return;

    var total   = track.children.length;
    var current = 0;

    function goTo(index) {
      current = (index + total) % total;
      // Only slide on mobile (controls are shown via CSS at ≤768px)
      if (window.innerWidth <= 768) {
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
      } else {
        track.style.transform = '';
      }
      dots.forEach(function (dot, i) {
        dot.classList.toggle('reviews__dot--active', i === current);
      });
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.dataset.index, 10));
      });
    });

    // Reset transform on resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        track.style.transform = '';
      } else {
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
      }
    }, { passive: true });
  }


  // ---- 5. Form Validation ----
  function initFormValidation() {
    var form    = document.getElementById('bookingForm');
    var success = document.getElementById('bookingSuccess');

    if (!form || !success) return;

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showError(fieldId, msg) {
      var field = document.getElementById(fieldId);
      var error = document.getElementById(fieldId + '-error');
      if (field)  field.classList.add('error');
      if (error)  error.textContent = msg;
    }

    function clearError(fieldId) {
      var field = document.getElementById(fieldId);
      var error = document.getElementById(fieldId + '-error');
      if (field)  field.classList.remove('error');
      if (error)  error.textContent = '';
    }

    // Live clear on input
    var fields = ['fullName', 'email', 'petName', 'petType', 'checkin', 'checkout'];
    fields.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () { clearError(id); });
        el.addEventListener('change', function () { clearError(id); });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      // Clear all
      fields.forEach(function (id) { clearError(id); });

      var fullName = document.getElementById('fullName');
      var email    = document.getElementById('email');
      var petName  = document.getElementById('petName');
      var petType  = document.getElementById('petType');
      var checkin  = document.getElementById('checkin');
      var checkout = document.getElementById('checkout');

      if (!fullName.value.trim()) {
        showError('fullName', 'Please enter your full name.');
        valid = false;
      }

      if (!email.value.trim()) {
        showError('email', 'Please enter your email address.');
        valid = false;
      } else if (!EMAIL_RE.test(email.value.trim())) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      }

      if (!petName.value.trim()) {
        showError('petName', "Please enter your pet's name.");
        valid = false;
      }

      if (!petType.value) {
        showError('petType', 'Please select a pet type.');
        valid = false;
      }

      if (!checkin.value) {
        showError('checkin', 'Please select a check-in date.');
        valid = false;
      }

      if (!checkout.value) {
        showError('checkout', 'Please select a check-out date.');
        valid = false;
      } else if (checkin.value && checkout.value <= checkin.value) {
        showError('checkout', 'Check-out must be after check-in.');
        valid = false;
      }

      if (valid) {
        // Save reservation to localStorage
        var reservation = {
          id:          Date.now(),
          submittedAt: new Date().toISOString(),
          fullName:    fullName.value.trim(),
          email:       email.value.trim(),
          phone:       document.getElementById('phone').value.trim(),
          petName:     petName.value.trim(),
          petType:     petType.value,
          checkin:     checkin.value,
          checkout:    checkout.value,
          message:     document.getElementById('message').value.trim(),
          status:      'pending'
        };
        var existing = JSON.parse(localStorage.getItem('ts_reservations') || '[]');
        existing.push(reservation);
        localStorage.setItem('ts_reservations', JSON.stringify(existing));

        form.hidden = true;
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Scroll to first error
        var firstError = form.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
    });
  }


  // ---- 6. Scroll Animations ----
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all immediately
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(function (el) { observer.observe(el); });
  }


  // ---- 7. Language Toggle ----
  function initLanguageToggle() {
    var btn  = document.getElementById('langToggle');
    if (!btn) return;
    var lang = localStorage.getItem('ts_lang') || 'ka';

    function applyLang(l) {
      // Text content
      document.querySelectorAll('[data-en][data-ka]').forEach(function (el) {
        // Skip elements whose children also have translations (avoid double-swap)
        el.childNodes.forEach(function (node) {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
            // handled below via textContent
          }
        });
        // Only update leaf-level or single-text elements
        var hasTranslatedChildren = el.querySelector('[data-en]');
        if (!hasTranslatedChildren) {
          el.textContent = l === 'en' ? el.dataset.en : el.dataset.ka;
        }
      });
      // Placeholders
      document.querySelectorAll('[data-ph-en][data-ph-ka]').forEach(function (el) {
        el.placeholder = l === 'en' ? el.dataset.phEn : el.dataset.phKa;
      });
      // Select options
      document.querySelectorAll('option[data-en][data-ka]').forEach(function (el) {
        el.textContent = l === 'en' ? el.dataset.en : el.dataset.ka;
      });
      btn.textContent = l === 'en' ? 'ქარ' : 'ENG';
      document.documentElement.lang = l === 'en' ? 'en' : 'ka';
    }

    applyLang(lang);

    btn.addEventListener('click', function () {
      lang = lang === 'en' ? 'ka' : 'en';
      localStorage.setItem('ts_lang', lang);
      applyLang(lang);
    });
  }

  // ---- Boot ----
  initNavbar();
  initSmoothScroll();
  initGalleryLightbox();
  initTestimonialSlider();
  initFormValidation();
  initScrollAnimations();
  initLanguageToggle();

})();
