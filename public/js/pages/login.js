function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h2>🏥 Fundação SOMAR</h2>
        <p style="text-align:center;color:var(--color-text-muted);margin-bottom:24px">Sistema de Gestão de Pacientes</p>
        <form id="loginForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" required placeholder="seu@email.com">
          </div>
          <div class="form-group">
            <label>Senha</label>
            <input type="password" id="senha" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">Entrar</button>
        </form>
        <div style="margin-top:16px;font-size:12px;color:var(--color-text-muted);text-align:center">
          <p>Logins de teste:</p>
          <p>admin@somar.local / admin123</p>
          <p>coord@somar.local / coord123</p>
          <p>assist@somar.local / assist123</p>
        </div>
      </div>
    </div>`;
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await doLogin(document.getElementById('email').value, document.getElementById('senha').value);
      window.location.hash = '#/dashboard';
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function renderDashboard() {
  buildLayout('Dashboard', '<div id="dashContent"><p>Carregando...</p></div>');
  try {
    const [totais, alertas, recentes] = await Promise.all([
      api.get('/dashboard/totais'), api.get('/dashboard/alertas'), api.get('/dashboard/recentes'),
    ]);
    const statusCards = totais.porStatus.map(s =>
      `<div class="stat-card"><div class="stat-value">${s.total}</div><div class="stat-label">${s.status_cadastro}</div></div>`
    ).join('');

    const alertasHtml = alertas.retornosVencidos.length > 0
      ? `<div class="alert alert-warning"><strong>⚠️ ${alertas.total} retorno(s) vencido(s):</strong><ul>${alertas.retornosVencidos.map(r => `<li>${r.nome_completo} — vencia ${r.proximo_retorno}</li>`).join('')}</ul></div>`
      : '<div class="alert alert-info">Nenhum retorno vencido.</div>';

    const recentesHtml = recentes.map(r =>
      `<tr><td>${r.nome_completo}</td><td><span class="badge ${statusBadge(r.status_cadastro)}">${r.status_cadastro}</span></td><td>${r.criado_em}</td></tr>`
    ).join('');

    document.getElementById('dashContent').innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-value">${totais.totalPacientes}</div><div class="stat-label">Total Pacientes</div></div>
        <div class="stat-card"><div class="stat-value">${totais.preCadastrosPendentes}</div><div class="stat-label">Pré-cadastros Pendentes</div></div>
        ${statusCards}
      </div>
      <div style="margin-top:24px">${alertasHtml}</div>
      <div class="card" style="margin-top:24px">
        <div class="card-title">Pacientes Recentes</div>
        <table class="data-table"><thead><tr><th>Nome</th><th>Status</th><th>Cadastrado em</th></tr></thead><tbody>${recentesHtml}</tbody></table>
      </div>`;
  } catch (err) { document.getElementById('dashContent').innerHTML = `<p>Erro: ${err.message}</p>`; }
}

async function renderPacientes() {
  buildLayout('Pacientes', `
    <div class="search-bar">
      <input type="text" id="searchInput" placeholder="Buscar por nome ou CPF...">
      <select id="statusFilter"><option value="">Todos os status</option>
        <option value="pre_cadastro">Pré-cadastro</option><option value="triagem">Triagem</option>
        <option value="assistido">Assistido</option><option value="alta">Alta</option>
        <option value="abandono">Abandono</option><option value="obito">Óbito</option>
      </select>
      <button class="btn btn-primary" onclick="loadPacientes()">Buscar</button>
      <button class="btn btn-secondary" onclick="window.location.hash='#/pre-cadastro'">Novo Pré-Cadastro</button>
    </div>
    <div id="pacientesTable"><p>Carregando...</p></div>
  `);
  loadPacientes();
  document.getElementById('searchInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') loadPacientes(); });
}

