(() => {
  const token = localStorage.getItem('lumora_token');
  const api = window.LUMORA_API_URL || '';
  if (!token) { window.location.href = '../login.html'; return; }

  const request = (path, options = {}) => fetch(`${api}/api${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  }).then(async (response) => {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) { localStorage.clear(); window.location.href = '../login.html'; }
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body;
  });

  const byLabel = (label) => [...document.querySelectorAll('p')].find((node) => node.textContent.trim() === label)?.nextElementSibling;
  request('/auth/me').then((user) => {
    document.querySelectorAll('p').forEach((node) => { if (node.textContent.trim() === 'J. Doe') node.textContent = user.fullName; });
  });
  request('/dashboard/summary').then((summary) => {
    const active = summary.projectsByStatus.filter((row) => ['lead', 'quoted', 'contracted', 'in_progress'].includes(row.status)).reduce((total, row) => total + row.count, 0);
    const pending = summary.quotesByStatus.filter((row) => ['draft', 'sent'].includes(row.status)).reduce((total, row) => total + row.count, 0);
    const activeValue = byLabel('Active Projects');
    const pendingValue = byLabel('Pending Quotes');
    if (activeValue) activeValue.textContent = active;
    if (pendingValue) pendingValue.textContent = pending;
    const table = document.querySelector('tbody');
    if (table && summary.recentProjects.length) table.innerHTML = summary.recentProjects.map((project) => `<tr class="border-b border-outline-variant/10"><td class="p-4 font-medium">${escapeHtml(project.name)}</td><td class="p-4 text-on-surface-variant">${escapeHtml(project.client_name || 'Unassigned')}</td><td class="p-4">${escapeHtml(project.status)}</td><td class="p-4 text-right">${project.reference_code}</td></tr>`).join('');
  }).catch((error) => console.warn('[Lumora portal]', error.message));

  const invoiceLink = [...document.querySelectorAll('a')].find((link) => link.textContent.includes('Invoices'));
  if (invoiceLink) invoiceLink.href = '../invoice_builder.html';
  const documentLink = document.createElement('a');
  documentLink.href = '../documents.html'; documentLink.textContent = 'Documents'; documentLink.className = 'mt-2 px-3 py-2 text-xs uppercase tracking-wider text-on-surface-variant';
  document.querySelector('nav')?.appendChild(documentLink);
  const logout = document.createElement('button');
  logout.textContent = 'Sign out'; logout.className = 'mt-3 px-3 py-2 text-xs uppercase tracking-wider text-on-surface-variant';
  logout.onclick = () => { localStorage.clear(); window.location.href = '../login.html'; };
  document.querySelector('nav')?.appendChild(logout);

  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
})();