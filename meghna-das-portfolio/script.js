// ==========================================================================
// Meghna Das — Portfolio
// Vanilla JavaScript interactions
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Dynamic copyright year
  ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------
     Mobile navigation menu
  ------------------------------------------------------------------ */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');

  function closeMenu() {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  function openMenu() {
    mainNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     Smooth scrolling for in-page links (accounts for sticky header)
  ------------------------------------------------------------------ */
  var header = document.getElementById('site-header');

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId.length < 2) return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      var headerHeight = header ? header.offsetHeight : 0;
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ------------------------------------------------------------------
     Active navigation link while scrolling
  ------------------------------------------------------------------ */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  function setActiveLink() {
    var scrollPos = window.pageYOffset + (header ? header.offsetHeight : 0) + 24;
    var currentId = sections.length ? sections[0].id : null;

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('is-active', isActive);
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ------------------------------------------------------------------
     Project filtering
  ------------------------------------------------------------------ */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll('.project-card'));
  var emptyMessage = document.getElementById('filter-empty');

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.getAttribute('data-filter');

      filterButtons.forEach(function (btn) {
        btn.classList.toggle('is-active', btn === button);
      });

      var visibleCount = 0;

      projectCards.forEach(function (card) {
        var categories = (card.getAttribute('data-category') || '').split(' ');
        var matches = filter === 'all' || categories.indexOf(filter) !== -1;
        card.classList.toggle('is-hidden', !matches);
        if (matches) visibleCount++;
      });

      if (emptyMessage) {
        emptyMessage.hidden = visibleCount !== 0;
      }
    });
  });

  /* ------------------------------------------------------------------
     3D tilt effect — cards follow the cursor for a live depth feel
  ------------------------------------------------------------------ */
  var tiltCards = Array.prototype.slice.call(document.querySelectorAll('.tilt-card'));
  var MAX_TILT = 9; // degrees

  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    tiltCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;  // 0 - 1
        var y = (e.clientY - rect.top) / rect.height;  // 0 - 1

        var ry = (x - 0.5) * (MAX_TILT * 2);
        var rx = (0.5 - y) * (MAX_TILT * 2);

        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--tz', '6px');
      });

      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--tz', '0px');
      });
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal animations (fade + rise, works alongside 3D tilt)
  ------------------------------------------------------------------ */
  var revealEls = tiltCards;

  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach(function (el) { el.classList.add('reveal-pending'); });

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Back-to-top button
  ------------------------------------------------------------------ */
  var backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.pageYOffset > 480);
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     Contact form validation (no backend — demo submission only)
  ------------------------------------------------------------------ */
  var form = document.getElementById('contact-form');
  var formStatus = document.getElementById('form-status');

  function showFieldError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    var wrapper = field ? field.closest('.form-field') : null;

    if (wrapper) wrapper.classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameField = document.getElementById('name');
      var emailField = document.getElementById('email');
      var messageField = document.getElementById('message');

      var isValid = true;

      if (!nameField.value.trim()) {
        showFieldError('name', 'Please enter your name.');
        isValid = false;
      } else {
        showFieldError('name', '');
      }

      if (!emailField.value.trim()) {
        showFieldError('email', 'Please enter your email address.');
        isValid = false;
      } else if (!isValidEmail(emailField.value.trim())) {
        showFieldError('email', 'Please enter a valid email address.');
        isValid = false;
      } else {
        showFieldError('email', '');
      }

      if (!messageField.value.trim()) {
        showFieldError('message', 'Please write a short message.');
        isValid = false;
      } else {
        showFieldError('message', '');
      }

      if (!isValid) {
        if (formStatus) {
          formStatus.textContent = 'Please fix the highlighted fields and try again.';
          formStatus.style.color = '#B23B3B';
        }
        return;
      }

      // No backend is connected to this form — this is a front-end-only demo.
      if (formStatus) {
        formStatus.style.color = '';
        formStatus.textContent = 'Thank you! This demo contact form has been submitted.';
      }

      form.reset();
    });
  }

});
