(() => {
  const root = '../';
  const apiBase = window.LUMORA_API_URL || 'http://localhost:4000/api';
  const routes = {
    home: `${root}home_lumora_demoore_properties/code.html`,
    about: `${root}about_us_lumora_demoore_properties/code.html`,
    services: `${root}services_lumora_demoore_properties/code.html`,
    projects: `${root}projects_lumora_demoore_properties/code.html`,
    quality: `${root}quality_standards_lumora_demoore_properties/code.html`,
    properties: `${root}properties_lumora_demoore_properties/code.html`,
    contact: `${root}contact_proposal_lumora_demoore_properties/code.html`
  };

  const keyFor = (label) => label.trim().toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ');
  const linkRoutes = {
    home: routes.home,
    about: routes.about,
    services: routes.services,
    projects: routes.projects,
    quality: routes.quality,
    properties: routes.properties,
    contact: routes.contact,
    'contact us': routes.contact,
    'terms of service': `${root}terms_conditions_lumora_demoore_properties/code.html`,
    'terms conditions': `${root}terms_conditions_lumora_demoore_properties/code.html`,
    'disclaimer': `${root}disclaimer_lumora_demoore_properties/code.html`,
    'request a proposal': routes.contact,
    'discuss a vision': routes.contact,
    'view all services': routes.services,
    'explore our projects': routes.projects,
    'explore portfolio': routes.projects,
    'our services': routes.services,
    'view construction services': `${root}construction_services_lumora_demoore_properties/code.html`,
    'view construction solutions': `${root}construction_solutions_lumora_demoore_properties/code.html`,
    'view lift maintenance procurement': `${root}lift_maintenance_procurement_lumora_demoore_properties/code.html`
  };

  const transitionStyle = document.createElement('style');
  transitionStyle.textContent = `
    body { position: relative; isolation: isolate; }
    body::before, body::after { content: ''; position: fixed; inset: 0; pointer-events: none; }
    body::before { z-index: -2; background: url('../lumora-logo-background.png') center top / cover no-repeat; opacity: .16; filter: saturate(.72) contrast(1.08); }
    body::after { z-index: -1; background: linear-gradient(180deg, rgba(5,5,5,.56), rgba(5,5,5,.82) 70%, rgba(5,5,5,.92)); }
    body > * { position: relative; z-index: 0; }
    header, nav, footer { position: relative; z-index: 2; }
    .lumora-infinity-mark { display: inline-block; margin-right: .35em; color: #d4af37; font-family: Georgia, serif; font-size: 1.3em; line-height: .7; vertical-align: -0.08em; }
    .lumora-transition { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; background: #050505; opacity: 0; pointer-events: none; transition: opacity 180ms ease; }
    .lumora-transition.is-visible { opacity: 1; pointer-events: auto; }
    .lumora-transition-mark { color: #d4af37; font-family: Georgia, serif; font-size: clamp(12rem, 38vw, 34rem); line-height: .55; animation: lumora-spin 2.8s linear infinite; }
    @keyframes lumora-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .lumora-transition-mark { animation-duration: 0.01ms; } }
    @media (max-width: 700px) { body::before { background-position: 50% top; opacity: .12; } }
  `;
  document.head.appendChild(transitionStyle);

  const transition = document.createElement('div');
  transition.className = 'lumora-transition';
  transition.setAttribute('aria-hidden', 'true');
  transition.innerHTML = '<span class="lumora-transition-mark" aria-label="Lumora DeMoore">∞</span>';
  document.body.appendChild(transition);

  const showTransition = (href) => {
    transition.classList.add('is-visible');
    window.setTimeout(() => { window.location.href = href; }, 850);
  };

  document.querySelectorAll('footer').forEach((footer) => {
    footer.innerHTML = footer.innerHTML
      .replace(/Lumora DeMoore Properties\s*[·-]\s*Accra, Ghana\s*[·-]/g, 'Lumora DeMoore Properties - Ofankor Barrier, Accra, Ghana - 0500887266 -')
      .replace(/Lumora DeMoore Properties\s*[·-]\s*Accra, Ghana/g, 'Lumora DeMoore Properties - Ofankor Barrier, Accra, Ghana - 0500887266 - Lumora_demore@yahoo.com');
  });

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    const target = linkRoutes[keyFor(link.textContent)];
    if (target) link.href = target;
  });

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    if (keyFor(link.textContent) === 'lumora demoore') link.href = routes.home;
  });

  document.querySelectorAll('nav a, nav div, nav span').forEach((link) => {
    if (keyFor(link.textContent) === 'lumora demoore' && !link.querySelector('.lumora-infinity-mark')) {
      link.insertAdjacentHTML('afterbegin', '<span class="lumora-infinity-mark" aria-hidden="true">∞</span>');
    }
  });

  document.querySelectorAll('nav a').forEach((link) => {
    if (link.dataset.transitionBound || !link.href || link.getAttribute('href') === '#') return;
    link.dataset.transitionBound = 'true';
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      showTransition(link.href);
    });
  });

  document.querySelectorAll('nav').forEach((nav) => {
    const linkGroup = nav.querySelector('ul, div.hidden.md\\:flex, div.hidden.md\\:block') || nav;
    const navigation = [
      ['Home', routes.home],
      ['About', routes.about],
      ['Services', routes.services],
      ['Projects', routes.projects],
      ['Quality', routes.quality],
      ['Properties', routes.properties],
      ['Contact', routes.contact]
    ];
    navigation.forEach(([label, href]) => {
      const exists = [...linkGroup.querySelectorAll('a')].some((link) => keyFor(link.textContent) === keyFor(label));
      if (!exists) {
      const servicesLink = document.createElement('a');
      servicesLink.href = href;
      servicesLink.textContent = label;
      servicesLink.className = 'text-on-surface-variant hover:text-primary transition-colors duration-300';
      linkGroup.appendChild(servicesLink);
      }
    });
  });

  document.querySelectorAll('button').forEach((button) => {
    const label = keyFor(button.textContent);
    if (label.includes('request a proposal') || label === 'our services' || label.includes('explore our projects') || linkRoutes[label]) {
      button.type = 'button';
      const target = linkRoutes[label] || (label === 'our services' ? routes.services : label.includes('explore our projects') ? routes.projects : routes.contact);
      button.addEventListener('click', () => { window.location.href = target; });
    }
  });

  document.querySelectorAll('button.md\\:hidden').forEach((button) => {
    const nav = button.closest('nav, header')?.querySelector('ul, .hidden.md\\:flex, .hidden.md\\:block');
    if (!nav) return;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      nav.classList.toggle('hidden');
      nav.classList.toggle('flex');
      nav.classList.toggle('flex-col');
      nav.classList.toggle('absolute');
      nav.classList.toggle('top-full');
      nav.classList.toggle('left-0');
      nav.classList.toggle('right-0');
      nav.classList.toggle('bg-background');
      nav.classList.toggle('p-6');
      button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true'));
    });
  });

  const setFormStatus = (form, message, type) => {
    let status = form.querySelector('.lumora-form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'lumora-form-status mt-4 text-sm';
      form.appendChild(status);
    }
    status.textContent = message;
    status.style.color = type === 'error' ? '#e57373' : '#d4af37';
  };

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));

  const submitJsonForm = async (form, endpoint, payload, buttonLabel) => {
    const button = form.querySelector('button[type="submit"]');
    const originalLabel = button?.innerHTML;
    if (button) { button.disabled = true; button.innerHTML = '<span>Sending...</span>'; }
    setFormStatus(form, 'Sending your request...', 'success');
    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Unable to submit this request.');
      setFormStatus(form, 'Request received. Our team will respond within 24-48 business hours.', 'success');
      form.reset();
      return true;
    } catch (error) {
      setFormStatus(form, error.message || 'Unable to submit this request. Please try again.', 'error');
      return false;
    } finally {
      if (button) { button.disabled = false; button.innerHTML = originalLabel || buttonLabel; }
    }
  };

  const fieldValue = (form, id) => form.querySelector(`#${id}`)?.value.trim() || '';

  const contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitJsonForm(contactForm, '/public/contact-requests', {
      fullName: fieldValue(contactForm, 'gen-name'), companyName: fieldValue(contactForm, 'gen-company'),
      email: fieldValue(contactForm, 'gen-email'), phone: fieldValue(contactForm, 'gen-phone'),
      message: fieldValue(contactForm, 'gen-desc')
    }, 'Transmit Message');
  });

  const proposalForm = document.getElementById('proposalForm');
  const contactProposalForm = document.getElementById('contactProposalForm');
  const proposalHandler = (form, ids) => {
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitJsonForm(form, '/public/quote-requests', {
        fullName: fieldValue(form, ids.fullName), companyName: fieldValue(form, ids.companyName),
        email: fieldValue(form, ids.email), phone: fieldValue(form, ids.phone),
        service: fieldValue(form, ids.service), projectType: fieldValue(form, ids.projectType),
        location: fieldValue(form, ids.location), projectSize: fieldValue(form, ids.projectSize),
        description: fieldValue(form, ids.description), preferredStartDate: fieldValue(form, ids.startDate) || null,
        budget: fieldValue(form, ids.budget)
      }, 'Submit Request');
    });
  };
  proposalHandler(proposalForm, { fullName: 'fullName', companyName: 'companyName', email: 'emailAddress', phone: 'phone', service: 'projectType', projectType: 'projectType', location: 'projectLocation', projectSize: 'numFloors', description: 'projectDescription', startDate: 'preferredStartDate', budget: 'budget' });
  proposalHandler(contactProposalForm, { fullName: 'full-name', companyName: 'company-name', email: 'email-address', phone: 'phone-number', service: 'project-type', projectType: 'project-type', location: 'project-location', projectSize: 'num-floors', description: 'project-description', startDate: 'timeline', budget: 'budget' });

  const projectContainer = document.getElementById('publicProjects');
  if (projectContainer) {
    const renderProject = (project) => `<article class="bg-[#121212] border border-outline/10 group relative overflow-hidden flex flex-col">
      <div class="relative h-80 overflow-hidden bg-surface-variant"><div class="w-full h-full grid place-items-center text-primary text-6xl">∞</div></div>
      <div class="p-8 flex-grow flex flex-col justify-between"><div><div class="flex items-center gap-2 mb-3"><span class="bg-[#181818] text-[#E8E8E8] px-2 py-1 uppercase">${escapeHtml(project.service || 'Lumora project')}</span></div>
      <h3 class="font-headline-md text-headline-md text-on-surface mb-2">${escapeHtml(project.name)}</h3><p class="font-body-md text-body-md text-on-surface-variant mb-6">${escapeHtml(project.location || 'Ghana')}</p></div>
      <a class="self-start inline-flex items-center gap-2 font-label-md text-label-md text-primary uppercase tracking-wider" href="?project=${encodeURIComponent(project.id)}">View Project <span class="material-symbols-outlined text-[18px]">arrow_forward</span></a></div></article>`;
    const loadProjects = async () => {
      try {
        const response = await fetch(`${apiBase}/public/projects`);
        if (!response.ok) throw new Error('Unable to load projects');
        const projects = await response.json();
        if (new URLSearchParams(window.location.search).has('project')) return;
        projectContainer.innerHTML = projects.length ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">${projects.map(renderProject).join('')}</div>` : '<p class="text-on-surface-variant">No published projects found.</p>';
      } catch (error) {
        projectContainer.innerHTML = '<p class="text-on-surface-variant">Unable to load projects. Please try again shortly.</p>';
        console.warn('[Lumora] Public projects unavailable:', error.message);
      }
    };
    const projectId = new URLSearchParams(window.location.search).get('project');
    if (projectId) fetch(`${apiBase}/public/projects/${encodeURIComponent(projectId)}`).then((response) => response.ok ? response.json() : Promise.reject(new Error('Project not found'))).then((project) => {
      projectContainer.innerHTML = `<article class="max-w-3xl"><p class="font-label-sm text-label-sm text-primary uppercase">${escapeHtml(project.service || 'Project')}</p><h2 class="font-display-lg text-display-lg text-on-surface mt-4">${escapeHtml(project.name)}</h2><p class="text-on-surface-variant mt-4">${escapeHtml(project.location || 'Ghana')}${project.completion_date ? ` | Completed ${escapeHtml(project.completion_date)}` : ''}</p><div class="mt-10 space-y-6 text-on-surface-variant"><p>${escapeHtml(project.description)}</p><p><strong class="text-on-surface">Scope:</strong> ${escapeHtml(project.scope || 'Delivered by Lumora DeMoore Properties.')}</p></div><a class="inline-block mt-10 text-primary uppercase" href="${window.location.pathname}">Back to projects</a></article>`;
    }).catch(() => { projectContainer.innerHTML = '<p class="text-on-surface-variant">Unable to load this project.</p>'; });
    else loadProjects();
  }
})();
