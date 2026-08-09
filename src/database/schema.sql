CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK(perfil IN ('admin','coordenador','assistente','visitante')),
    ativo INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pre_cadastro_id INTEGER,
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE,
    rg TEXT,
    data_nascimento TEXT,
    sexo TEXT CHECK(sexo IN ('M','F','Outro')),
    nome_responsavel TEXT,
    parentesco_responsavel TEXT,
    telefone TEXT,
    whatsapp TEXT,
    email TEXT,
    cep TEXT,
    endereco TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    status_cadastro TEXT NOT NULL DEFAULT 'pre_cadastro'
        CHECK(status_cadastro IN ('pre_cadastro','triagem','assistido','alta','abandono','obito')),
    status_tratamento TEXT
        CHECK(status_tratamento IN ('em_tratamento','em_acompanhamento','retorno_trimestral','retorno_semestral') OR status_tratamento IS NULL),
    data_entrada TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    data_alta TEXT,
    data_obito TEXT,
    motivo_alta TEXT,
    observacoes TEXT,
    qr_code_path TEXT,
    criado_por INTEGER REFERENCES usuarios(id),
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS pre_cadastros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    telefone TEXT,
    whatsapp TEXT,
    motivo_busca TEXT,
    documentos_solicitados TEXT,
    documentos_recebidos INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'aguardando'
        CHECK(status IN ('aguardando','validado','convertido','recusado')),
    paciente_id INTEGER REFERENCES pacientes(id),
    responsavel_recepcao TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS patologias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    gravidade TEXT CHECK(gravidade IN ('leve','moderada','grave','critica')),
    ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS paciente_patologias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    patologia_id INTEGER NOT NULL REFERENCES patologias(id),
    diagnosticado_em TEXT,
    observacoes TEXT,
    UNIQUE(paciente_id, patologia_id)
);

CREATE TABLE IF NOT EXISTS medicamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    principio_ativo TEXT,
    apresentacao TEXT,
    dosagem_padrao TEXT,
    ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS paciente_medicamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medicamento_id INTEGER NOT NULL REFERENCES medicamentos(id),
    posologia TEXT,
    data_inicio TEXT,
    data_fim TEXT,
    ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS beneficios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    categoria TEXT CHECK(categoria IN ('combustivel','medicamento','exame','passagem','nutren','dieta_enteral')),
    ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS requisicoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    beneficio_id INTEGER NOT NULL REFERENCES beneficios(id),
    quantidade TEXT,
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'solicitada'
        CHECK(status IN ('solicitada','aprovada','entregue','negada')),
    solicitado_por INTEGER REFERENCES usuarios(id),
    aprovado_por INTEGER REFERENCES usuarios(id),
    data_solicitacao TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    data_aprovacao TEXT,
    data_entrega TEXT
);

CREATE TABLE IF NOT EXISTS acompanhamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK(tipo IN ('consulta','retorno','visita_domiciliar','escuta_inicial','alta','obito','abandono')),
    data TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    descricao TEXT NOT NULL,
    profissional TEXT,
    proximo_retorno TEXT,
    criado_por INTEGER REFERENCES usuarios(id),
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK(tipo IN ('rg','cpf','comprovante_residencia','laudo_medico','receita','outro')),
    nome_arquivo TEXT NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    observacoes TEXT,
    enviado_por INTEGER REFERENCES usuarios(id),
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao TEXT NOT NULL,
    entidade TEXT,
    entidade_id INTEGER,
    detalhes TEXT,
    ip TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_status_cad ON pacientes(status_cadastro);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome_completo);
CREATE INDEX IF NOT EXISTS idx_pre_cadastros_status ON pre_cadastros(status);
CREATE INDEX IF NOT EXISTS idx_acompanhamentos_paciente ON acompanhamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_paciente ON requisicoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_status ON requisicoes(status);
CREATE INDEX IF NOT EXISTS idx_documentos_paciente ON documentos(paciente_id);