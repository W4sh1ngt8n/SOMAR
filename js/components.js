function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function buildLayout(pageTitle, contentHtml) {
  const user = getUser();
  const initials = user ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('') : '?';
  const isAdmin = user?.perfil === 'admin';

  document.getElementById('app').innerHTML = `
    <div class="app-container">
      <aside class="sidebar">
        <div class="sidebar-logo">Fundação SOMAR</div>
        <nav class="sidebar-nav" id="sidebarNav"></nav>
        <div class="sidebar-footer">v1.0.0 — ${user?.nome || ''}</div>
      </aside>
      <div class="main-content">
        <header class="page-header">
          <h1>${pageTitle}</h1>
          <div class="user-info">
            <div class="user-avatar">${initials}</div>
            <span>${user?.nome || ''}</span>
            <button class="btn btn-sm btn-secondary" onclick="logout()">Sair</button>
          </div>
        </header>
        <main class="page-content">${contentHtml}</main>
      </div>
    </div>`;

  const navItems = [
    { href: '#/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '#/pre-cadastro', label: 'Pré-Cadastro', icon: '📝' },
    { href: '#/pacientes', label: 'Pacientes', icon: '👥' },
    { href: '#/acompanhamentos', label: 'Acompanhamento', icon: '📅' },
    { href: '#/beneficios', label: 'Benefícios', icon: '🎁' },
    { href: '#/requisicoes', label: 'Requisições', icon: '📋' },
    { href: '#/documentos', label: 'Documentos', icon: '📎' },
    { href: '#/relatorios', label: 'Relatórios', icon: '📈' },
    { href: '#/patologias', label: 'Patologias', icon: '🏥' },
    { href: '#/medicamentos', label: 'Medicamentos', icon: '💊' },
  ];
  if (isAdmin) navItems.push({ href: '#/usuarios', label: 'Usuários', icon: '⚙️' });

  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = navItems.map(i =>
    `<a href="${i.href}" class="${window.location.hash === i.href ? 'active' : ''}">
      <span class="nav-icon">${i.icon}</span> ${i.label}</a>`
  ).join('');
}

function renderTable(headers, rows, actions = null) {
  const ths = headers.map(h => `<th>${h.label}</th>`).join('') + (actions ? '<th>Ações</th>' : '');
  const trs = rows.map(row => {
    const tds = headers.map(h => {
      let val = row[h.key];
      if (h.badge && val) return `<span class="badge ${h.badge(val)}">${h.format ? h.format(val) : val}</span>`;
      return h.format ? h.format(val) : (val ?? '-');
    }).join('');
    const actTd = actions ? `<td>${actions(row).map(a => `<button class="btn btn-sm ${a.class}" onclick="${a.onclick(row)}">${a.label}</button>`).join(' ')}</td>` : '';
    return `<tr>${tds}${actTd}</tr>`;
  }).join('');
  return `<table class="data-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

function statusBadge(status) {
  const map = {
    assistido: 'badge-success', triagem: 'badge-info', pre_cadastro: 'badge-muted',
    alta: 'badge-muted', abandono: 'badge-warning', obito: 'badge-danger',
    solicitada: 'badge-info', aprovada: 'badge-success', entregue: 'badge-success', negada: 'badge-danger',
    aguardando: 'badge-warning', validado: 'badge-info', convertido: 'badge-success',
  };
  return map[status] || 'badge-muted';
}