async function loadPacientes() {
  const search = document.getElementById('searchInput').value;
  const status = document.getElementById('statusFilter').value;
  let endpoint = `/pacientes?page=1&limit=20`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  if (status) endpoint += `&status_cadastro=${status}`;
  try {
    const result = await api.get(endpoint);
    const headers = [
      { key: 'id', label: 'ID' }, { key: 'nome_completo', label: 'Nome' },
      { key: 'cpf', label: 'CPF' }, { key: 'status_cadastro', label: 'Status', badge: statusBadge },
      { key: 'status_tratamento', label: 'Tratamento' },
    ];
    const actions = (r) => [{ label: 'Ver', class: 'btn-primary', onclick: () => `window.location.hash='#/paciente/${r.id}'` }];
    document.getElementById('pacientesTable').innerHTML = renderTable(headers, result.data, actions);
  } catch (err) { showToast(err.message, 'error'); }
}

async function renderPacienteDetalhe(params) {
  buildLayout('Ficha do Paciente', '<div id="pacienteDetail"><p>Carregando...</p></div>');
  try {
    const p = await api.get(`/pacientes/${params.id}/historico`);
    const tabs = ['Dados Pessoais', 'Acompanhamentos', 'Benefícios', 'Documentos', 'Patologias', 'Medicamentos'];
    const acsHtml = p.acompanhamentos.map(a =>
      `<tr><td>${a.data}</td><td>${a.tipo}</td><td>${a.descricao}</td><td>${a.profissional || '-'}</td><td>${a.proximo_retorno || '-'}</td></tr>`
    ).join('');
    const reqsHtml = p.requisicoes.map(r =>
      `<tr><td>${r.data_solicitacao}</td><td>${r.beneficio_nome}</td><td>${r.quantidade || '-'}</td><td><span class="badge ${statusBadge(r.status)}">${r.status}</span></td></tr>`
    ).join('');

    document.getElementById('pacienteDetail').innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <h2 style="color:var(--color-primary)">${p.nome_completo}</h2>
            <p>CPF: ${p.cpf || '-'} | Status: <span class="badge ${statusBadge(p.status_cadastro)}">${p.status_cadastro}</span></p>
            <p>Nascimento: ${p.data_nascimento || '-'} | Telefone: ${p.telefone || '-'}</p>
            <p>Endereço: ${p.endereco || '-'}, ${p.numero || ''} - ${p.bairro || ''}, ${p.cidade || ''}/${p.estado || ''}</p>
          </div>
          ${p.qr_code_path ? `<img src="/uploads/qrcodes/paciente_${p.id}.png" style="width:100px;height:100px" alt="QR Code">` : ''}
        </div>
      </div>
      <div class="card">
        <button class="btn btn-primary" onclick="downloadFichaPdf(${p.id})">📄 Gerar Ficha PDF</button>
      </div>
      <div class="card">
        <div class="card-title">Acompanhamentos</div>
        <table class="data-table"><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Profissional</th><th>Próx. Retorno</th></tr></thead>
        <tbody>${acsHtml || '<tr><td colspan=5>Nenhum registro</td></tr>'}</tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Benefícios Concedidos</div>
        <table class="data-table"><thead><tr><th>Data</th><th>Benefício</th><th>Quantidade</th><th>Status</th></tr></thead>
        <tbody>${reqsHtml || '<tr><td colspan=4>Nenhum registro</td></tr>'}</tbody></table>
      </div>`;
  } catch (err) { document.getElementById('pacienteDetail').innerHTML = `<p>Erro: ${err.message}</p>`; }
}

async function downloadFichaPdf(id) {
  try {
    const blob = await api.download(`/relatorios/pacientes/${id}/ficha-pdf`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ficha_paciente_${id}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch (err) { showToast(err.message, 'error'); }
}

async function renderPreCadastro() {
  buildLayout('Pré-Cadastro', `
    <div class="card">
      <div class="card-title">Novo Pré-Cadastro</div>
      <form id="preForm">
        <div class="form-row">
          <div class="form-group"><label>Nome Completo *</label><input type="text" id="pc_nome" required></div>
          <div class="form-group"><label>Telefone</label><input type="text" id="pc_telefone"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>WhatsApp</label><input type="text" id="pc_whatsapp"></div>
          <div class="form-group"><label>Responsável Recepção</label><input type="text" id="pc_responsavel"></div>
        </div>
        <div class="form-group"><label>Motivo da Busca (Escuta Inicial)</label><textarea id="pc_motivo" rows="3"></textarea></div>
        <div class="form-group"><label>Documentos Solicitados</label><textarea id="pc_docs" rows="2" placeholder="RG, CPF, Comprovante residência, Laudo médico..."></textarea></div>
        <button type="submit" class="btn btn-primary">Salvar Pré-Cadastro</button>
      </form>
    </div>
    <div class="card">
      <div class="card-title">Pré-Cadastros Existentes</div>
      <div id="preList"><p>Carregando...</p></div>
    </div>
  `);
  loadPreCadastros();
  document.getElementById('preForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.post('/pre-cadastros', {
        nome_completo: document.getElementById('pc_nome').value,
        telefone: document.getElementById('pc_telefone').value,
        whatsapp: document.getElementById('pc_whatsapp').value,
        motivo_busca: document.getElementById('pc_motivo').value,
        documentos_solicitados: document.getElementById('pc_docs').value,
        responsavel_recepcao: document.getElementById('pc_responsavel').value,
      });
      showToast('Pré-cadastro criado!', 'success');
      document.getElementById('preForm').reset();
      loadPreCadastros();
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function loadPreCadastros() {
  try {
    const list = await api.get('/pre-cadastros');
    const headers = [
      { key: 'id', label: 'ID' }, { key: 'nome_completo', label: 'Nome' },
      { key: 'telefone', label: 'Telefone' }, { key: 'status', label: 'Status', badge: statusBadge },
      { key: 'criado_em', label: 'Data' },
    ];
    const actions = (r) => {
      const btns = [];
      if (r.status === 'aguardando') btns.push({ label: 'Validar', class: 'btn-primary', onclick: () => `validarPre(${r.id})` });
      if (r.status === 'validado') btns.push({ label: 'Converter', class: 'btn-primary', onclick: () => `window.location.hash='#/cadastro/${r.id}'` });
      return btns;
    };
    document.getElementById('preList').innerHTML = renderTable(headers, list, actions);
  } catch (err) { showToast(err.message, 'error'); }
}

async function validarPre(id) {
  try { await api.patch(`/pre-cadastros/${id}/validar`); showToast('Validado!', 'success'); loadPreCadastros(); }
  catch (err) { showToast(err.message, 'error'); }
}

async function renderAcompanhamentos() {
  buildLayout('Acompanhamentos', `
    <div class="card">
      <div class="card-title">Registrar Acompanhamento</div>
      <form id="acForm">
        <div class="form-row">
          <div class="form-group"><label>Paciente *</label>
            <select id="ac_paciente" required><option value="">Selecione...</option></select>
          </div>
          <div class="form-group"><label>Tipo *</label>
            <select id="ac_tipo" required>
              <option value="consulta">Consulta</option><option value="retorno">Retorno</option>
              <option value="visita_domiciliar">Visita Domiciliar</option><option value="escuta_inicial">Escuta Inicial</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Profissional</label><input type="text" id="ac_profissional"></div>
          <div class="form-group"><label>Próximo Retorno</label><input type="date" id="ac_retorno"></div>
        </div>
        <div class="form-group"><label>Descrição *</label><textarea id="ac_desc" rows="3" required></textarea></div>
        <button type="submit" class="btn btn-primary">Registrar</button>
      </form>
    </div>
    <div class="card"><div class="card-title">Acompanhamentos Recentes</div><div id="acList"><p>Carregando...</p></div></div>
  `);
  try {
    const pacientes = await api.get('/pacientes?limit=9999');
    document.getElementById('ac_paciente').innerHTML = '<option value="">Selecione...</option>' +
      pacientes.data.map(p => `<option value="${p.id}">${p.nome_completo}</option>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
  document.getElementById('acForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.post('/acompanhamentos', {
        paciente_id: parseInt(document.getElementById('ac_paciente').value),
        tipo: document.getElementById('ac_tipo').value,
        descricao: document.getElementById('ac_desc').value,
        profissional: document.getElementById('ac_profissional').value,
        proximo_retorno: document.getElementById('ac_retorno').value,
      });
      showToast('Acompanhamento registrado!', 'success');
      document.getElementById('acForm').reset();
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function renderRequisicoes() {
  buildLayout('Requisições de Benefícios', `
    <div class="card">
      <div class="card-title">Nova Requisição</div>
      <form id="reqForm">
        <div class="form-row">
          <div class="form-group"><label>Paciente *</label><select id="req_paciente" required></select></div>
          <div class="form-group"><label>Benefício *</label><select id="req_beneficio" required></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Quantidade</label><input type="text" id="req_qtd" placeholder="Ex: 30 comprimidos"></div>
          <div class="form-group"><label>Observações</label><input type="text" id="req_obs"></div>
        </div>
        <button type="submit" class="btn btn-primary">Solicitar</button>
      </form>
    </div>
    <div class="card"><div class="card-title">Requisições</div><div id="reqList"><p>Carregando...</p></div></div>
  `);
  try {
    const [pacientes, beneficios] = await Promise.all([
      api.get('/pacientes?status_cadastro=assistido&limit=9999'), api.get('/beneficios'),
    ]);
    document.getElementById('req_paciente').innerHTML = '<option value="">Selecione...</option>' +
      pacientes.data.map(p => `<option value="${p.id}">${p.nome_completo}</option>`).join('');
    document.getElementById('req_beneficio').innerHTML = '<option value="">Selecione...</option>' +
      beneficios.map(b => `<option value="${b.id}">${b.nome}</option>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
  document.getElementById('reqForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.post('/requisicoes', {
        paciente_id: parseInt(document.getElementById('req_paciente').value),
        beneficio_id: parseInt(document.getElementById('req_beneficio').value),
        quantidade: document.getElementById('req_qtd').value,
        observacoes: document.getElementById('req_obs').value,
      });
      showToast('Requisição criada!', 'success');
      document.getElementById('reqForm').reset();
      loadRequisicoes();
    } catch (err) { showToast(err.message, 'error'); }
  });
  loadRequisicoes();
}

async function loadRequisicoes() {
  try {
    const result = await api.get('/requisicoes?limit=50');
    const headers = [
      { key: 'id', label: 'ID' }, { key: 'paciente_nome', label: 'Paciente' },
      { key: 'beneficio_nome', label: 'Benefício' }, { key: 'quantidade', label: 'Qtd' },
      { key: 'status', label: 'Status', badge: statusBadge }, { key: 'data_solicitacao', label: 'Data' },
    ];
    const user = getUser();
    const canApprove = ['admin', 'coordenador'].includes(user?.perfil);
    const actions = (r) => {
      const btns = [];
      if (canApprove && r.status === 'solicitada') {
        btns.push({ label: 'Aprovar', class: 'btn-primary', onclick: () => `aprovarReq(${r.id})` });
        btns.push({ label: 'Negar', class: 'btn-danger', onclick: () => `negarReq(${r.id})` });
      }
      if (canApprove && r.status === 'aprovada') {
        btns.push({ label: 'Entregar', class: 'btn-primary', onclick: () => `entregarReq(${r.id})` });
      }
      if (r.status === 'aprovada' || r.status === 'entregue') {
        btns.push({ label: 'PDF', class: 'btn-secondary', onclick: () => `downloadComprovante(${r.id})` });
      }
      return btns;
    };
    document.getElementById('reqList').innerHTML = renderTable(headers, result.data, actions);
  } catch (err) { showToast(err.message, 'error'); }
}

async function aprovarReq(id) { try { await api.patch(`/requisicoes/${id}/aprovar`); showToast('Aprovado!', 'success'); loadRequisicoes(); } catch (e) { showToast(e.message, 'error'); } }
async function negarReq(id) { try { await api.patch(`/requisicoes/${id}/negar`); showToast('Negado!', 'success'); loadRequisicoes(); } catch (e) { showToast(e.message, 'error'); } }
async function entregarReq(id) { try { await api.patch(`/requisicoes/${id}/entregar`); showToast('Entregue!', 'success'); loadRequisicoes(); } catch (e) { showToast(e.message, 'error'); } }
async function downloadComprovante(id) { try { const b = await api.download(`/requisicoes/${id}/comprovante-pdf`); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `comprovante_${id}.pdf`; a.click(); URL.revokeObjectURL(u); } catch (e) { showToast(e.message, 'error'); } }

async function renderRelatorios() {
  buildLayout('Relatórios', `
    <div class="card">
      <div class="card-title">Relatório Mensal</div>
      <div class="form-row">
        <div class="form-group"><label>Mês</label><select id="relMes">
          ${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${i+1===new Date().getMonth()+1?'selected':''}>${i+1}</option>`).join('')}
        </select></div>
        <div class="form-group"><label>Ano</label><input type="number" id="relAno" value="${new Date().getFullYear()}"></div>
      </div>
      <button class="btn btn-primary" onclick="gerarRelMensal()">Gerar PDF</button>
    </div>
    <div class="card">
      <div class="card-title">Relatório Anual</div>
      <div class="form-group"><label>Ano</label><input type="number" id="relAnoAnual" value="${new Date().getFullYear()}"></div>
      <button class="btn btn-primary" onclick="gerarRelAnual()">Gerar PDF</button>
    </div>
    <div class="card">
      <div class="card-title">Listagens</div>
      <button class="btn btn-secondary" onclick="window.location.hash='#/pacientes'">Pacientes em Tratamento</button>
    </div>
  `);
}

async function gerarRelMensal() {
  const mes = document.getElementById('relMes').value;
  const ano = document.getElementById('relAno').value;
  try {
    const blob = await api.download(`/relatorios/mensal/pdf?mes=${mes}&ano=${ano}`);
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `relatorio_mensal_${mes}_${ano}.pdf`; a.click(); URL.revokeObjectURL(url);
    showToast('Relatório gerado!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function gerarRelAnual() {
  const ano = document.getElementById('relAnoAnual').value;
  try {
    const blob = await api.download(`/relatorios/anual/pdf?ano=${ano}`);
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `relatorio_anual_${ano}.pdf`; a.click(); URL.revokeObjectURL(url);
    showToast('Relatório gerado!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function renderBeneficios() {
  buildLayout('Benefícios', '<div id="benContent"><p>Carregando...</p></div>');
  try {
    const list = await api.get('/beneficios');
    const headers = [{key:'id',label:'ID'},{key:'nome',label:'Nome'},{key:'categoria',label:'Categoria'},{key:'descricao',label:'Descrição'}];
    document.getElementById('benContent').innerHTML = `<div class="card"><div class="card-title">Benefícios Cadastrados</div>${renderTable(headers, list)}</div>`;
  } catch (err) { showToast(err.message, 'error'); }
}

async function renderDocumentos() {
  buildLayout('Documentos', `
    <div class="card">
      <div class="card-title">Upload de Documento</div>
      <form id="docForm">
        <div class="form-row">
          <div class="form-group"><label>Paciente *</label><select id="doc_paciente" required></select></div>
          <div class="form-group"><label>Tipo *</label><select id="doc_tipo" required>
            <option value="rg">RG</option><option value="cpf">CPF</option>
            <option value="comprovante_residencia">Comp. Residência</option>
            <option value="laudo_medico">Laudo Médico</option><option value="receita">Receita</option>
            <option value="outro">Outro</option>
          </select></div>
        </div>
        <div class="form-group"><label>Arquivo *</label><input type="file" id="doc_file" accept=".jpg,.jpeg,.png,.pdf" required></div>
        <div class="form-group"><label>Observações</label><input type="text" id="doc_obs"></div>
        <button type="submit" class="btn btn-primary">Enviar</button>
      </form>
    </div>
    <div class="card"><div class="card-title">Documentos</div><div id="docList"><p>Selecione um paciente para ver os documentos.</p></div></div>
  `);
  try {
    const pacientes = await api.get('/pacientes?limit=9999');
    document.getElementById('doc_paciente').innerHTML = '<option value="">Selecione...</option>' +
      pacientes.data.map(p => `<option value="${p.id}">${p.nome_completo}</option>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
  document.getElementById('doc_paciente').addEventListener('change', async (e) => {
    if (!e.target.value) return;
    try {
      const docs = await api.get(`/documentos?paciente_id=${e.target.value}`);
      const headers = [{key:'tipo',label:'Tipo'},{key:'nome_arquivo',label:'Arquivo'},{key:'criado_em',label:'Data'}];
      document.getElementById('docList').innerHTML = renderTable(headers, docs);
    } catch (err) { showToast(err.message, 'error'); }
  });
  document.getElementById('docForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('doc_file').files[0];
    if (!file) return;
    try {
      await uploadFile('/documentos/upload', file, {
        paciente_id: document.getElementById('doc_paciente').value,
        tipo: document.getElementById('doc_tipo').value,
        observacoes: document.getElementById('doc_obs').value,
      });
      showToast('Documento enviado!', 'success');
      document.getElementById('docForm').reset();
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function renderPatologias() {
  buildLayout('Patologias', '<div id="patContent"><p>Carregando...</p></div>');
  try {
    const list = await api.get('/patologias');
    const headers = [{key:'id',label:'ID'},{key:'nome',label:'Nome'},{key:'gravidade',label:'Gravidade'},{key:'descricao',label:'Descrição'}];
    document.getElementById('patContent').innerHTML = `<div class="card"><div class="card-title">Patologias</div>${renderTable(headers, list)}</div>`;
  } catch (err) { showToast(err.message, 'error'); }
}

async function renderMedicamentos() {
  buildLayout('Medicamentos', '<div id="medContent"><p>Carregando...</p></div>');
  try {
    const list = await api.get('/medicamentos');
    const headers = [{key:'id',label:'ID'},{key:'nome',label:'Nome'},{key:'principio_ativo',label:'Princípio Ativo'},{key:'apresentacao',label:'Apresentação'},{key:'dosagem_padrao',label:'Dosagem'}];
    document.getElementById('medContent').innerHTML = `<div class="card"><div class="card-title">Medicamentos</div>${renderTable(headers, list)}</div>`;
  } catch (err) { showToast(err.message, 'error'); }
}

async function renderUsuarios() {
  buildLayout('Usuários', `
    <div class="card">
      <div class="card-title">Novo Usuário</div>
      <form id="userForm">
        <div class="form-row">
          <div class="form-group"><label>Nome *</label><input type="text" id="user_nome" required></div>
          <div class="form-group"><label>Email *</label><input type="email" id="user_email" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Senha *</label><input type="password" id="user_senha" required></div>
          <div class="form-group"><label>Perfil *</label><select id="user_perfil" required>
            <option value="admin">Admin</option><option value="coordenador">Coordenador</option>
            <option value="assistente">Assistente</option><option value="visitante">Visitante</option>
          </select></div>
        </div>
        <button type="submit" class="btn btn-primary">Criar Usuário</button>
      </form>
    </div>
    <div class="card"><div class="card-title">Usuários Cadastrados</div><div id="userList"><p>Carregando...</p></div></div>
  `);
  loadUsuarios();
  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', {
        nome: document.getElementById('user_nome').value,
        email: document.getElementById('user_email').value,
        senha: document.getElementById('user_senha').value,
        perfil: document.getElementById('user_perfil').value,
      });
      showToast('Usuário criado!', 'success');
      document.getElementById('userForm').reset();
      loadUsuarios();
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function loadUsuarios() {
  try {
    const list = await api.get('/usuarios');
    const headers = [{key:'id',label:'ID'},{key:'nome',label:'Nome'},{key:'email',label:'Email'},{key:'perfil',label:'Perfil'},{key:'ativo',label:'Ativo',format:(v)=>v?'Sim':'Não'}];
    document.getElementById('userList').innerHTML = renderTable(headers, list);
  } catch (err) { showToast(err.message, 'error'); }
}