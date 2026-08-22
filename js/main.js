(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const progressBar = document.querySelector(".scroll-progress span");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const mobileCta = document.querySelector(".mobile-cta");
  const backToTop = document.querySelector("[data-back-to-top]");
  const emailToast = document.querySelector("[data-email-toast]");
  const emailToastText = document.querySelector("[data-email-toast-text]");
  const contactHub = document.querySelector("[data-contact-hub]");
  const applySection = document.querySelector("#apply");
  const contactContext = document.querySelector("[data-contact-context]");
  const telegramContact = document.querySelector("[data-telegram-contact]");
  const emailContact = document.querySelector("[data-email-contact]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateScrollUi = () => {
    const scrollTop = window.scrollY;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (header) header.classList.toggle("is-scrolled", scrollTop > 18);
    if (progressBar) progressBar.style.width = `${Math.min((scrollTop / maxScroll) * 100, 100)}%`;
    if (backToTop) {
      const shouldShow = scrollTop > Math.max(window.innerHeight, 800);
      backToTop.classList.toggle("is-visible", shouldShow);
      backToTop.setAttribute("aria-hidden", String(!shouldShow));
      backToTop.tabIndex = shouldShow ? 0 : -1;
    }
  };

  let scrollFrame = null;
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      updateScrollUi();
      scrollFrame = null;
    });
  }, { passive: true });
  updateScrollUi();

  const closeMenu = (restoreFocus = false) => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Открыть меню";
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (restoreFocus) menuToggle.focus();
  };

  const openMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.querySelector(".sr-only").textContent = "Закрыть меню";
    nav.classList.add("is-open");
    document.body.classList.add("menu-open");
    const firstLink = nav.querySelector("a");
    if (firstLink) firstLink.focus();
  };

  if (menuToggle && nav) {
    document.documentElement.classList.add("nav-ready");
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) closeMenu(true);
      if (event.key !== "Tab" || !nav.classList.contains("is-open")) return;
      const focusable = [menuToggle, ...nav.querySelectorAll("a")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const revealElements = [...document.querySelectorAll("[data-reveal]")];
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -45px" });
    document.documentElement.classList.add("motion-ready");
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const worldToggles = [...document.querySelectorAll(".world-toggle")];
  if (worldToggles.length) document.documentElement.classList.add("interaction-ready");
  worldToggles.forEach((button) => {
    const answer = button.closest(".world-card")?.querySelector(".world-answer");
    if (answer) answer.setAttribute("aria-hidden", "true");
    button.addEventListener("click", () => {
      const card = button.closest(".world-card");
      const isOpen = card.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      if (answer) answer.setAttribute("aria-hidden", String(!isOpen));
      button.firstChild.textContent = isOpen ? "Скрыть объяснение " : "Показать объяснение ";
    });
  });

  const faqItems = [...document.querySelectorAll(".faq-list details")];
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  const slides = [...document.querySelectorAll("[data-slide]")];
  const sliderTrack = document.querySelector("[data-slider-track]");
  const slider = document.querySelector("[data-slider]");
  const prevButton = document.querySelector("[data-slide-prev]");
  const nextButton = document.querySelector("[data-slide-next]");
  const sliderControls = document.querySelector("[data-slider-controls]");
  const currentOutput = document.querySelector("[data-slide-current]");
  const totalOutput = document.querySelector("[data-slide-total]");
  let currentSlide = 0;
  let touchStartX = 0;

  const showSlide = (index) => {
    if (!slides.length || !sliderTrack) return;
    currentSlide = (index + slides.length) % slides.length;
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    if (currentOutput) currentOutput.textContent = String(currentSlide + 1);
  };

  if (totalOutput) totalOutput.textContent = String(slides.length || 1);
  if (sliderControls && slides.length < 2) sliderControls.hidden = true;
  if (slider && slides.length < 2) slider.removeAttribute("tabindex");
  if (prevButton) {
    prevButton.disabled = slides.length < 2;
    prevButton.addEventListener("click", () => showSlide(currentSlide - 1));
  }
  if (nextButton) {
    nextButton.disabled = slides.length < 2;
    nextButton.addEventListener("click", () => showSlide(currentSlide + 1));
  }
  if (slider) {
    slider.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showSlide(currentSlide - 1);
      if (event.key === "ArrowRight") showSlide(currentSlide + 1);
    });
    slider.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener("touchend", (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) < 50) return;
      showSlide(currentSlide + (distance < 0 ? 1 : -1));
    }, { passive: true });
  }
  showSlide(0);

  const scrollToApplication = (event) => {
    if (window.innerWidth > 680 || !contactHub) return;
    event.preventDefault();
    contactHub.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };

  const updateContactTopic = (topic = "") => {
    const topicSuffix = topic ? ` по направлению «${topic}»` : "";
    const message = `Здравствуйте, Марина Борисовна! Хочу узнать о занятиях по физике${topicSuffix}. Класс ученика: `;
    const subject = topic ? `Вопрос о занятиях — ${topic}` : "Вопрос о занятиях по физике";

    if (contactContext) {
      contactContext.hidden = !topic;
      contactContext.textContent = topic ? `Интересует: ${topic}` : "";
    }
    if (telegramContact) {
      telegramContact.href = `https://t.me/+79197448522?text=${encodeURIComponent(message)}`;
    }
    if (emailContact) {
      const body = `${message}\nЧто сейчас вызывает сложности: `;
      emailContact.href = `mailto:marina.dvd.2014@yandex.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  document.querySelectorAll("[data-email-program]").forEach((link) => {
    const topic = link.dataset.emailProgram || "занятия по физике";
    const subject = `Занятия по физике — ${topic}`;
    const body = `Здравствуйте, Марина Борисовна!\n\nХочу узнать о занятиях: ${topic}.\nКласс ученика: \nЧто сейчас вызывает сложности: `;
    link.href = `mailto:marina.dvd.2014@yandex.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  document.querySelectorAll("[data-cta]").forEach((link) => {
    link.addEventListener("click", (event) => {
      updateContactTopic();
      scrollToApplication(event);
    });
  });

  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    if (!copied) throw new Error("copy-failed");
  };

  let emailToastTimer = null;
  const showEmailToast = (message) => {
    if (!emailToast) return;
    if (emailToastText) emailToastText.textContent = message;
    emailToast.classList.add("is-visible");
    emailToast.setAttribute("aria-hidden", "false");
    window.clearTimeout(emailToastTimer);
    emailToastTimer = window.setTimeout(() => {
      emailToast.classList.remove("is-visible");
      emailToast.setAttribute("aria-hidden", "true");
    }, 4800);
  };

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const mailtoUrl = link.getAttribute("href");

      showEmailToast("Открываем почту… Адрес также копируется");
      copyText("marina.dvd.2014@yandex.ru")
        .then(() => showEmailToast("Почта скопирована: marina.dvd.2014@yandex.ru"))
        .catch(() => showEmailToast("Почта: marina.dvd.2014@yandex.ru"));

      window.setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 120);
    });
  });

  const maxContact = document.querySelector("[data-max-contact]");
  if (maxContact) {
    maxContact.addEventListener("click", async () => {
      const status = document.querySelector("[data-contact-status]");
      try {
        await copyText(maxContact.dataset.phone);
        if (status) status.textContent = "Номер скопирован. В MAX найдите контакт по номеру телефона.";
      } catch {
        if (status) status.textContent = `Найдите контакт в MAX по номеру: ${maxContact.dataset.phone}`;
      }
    });
  }

  const sections = [...document.querySelectorAll("main section[id]")];
  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -64% 0px", threshold: [0, .1, .5] });
    sections.forEach((section) => navObserver.observe(section));
  }

  if (mobileCta && applySection && "IntersectionObserver" in window) {
    const heroPrimary = document.querySelector(".hero-actions .button");
    let heroPrimaryVisible = true;
    let applySectionVisible = false;

    const updateMobileCta = () => {
      const shouldShow = !heroPrimaryVisible && !applySectionVisible;
      mobileCta.style.opacity = shouldShow ? "1" : "0";
      mobileCta.style.transform = shouldShow ? "translateY(0)" : "translateY(16px)";
      mobileCta.style.pointerEvents = shouldShow ? "auto" : "none";
    };

    if (heroPrimary) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        heroPrimaryVisible = entry.isIntersecting;
        updateMobileCta();
      }, { threshold: .15 });
      heroObserver.observe(heroPrimary);
    }

    if (applySection) {
      const applyObserver = new IntersectionObserver(([entry]) => {
        applySectionVisible = entry.isIntersecting;
        updateMobileCta();
      }, { threshold: .01 });
      applyObserver.observe(applySection);
    }

    updateMobileCta();
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
