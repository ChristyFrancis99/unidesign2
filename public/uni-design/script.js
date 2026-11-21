export const CONTACT_EMAIL = "studio@example.com";
export const DESKTOP_PIN_VIEWPORTS = 4;
export const MOBILE_PIN_VIEWPORTS = 3;
const motionReadyClass = "motion-ready";

function getVideoTime(progress, duration) {
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  return normalizedProgress * duration;
}

function getVideoPinDistance(viewportHeight, isMobile) {
  const viewportCount = isMobile ? MOBILE_PIN_VIEWPORTS : DESKTOP_PIN_VIEWPORTS;
  return viewportHeight * viewportCount;
}

const reducedMotion = typeof window !== "undefined"
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : { matches: true };
const header = typeof document !== "undefined" ? document.querySelector("#site-header") : null;
const menuToggle = typeof document !== "undefined" ? document.querySelector("#menu-toggle") : null;
const navigation = typeof document !== "undefined" ? document.querySelector("#primary-nav") : null;
const walkthrough = typeof document !== "undefined" ? document.querySelector("#home") : null;
const walkthroughVideo = typeof document !== "undefined"
  ? document.querySelector("#walkthrough-video")
  : null;
const progressBar = typeof document !== "undefined"
  ? document.querySelector("#walkthrough-progress")
  : null;
const processList = typeof document !== "undefined" ? document.querySelector("#process-list") : null;

function updateHeader(scrollY) {
  if (!header) return;

  header.classList.toggle("is-solid", scrollY > 45);
  header.classList.toggle("is-hidden", scrollY > 140 && scrollY > (updateHeader.previousY ?? 0) + 3);
  if (scrollY < 100 || scrollY < (updateHeader.previousY ?? 0) - 3) {
    header.classList.remove("is-hidden");
  }

  updateHeader.previousY = scrollY;
}

function closeNavigation() {
  if (!header || !menuToggle) return;
  header.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

function setupNavigation() {
  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    header?.classList.toggle("menu-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });
}

function setupRevealAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length || reducedMotion.matches) return;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add(motionReadyClass);
    reveals.forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: "top 88%",
        once: true,
        onEnter: () => element.classList.add("is-revealed"),
      });
    });
    return;
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((element) => observer.observe(element));
  }
}

function setupHeroImageFallback() {
  const hero = document.querySelector(".hero");
  const poster = document.querySelector(".hero__poster");
  if (!hero || !poster) return;

  const markImageUnavailable = () => {
    hero.classList.add("has-image-error");
    poster.hidden = true;
  };

  poster.addEventListener("error", markImageUnavailable, { once: true });
  if (poster.complete && poster.naturalWidth === 0) markImageUnavailable();
}

function setupHeroIntro() {
  if (reducedMotion.matches || !window.gsap) return;

  const heading = document.querySelector("#hero-heading");
  const introductions = document.querySelectorAll("[data-hero-intro]");
  gsap.fromTo(
    heading,
    { opacity: 0, y: 32 },
    { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.18 },
  );
  gsap.fromTo(
    introductions,
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power2.out", delay: 0.38 },
  );
}

function setWalkthroughFallback() {
  if (!walkthrough || !walkthroughVideo) return;
  walkthrough.classList.add("is-video-failed");
  walkthrough.classList.remove("is-video-ready");
  const status = document.querySelector("#walkthrough-status");
  if (status) status.textContent = "The walkthrough film could not load. A still image is shown instead.";
}

