const pages = {
  '/login': { render: renderLogin, auth: false },
  '/dashboard': { render: renderDashboard, auth: true },
  '/pre-cadastro': { render: renderPreCadastro, auth: true },
  '/pacientes': { render: renderPacientes, auth: true },
  '/paciente/:id': { render: renderPacienteDetalhe, auth: true },
  '/acompanhamentos': { render: renderAcompanhamentos, auth: true },
  '/beneficios': { render: renderBeneficios, auth: true },
  '/requisicoes': { render: renderRequisicoes, auth: true },
  '/documentos': { render: renderDocumentos, auth: true },
  '/relatorios': { render: renderRelatorios, auth: true },
  '/patologias': { render: renderPatologias, auth: true },
  '/medicamentos': { render: renderMedicamentos, auth: true },
  '/usuarios': { render: renderUsuarios, auth: true, adminOnly: true },
};

function navigate() {
  const hash = window.location.hash.slice(1) || '/login';
  let route = null;
  let params = {};

  for (const path of Object.keys(pages)) {
    if (path.includes(':')) {
      const pattern = path.replace(/:(\w+)/g, '([^/]+)');
      const match = hash.match(new RegExp(`^${pattern}$`));
      if (match) {
        route = pages[path];
        const paramNames = path.match(/:(\w+)/g)?.map(p => p.slice(1)) || [];
        paramNames.forEach((n, i) => { params[n] = match[i + 1]; });
        break;
      }
    } else if (path === hash) {
      route = pages[path];
      break;
    }
  }

  if (!route) { window.location.hash = '#/dashboard'; return; }
  if (route.auth && !isLoggedIn()) { window.location.hash = '#/login'; return; }
  if (route.adminOnly && getUser()?.perfil !== 'admin') { window.location.hash = '#/dashboard'; return; }
  if (hash === '/login' && isLoggedIn()) { window.location.hash = '#/dashboard'; return; }

  route.render(params);
}

window.addEventListener('hashchange', navigate);