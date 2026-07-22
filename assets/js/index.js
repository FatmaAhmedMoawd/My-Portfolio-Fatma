// Restore UI behaviors: theme toggle, settings panel, color swatches,
// portfolio filtering (tabs), and nav active highlighting.
(function(){
  const doc = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  // THEME
  const themeBtn = document.getElementById('theme-toggle-button');
  function applyTheme(theme){
    if(theme === 'dark'){
      doc.classList.add('dark');
      themeBtn?.setAttribute('aria-pressed','true');
      if(metaTheme) metaTheme.setAttribute('content','#0f172b');
    } else {
      doc.classList.remove('dark');
      themeBtn?.setAttribute('aria-pressed','false');
      if(metaTheme) metaTheme.setAttribute('content', getStoredColor() || '#6366f1');
    }
  }
  function getStoredTheme(){ try{ return localStorage.getItem('theme'); }catch(e){return null} }
  function storeTheme(theme){ try{ localStorage.setItem('theme', theme); }catch(e){} }

  // FONT
  const FONT_KEY = 'site-font';
  function applyFont(name){
    doc.classList.remove('font-alexandria','font-tajawal','font-cairo');
    if(name === 'alexandria') doc.classList.add('font-alexandria');
    else if(name === 'cairo') doc.classList.add('font-cairo');
    else doc.classList.add('font-tajawal');
    try{ localStorage.setItem(FONT_KEY, name); }catch(e){}
  }
  function getStoredFont(){ try{ return localStorage.getItem(FONT_KEY); }catch(e){return null} }

  // THEME COLOR
  const COLOR_KEY = 'site-theme-color';
  const COLORS = ['#6366f1','#06b6d4','#f59e0b','#ef4444','#10b981','#8b5cf6','#ec4899','#f97316'];
  function applyColor(hex){
    if(!hex) return;
    try{ doc.style.setProperty('--color-primary', hex); }catch(e){}
    if(metaTheme) metaTheme.setAttribute('content', hex);
    try{ localStorage.setItem(COLOR_KEY, hex); }catch(e){}
    // mark active swatch
    document.querySelectorAll('#theme-colors-grid button').forEach(b=>{
      b.setAttribute('aria-pressed', b.dataset.color === hex ? 'true' : 'false');
    });
  }
  function getStoredColor(){ try{ return localStorage.getItem(COLOR_KEY); }catch(e){return null} }

  // INITIAL THEME + FONT + COLOR
  const storedTheme = getStoredTheme();
  if(storedTheme === 'dark' || storedTheme === 'light') {
    applyTheme(storedTheme);
  } else {
    // Default to dark mode on first visit as requested by user
    applyTheme('dark');
    storeTheme('dark');
  }
  const sf = getStoredFont(); if(sf) applyFont(sf);
  const sc = getStoredColor(); if(sc) applyColor(sc);

  // THEME TOGGLE
  function toggleTheme(){ const isDark = doc.classList.contains('dark'); const next = isDark ? 'light' : 'dark'; applyTheme(next); storeTheme(next); }
  if(themeBtn){ themeBtn.addEventListener('click', toggleTheme); themeBtn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleTheme(); } }); }

  // MOBILE SIDEBAR NAV
  const navMenuToggle = document.getElementById('nav-menu-toggle');
  const mobileSidebar = document.getElementById('mobile-sidebar');
  const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
  const mobileSidebarClose = document.getElementById('mobile-sidebar-close');
  let sidebarOpen = false;

  function openMobileSidebar() {
    if (!mobileSidebar) return;
    // Close settings sidebar if it is currently open
    closeSettingsPanel();
    // Show overlay
    mobileSidebarOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      mobileSidebarOverlay.style.opacity = '1';
    });
    // Slide in sidebar
    mobileSidebar.classList.remove('translate-x-full');
    navMenuToggle?.setAttribute('aria-expanded', 'true');
    navMenuToggle?.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
    sidebarOpen = true;
  }

  function closeMobileSidebar() {
    if (!mobileSidebar) return;
    // Slide out sidebar
    mobileSidebar.classList.add('translate-x-full');
    // Fade out overlay
    mobileSidebarOverlay.style.opacity = '0';
    setTimeout(() => { mobileSidebarOverlay.classList.add('hidden'); }, 300);
    navMenuToggle?.setAttribute('aria-expanded', 'false');
    navMenuToggle?.classList.remove('open');
    document.body.style.overflow = '';
    sidebarOpen = false;
  }

  navMenuToggle?.addEventListener('click', () => {
    if (sidebarOpen) closeMobileSidebar();
    else openMobileSidebar();
  });

  mobileSidebarClose?.addEventListener('click', closeMobileSidebar);
  mobileSidebarOverlay?.addEventListener('click', closeMobileSidebar);

  // Close sidebar when clicking any nav link inside it
  mobileSidebar?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { closeMobileSidebar(); });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebarOpen) closeMobileSidebar();
  });

  // SETTINGS SIDEBAR
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsSidebar = document.getElementById('settings-sidebar');
  const closeSettings = document.getElementById('close-settings');

  function openSettings(){
    if(!settingsSidebar) return;
    // Close mobile nav sidebar if it is currently open
    if (sidebarOpen) closeMobileSidebar();
    settingsSidebar.classList.remove('translate-x-full');
    settingsSidebar.setAttribute('aria-hidden','false');
    settingsToggle?.setAttribute('aria-expanded','true');
    settingsSidebar.focus?.();
  }

  function closeSettingsPanel(){
    if(!settingsSidebar) return;
    settingsSidebar.classList.add('translate-x-full');
    settingsSidebar.setAttribute('aria-hidden','true');
    settingsToggle?.setAttribute('aria-expanded','false');
  }

  settingsToggle?.addEventListener('click', ()=>{
    if(!settingsSidebar) return;
    const isHidden = settingsSidebar.classList.contains('translate-x-full');
    if(isHidden) openSettings();
    else closeSettingsPanel();
  });
  closeSettings?.addEventListener('click', closeSettingsPanel);

  // Populate theme color swatches
  const colorsGrid = document.getElementById('theme-colors-grid');
  if(colorsGrid){
    colorsGrid.innerHTML = '';
    COLORS.forEach(hex => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'w-10 h-10 rounded-full border-2 border-white shadow-sm';
      btn.style.backgroundColor = hex;
      btn.dataset.color = hex;
      btn.setAttribute('aria-pressed', getStoredColor()===hex ? 'true' : 'false');
      btn.addEventListener('click', ()=>{ applyColor(hex); });
      colorsGrid.appendChild(btn);
    });
  }

  // Fonts radio behavior
  document.querySelectorAll('.font-option').forEach(btn => {
    btn.addEventListener('click', ()=>{
      const font = btn.dataset.font || 'tajawal';
      document.querySelectorAll('.font-option').forEach(b=> b.setAttribute('aria-checked','false'));
      btn.setAttribute('aria-checked','true');
      applyFont(font);
    });
  });

  // Reset settings
  const resetBtn = document.getElementById('reset-settings');
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      try{ localStorage.removeItem('theme'); localStorage.removeItem(FONT_KEY); localStorage.removeItem(COLOR_KEY); }catch(e){}
      // restore defaults
      applyFont('tajawal');
      applyColor(COLORS[0]);
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
      closeSettingsPanel();
    });
  }

  // PORTFOLIO FILTERS (tabs)
  const FILTER_LIMITS = { all:9, web:3, app:3, design:2, ecommerce:1 };
  const filterButtons = Array.from(document.querySelectorAll('#portfolio-filters .portfolio-filter'));
  const portfolioItems = Array.from(document.querySelectorAll('#portfolio-grid .portfolio-item'));
  function filterPortfolio(filter){
    if(!portfolioItems.length) return;
    if(filter === 'all'){
      // show first N items
      portfolioItems.forEach((it, idx)=>{ if(idx < (FILTER_LIMITS.all||9)) it.classList.remove('hidden'); else it.classList.add('hidden'); });
      return;
    }
    let shown = 0;
    portfolioItems.forEach(it=>{
      const cat = it.dataset.category || '';
      if(cat === filter && shown < (FILTER_LIMITS[filter]||0)) { it.classList.remove('hidden'); shown++; }
      else it.classList.add('hidden');
    });
  }
  const DEFAULT_FILTER_CLASS = 'portfolio-filter px-8 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700';
  const ACTIVE_FILTER_CLASS = 'portfolio-filter active px-8 py-3 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/50';

  filterButtons.forEach(btn=>{
    // normalize any existing buttons to default if they don't have 'active'
    if(!btn.classList.contains('active')) btn.className = DEFAULT_FILTER_CLASS;
    btn.addEventListener('click', ()=>{
      // reset all buttons to default
      filterButtons.forEach(b=>{ b.className = DEFAULT_FILTER_CLASS; b.setAttribute('aria-pressed','false'); });
      // set clicked as active with purple background + white text
      btn.className = ACTIVE_FILTER_CLASS;
      btn.setAttribute('aria-pressed','true');
      const f = btn.dataset.filter || 'all';
      filterPortfolio(f);
    });
  });
  // init default filter styling and behavior
  const activeFilter = document.querySelector('#portfolio-filters .portfolio-filter.active');
  if(activeFilter){
    // ensure classes reflect active state
    filterButtons.forEach(b=>{ if(b!==activeFilter) b.className = DEFAULT_FILTER_CLASS; });
    activeFilter.className = ACTIVE_FILTER_CLASS;
    filterPortfolio(activeFilter.dataset.filter || 'all');
  } else {
    // fallback: apply default and show 'all'
    filterButtons.forEach(b=> b.className = DEFAULT_FILTER_CLASS);
    if(filterButtons[0]){ filterButtons[0].className = ACTIVE_FILTER_CLASS; filterButtons[0].setAttribute('aria-pressed','true'); filterPortfolio(filterButtons[0].dataset.filter || 'all'); }
  }

  // SKILLS & TECHNOLOGIES CATEGORY TABS
  const skillsCatButtons = Array.from(document.querySelectorAll('#skills-category-tabs .skills-cat-btn'));
  const skillBadges = Array.from(document.querySelectorAll('#skills-badges-grid .skill-badge'));
  const DEFAULT_SKILLS_TAB_CLASS = 'skills-cat-btn px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all duration-300 cursor-pointer bg-slate-100/90 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100';
  const ACTIVE_SKILLS_TAB_CLASS = 'skills-cat-btn active px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 cursor-pointer bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-500/40 shadow-xs';

  skillsCatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCat = btn.dataset.cat || 'all';

      skillsCatButtons.forEach(b => {
        b.className = DEFAULT_SKILLS_TAB_CLASS;
        b.setAttribute('aria-pressed', 'false');
      });

      btn.className = ACTIVE_SKILLS_TAB_CLASS;
      btn.setAttribute('aria-pressed', 'true');

      skillBadges.forEach(badge => {
        const cat = badge.dataset.category;
        if (selectedCat === 'all' || cat === selectedCat) {
          badge.classList.remove('hidden');
          badge.style.display = 'inline-flex';
        } else {
          badge.classList.add('hidden');
          badge.style.display = 'none';
        }
      });
    });
  });

  // NAV LINK ACTIVE HIGHLIGHT
  const navLinks = Array.from(document.querySelectorAll('nav .nav-links a'));
  const sections = navLinks.map(a => {
    try{ const id = a.getAttribute('href')?.replace('#',''); return document.getElementById(id); }catch(e){return null}
  });
  const obsOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.target) return;
      const id = entry.target.id;
      const link = navLinks.find(a => a.getAttribute('href') === '#'+id);
      if(entry.isIntersecting){
        navLinks.forEach(a=> a.classList.remove('text-primary','font-bold','underline','decoration-primary','underline-offset-4'));
        if(link) { link.classList.add('text-primary','font-bold','underline','decoration-primary','underline-offset-4'); }
      }
    });
  }, obsOptions);
  sections.forEach(s=>{ if(s) observer.observe(s); });

  // clicking nav should set active immediately
  navLinks.forEach(a=> a.addEventListener('click', ()=>{ navLinks.forEach(x=> x.classList.remove('text-primary','font-bold','underline','decoration-primary','underline-offset-4')); a.classList.add('text-primary','font-bold','underline','decoration-primary','underline-offset-4'); }));

  // Initial active detection and scroll listener (keeps active link in sync)
  function updateActiveLink(){
    if(!navLinks.length) return;
    const viewportCenter = window.innerHeight / 2;
    let best = null; let bestDist = Infinity;
    navLinks.forEach(a=>{
      const id = a.getAttribute('href')?.replace('#','');
      const el = document.getElementById(id);
      if(!el) return;
      const rect = el.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height/2;
      const dist = Math.abs(sectionCenter - viewportCenter);
      if(dist < bestDist){ bestDist = dist; best = a; }
    });
    if(best){ navLinks.forEach(x=> x.classList.remove('text-primary','font-bold','underline','decoration-primary','underline-offset-4')); best.classList.add('text-primary','font-bold','underline','decoration-primary','underline-offset-4'); }
  }
  updateActiveLink();
  let ticking = false;
  window.addEventListener('scroll', ()=>{ if(!ticking){ window.requestAnimationFrame(()=>{ updateActiveLink(); ticking = false; }); ticking = true; } });

  // FIXED INTERACTIVE GRID & PARTICLE BACKGROUND ENGINE
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = [];

    class Particle {
      constructor() {
        this.reset(true);
      }
      
      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : (Math.random() < 0.5 ? -10 : height + 10);
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = Math.random() * 2.2 + 1.2;
        this.alpha = Math.random() * 0.55 + 0.15;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // boundary reset
        if (this.x < -30 || this.x > width + 30 || this.y < -30 || this.y > height + 30) {
          this.reset();
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        const isDark = doc.classList.contains('dark');
        if (isDark) {
          ctx.fillStyle = `rgba(6, 182, 212, ${this.alpha})`; // Cyan in dark mode
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        } else {
          ctx.fillStyle = `rgba(14, 165, 233, ${this.alpha * 0.75})`; // Soft Light Blue in light mode
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    function drawLines() {
      const maxDistance = 110;
      const isDark = doc.classList.contains('dark');
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark
              ? `rgba(6, 182, 212, ${alpha})`
              : `rgba(14, 165, 233, ${alpha * 0.75})`;
            ctx.stroke();
          }
        }
      }
    }

    // Mouse movement interactive logic
    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    function drawMouseConnections() {
      if (mouse.x !== null && mouse.y !== null) {
        const maxMouseDist = 160;
        const isDark = doc.classList.contains('dark');
        
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < maxMouseDist) {
            const alpha = (1 - dist / maxMouseDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = isDark
              ? `rgba(6, 182, 212, ${alpha})`
              : `rgba(14, 165, 233, ${alpha * 0.75})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
    }

    function initParticles() {
      particles.length = 0;
      const count = Math.min(65, Math.floor((window.innerWidth * window.innerHeight) / 22000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    initParticles();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      drawLines();
      drawMouseConnections();
      
      requestAnimationFrame(animate);
    }
    
    animate();
  }

  // TYPING & DELETING ANIMATION
  const words = [
    "building highly responsive web apps",
    "creating gorgeous custom user interfaces",
    "crafting immersive interactive web experiences",
    "delivering clean high performance code"
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 80;
  const deletingSpeed = 40;
  const delayAfterType = 2500;
  const delayAfterDelete = 600;
  const typingTextEl = document.getElementById('typing-text');

  function typeEffect() {
    if (!typingTextEl) return;
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typingTextEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingTextEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let nextDelay = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      nextDelay = delayAfterType;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      nextDelay = delayAfterDelete;
    }

    setTimeout(typeEffect, nextDelay);
  }

  if (typingTextEl) {
    setTimeout(typeEffect, 800);
  }

  // CAREER SKILLS MODAL LOGIC
  const SKILL_DETAILS = {
    'front-end-architecture': {
      title: 'Front-End Architecture & Core Engineering',
      category: 'CAREER FOCUS',
      points: [
        { title: 'Component Architecture', text: 'Designing modular, scalable React & Next.js component trees using atomic design principles.' },
        { title: 'Type Safety & Clean Code', text: 'Enforcing strict TypeScript types, interface contracts, and maintainable project structures.' },
        { title: 'Reusability & DRY', text: 'Building custom hooks and generic components to keep business logic isolated from UI.' },
        { title: 'Code Quality & Standards', text: 'Writing scalable frontend code aligned with modern ECMAScript standards and linting rules.' }
      ]
    },
    'responsive-ui': {
      title: 'Responsive UI/UX & Design Systems',
      category: 'CAREER FOCUS',
      points: [
        { title: 'Figma-to-Code Precision', text: 'Translating complex Figma design files into pixel-perfect, responsive web interfaces.' },
        { title: 'Styling Architecture', text: 'Utilizing Tailwind CSS with dynamic utilities, custom design tokens, and responsive breakpoints.' },
        { title: 'Design System Systems', text: 'Developing reusable UI component libraries with accessible themes and consistent typography.' },
        { title: 'Layout Mastery', text: 'Expert implementation of CSS Grid, Flexbox layouts, and fluid responsive design.' }
      ]
    },
    'state-management': {
      title: 'State Management & API Integration',
      category: 'CAREER FOCUS',
      points: [
        { title: 'Client State Management', text: 'Handling complex UI state seamlessly using Zustand, Context API, and local state.' },
        { title: 'REST & Async Data Flow', text: 'Integrating REST APIs, handling loading/error boundaries, and caching data efficiently.' },
        { title: 'Form Handling & Validation', text: 'Implementing robust multi-step forms using React Hook Form and schema validation.' },
        { title: 'Persistent Storage', text: 'Managing auth tokens, session state, and localStorage persistence across client routes.' }
      ]
    },
    'performance-optimization': {
      title: 'Performance Optimization & Web Vitals',
      category: 'CAREER FOCUS',
      points: [
        { title: 'Core Web Vitals', text: 'Optimizing LCP, CLS, and INP metrics for seamless user interaction and high lighthouse scores.' },
        { title: 'Asset & Bundle Optimization', text: 'Implementing code-splitting, lazy loading, and dynamic imports to reduce bundle size.' },
        { title: 'Render Optimization', text: 'Utilizing React memoization (useMemo, useCallback) to eliminate unnecessary re-renders.' },
        { title: 'Image & Asset Delivery', text: 'Leveraging next/image and modern formats (WebP/AVIF) for instant visual loading.' }
      ]
    },
    'collaboration-git': {
      title: 'Collaboration, Git & Agile Workflows',
      category: 'CAREER FOCUS',
      points: [
        { title: 'Version Control & Branching', text: 'Managing GitHub workflows, feature branching, pull requests, and code reviews.' },
        { title: 'Cross-Functional Synergy', text: 'Partnering closely with backend engineers and UI/UX designers to align feature specs.' },
        { title: 'Agile Iteration', text: 'Active participation in sprint planning, task estimations, and continuous deployment pipelines.' },
        { title: 'Technical Documentation', text: 'Documenting component architecture, setup guides, and project API integration flows.' }
      ]
    }
  };

  const modal = document.getElementById('career-skill-modal');
  const modalContent = document.getElementById('career-skill-modal-content');
  const modalTitle = document.getElementById('modal-skill-title');
  const modalCategory = document.getElementById('modal-skill-category');
  const modalPoints = document.getElementById('modal-skill-points');
  const closeModalBtn = document.getElementById('close-career-skill-modal');

  window.openSkillModal = function(skillId) {
    const data = SKILL_DETAILS[skillId];
    const m = document.getElementById('career-skill-modal') || modal;
    const mc = document.getElementById('career-skill-modal-content') || modalContent;
    const mt = document.getElementById('modal-skill-title') || modalTitle;
    const mcCat = document.getElementById('modal-skill-category') || modalCategory;
    const mp = document.getElementById('modal-skill-points') || modalPoints;

    if (!data || !m) return;

    // Populate contents
    if (mt) mt.textContent = data.title;
    if (mcCat) mcCat.textContent = data.category || 'CAREER FOCUS';

    if (mp) {
      mp.innerHTML = '';
      data.points.forEach(point => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-3.5';
        li.style.display = 'flex';
        li.style.alignItems = 'flex-start';
        li.style.gap = '0.85rem';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'mt-1 shrink-0 flex items-center justify-center';
        iconSpan.style.marginTop = '0.2rem';
        iconSpan.style.flexShrink = '0';
        iconSpan.style.display = 'flex';
        iconSpan.style.alignItems = 'center';
        iconSpan.style.justifyContent = 'center';
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="var(--color-primary, #6366f1)" class="shrink-0"><circle cx="12" cy="12" r="10" fill="var(--color-primary, #6366f1)"/><path d="m9 12 2 2 4-4" stroke="#080d1a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        
        const textSpan = document.createElement('span');
        textSpan.className = 'text-slate-300 text-sm sm:text-base leading-relaxed';
        textSpan.style.color = '#cbd5e1';
        textSpan.style.fontSize = '0.95rem';
        textSpan.style.lineHeight = '1.55';
        textSpan.innerHTML = `<strong class="font-bold text-white" style="font-weight: 700; color: #ffffff; display: inline; margin-right: 0.2rem;">${point.title}:</strong> ${point.text}`;
        
        li.appendChild(iconSpan);
        li.appendChild(textSpan);
        mp.appendChild(li);
      });
    }

    // Direct style manipulations for guaranteed rendering
    m.style.display = 'flex';
    m.style.opacity = '1';
    m.style.pointerEvents = 'auto';
    m.style.visibility = 'visible';

    if (mc) {
      mc.style.transform = 'scale(1)';
      mc.style.opacity = '1';
    }

    // Class list updates
    m.classList.remove('pointer-events-none', 'opacity-0', 'hidden');
    m.classList.add('opacity-100');
    
    if (mc) {
      mc.classList.remove('scale-95', 'opacity-0');
      mc.classList.add('scale-100', 'opacity-100');
    }
    
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  window.closeSkillModal = function() {
    const m = document.getElementById('career-skill-modal') || modal;
    const mc = document.getElementById('career-skill-modal-content') || modalContent;
    if (!m) return;
    
    m.style.display = 'none';
    m.style.opacity = '0';
    m.style.pointerEvents = 'none';

    if (mc) {
      mc.style.transform = 'scale(0.95)';
      mc.style.opacity = '0';
    }

    m.classList.remove('opacity-100');
    m.classList.add('opacity-0', 'pointer-events-none');
    
    if (mc) {
      mc.classList.remove('scale-100', 'opacity-100');
      mc.classList.add('scale-95', 'opacity-0');
    }
    
    document.body.style.overflow = ''; // Restore background scrolling
  };

  // Event listener delegation for career skill cards
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.career-skill-card') || e.target.closest('[data-skill]');
    if (card) {
      const skillId = card.dataset.skill;
      if (skillId && SKILL_DETAILS[skillId]) {
        window.openSkillModal(skillId);
      }
    }
  });

  closeModalBtn?.addEventListener('click', window.closeSkillModal);
  
  // Close on background click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      window.closeSkillModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeSkillModal();
    }
  });

})();