function setupScrollDrivenVideo() {
  if (!walkthrough || !walkthroughVideo || !progressBar) return;
  const source = walkthroughVideo.querySelector("source");
  const scenes = Array.from(document.querySelectorAll("[data-video-scene]"));

  const updateStory = (progress) => {
    const hasStoryStarted = progress > 0.055;
    const storyProgress = Math.max(0, (progress - 0.055) / 0.945);
    const activeScene = Math.min(scenes.length - 1, Math.floor(storyProgress * scenes.length));
    scenes.forEach((scene, index) => {
      scene.classList.toggle("is-active", hasStoryStarted && index === activeScene);
    });
    walkthrough.classList.toggle("story-started", hasStoryStarted);
  };

  if (reducedMotion.matches) {
    walkthroughVideo.pause();
    updateStory(0);
    return;
  }

  const handleError = () => setWalkthroughFallback();
  walkthroughVideo.addEventListener("error", handleError);
  source?.addEventListener("error", handleError);
  walkthroughVideo.addEventListener("loadeddata", () => {
    walkthrough.classList.add("is-video-ready");
    walkthroughVideo.pause();
  }, { once: true });

  if (!window.gsap || !window.ScrollTrigger) {
    source?.removeAttribute("src");
    walkthroughVideo.load();
    setWalkthroughFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  let trigger;
  let requestedTime = 0;
  let animationFrame = 0;
  let currentTime = 0;

  const settleFrame = () => {
    const difference = requestedTime - currentTime;
    currentTime = Math.abs(difference) < 0.02 ? requestedTime : currentTime + difference * 0.23;
    if (Math.abs(walkthroughVideo.currentTime - currentTime) > 0.045) {
      try {
        walkthroughVideo.currentTime = currentTime;
      } catch {
        // Browser playback may not be seekable until a frame finishes decoding.
      }
    }
    animationFrame = window.requestAnimationFrame(settleFrame);
  };

  const createTrigger = () => {
    trigger?.kill();
    trigger = ScrollTrigger.create({
      trigger: walkthrough,
      start: "top top",
      end: () => `+=${getVideoPinDistance(
        window.innerHeight,
        window.matchMedia("(max-width: 768px)").matches,
      )}`,
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        requestedTime = getVideoTime(self.progress, walkthroughVideo.duration || 0);
        gsap.set(progressBar, { scaleX: self.progress });
        updateStory(self.progress);
        gsap.set(".hero__footer", {
          opacity: 1 - Math.min(0.45, self.progress * 0.45),
        });
      },
      onRefresh: (self) => {
        requestedTime = getVideoTime(self.progress, walkthroughVideo.duration || 0);
        updateStory(self.progress);
      },
    });
  };

  walkthroughVideo.addEventListener("loadedmetadata", () => {
    if (!Number.isFinite(walkthroughVideo.duration) || walkthroughVideo.duration <= 0) {
      setWalkthroughFallback();
      return;
    }
    currentTime = 0;
    requestedTime = 0;
    walkthroughVideo.pause();
    animationFrame = window.requestAnimationFrame(settleFrame);
    createTrigger();
    ScrollTrigger.refresh();
  }, { once: true });

  if (walkthroughVideo.readyState >= HTMLMediaElement.HAVE_METADATA) {
    walkthroughVideo.dispatchEvent(new Event("loadedmetadata"));
  }

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(animationFrame);
    trigger?.kill();
  }, { once: true });
}

function setupLenisAndScroll() {
  updateHeader(window.scrollY);

  if (reducedMotion.matches) {
    window.addEventListener("scroll", () => updateHeader(window.scrollY), { passive: true });
    return;
  }

  // Lenis uses GSAP's ticker. Fall back to native scrolling if either CDN
  // dependency is unavailable instead of throwing a ReferenceError.
  if (!window.Lenis || !window.gsap) {
    window.addEventListener("scroll", () => updateHeader(window.scrollY), { passive: true });
    return;
  }

  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
  });

  lenis.on("scroll", (event) => {
    updateHeader(event.scroll);
    window.ScrollTrigger?.update();
  });

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.addEventListener("pagehide", () => lenis.destroy(), { once: true });
}

function setupProcessLine() {
  if (!processList || reducedMotion.matches || !("IntersectionObserver" in window)) return;

  const steps = Array.from(processList.querySelectorAll(".process-step"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = steps.indexOf(entry.target);
        const progress = steps.length <= 1 ? 1 : index / (steps.length - 1);
        processList.style.setProperty("--process-progress", String(progress));
      });
    },
    { rootMargin: "-20% 0px -46% 0px", threshold: 0 },
  );

  steps.forEach((step) => observer.observe(step));
}

function setupEnquiryForm() {
  const form = document.querySelector("#enquiry-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    const subject = `Project enquiry — ${fields.get("projectType")}`;
    const body = [
      `Name: ${fields.get("name")}`,
      `Email: ${fields.get("email")}`,
      `Phone: ${fields.get("phone") || "Not provided"}`,
      `Location: ${fields.get("location") || "Not provided"}`,
      `Project type: ${fields.get("projectType")}`,
      "",
      "Project details:",
      fields.get("details"),
    ].join("\n");

    status.textContent = "Your enquiry is ready. Your email app will open to send it.";
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  setupNavigation();
setupHeroImageFallback();
  setupRevealAnimations();
  setupHeroIntro();
  setupScrollDrivenVideo();
  setupLenisAndScroll();
  setupProcessLine();
  setupEnquiryForm();

  if (window.ScrollTrigger) {
    window.addEventListener("load", () => window.ScrollTrigger?.refresh(), { once: true });
  }
}