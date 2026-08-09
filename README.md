# 🏥 Fundação SOMAR — Sistema de Gestão de Pacientes

Sistema auto-hospedado de cadastro, acompanhamento e controle de pacientes assistidos pela Fundação SOMAR. Desenvolvido como projeto da disciplina **Laboratório de Programação**, com arquitetura modular, controle de permissões e geração automatizada de relatórios.

---

## 📋 Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Problemas Resolvidos](#problemas-resolvidos)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Configuração](#configuração)
- [Perfis de Usuário](#perfis-de-usuário)
- [API Endpoints](#api-endpoints)
- [Telas do Sistema](#telas-do-sistema)
- [Banco de Dados](#banco-de-dados)
- [Segurança](#segurança)
- [LGPD e Conformidade](#lgpd-e-conformidade)
- [Backup](#backup)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## 📖 Sobre o Projeto

A Fundação SOMAR assiste pacientes com necessidades especiais, oferecendo benefícios como combustível, medicamentos, exames, passagens, suplementos nutricionais e dieta enteral. Até então, todo o controle era feito manualmente com documentos impressos, planilhas Excel independentes e arquivos Word, gerando:

- Informações duplicadas
- Retrabalho de preenchimento
- Dificuldade de localização de dados
- Ausência de histórico consolidado
- Relatórios gerados manualmente

Este sistema centraliza **todas essas informações em uma única aplicação**, eliminando retrabalho e proporcionando visão integral do atendimento.

---

## ✅ Problemas Resolvidos

| Problema | Solução |
|---|---|
| Cadastro parcialmente manual | Pré-cadastro e cadastro definitivo digitais |
| Informações duplicadas | CPF único, validação de duplicidade |
| Planilhas independentes | Banco SQLite centralizado |
| Relatórios manuais | Geração automática de PDF com pdfkit |
| Dificuldade de localização | Busca por nome/CPF, filtros por status |
| Sem histórico consolidado | Timeline completa de acompanhamentos |
| Preenchimento repetitivo | Conversão automática de pré-cadastro → cadastro definitivo |

---

## 🎯 Funcionalidades

### 1ª Etapa (Escopo Atual)

- **Pré-cadastro** — escuta inicial, solicitação de documentos, validação
- **Cadastro definitivo** — dados completos com geração automática de QR Code
- **Histórico do paciente** — timeline de atendimentos, benefícios, documentos, patologias e medicamentos
- **Controle documental** — upload de arquivos digitalizados (RG, CPF, laudos, receitas)
- **Acompanhamento** — registro de consultas, retornos, visitas domiciliares
- **Benefícios** — cadastro de tipos e concessão a pacientes
- **Requisições** — solicitação, aprovação, entrega e negação de benefícios
- **Relatórios** — mensais e anuais em PDF, ficha completa do paciente, comprovantes
- **Dashboard** — indicadores, alertas de retornos vencidos, pacientes recentes
- **Gestão de usuários** — CRUD com perfis e permissões (RBAC)
- **Backup automático** — cópia do SQLite a cada 6 horas com retenção de 30 dias

### Módulos Excluídos desta Etapa

- **Financeiro** — custos, pagamentos, contabilidade (previsto para etapa futura)

---

## 🛠️ Stack Tecnológica

### Backend

| Tecnologia | Função |
|---|---|
| **Node.js** (v18+) | Runtime JavaScript |
| **Express** | Framework HTTP / API REST |
| **better-sqlite3** | Banco de dados SQLite (síncrono, rápido, local) |
| **jsonwebtoken** | Autenticação stateless com JWT |
| **bcryptjs** | Hash de senhas |
| **pdfkit** | Geração de documentos PDF |
| **qrcode** | Geração de QR Codes de identificação |
| **multer** | Upload de arquivos |
| **dotenv** | Variáveis de ambiente |
| **cors** | Controle de CORS |

### Frontend

| Tecnologia | Função |
|---|---|
| **HTML5** | Marcação semântica |
| **CSS3** | Estilização com Custom Properties (design tokens) |
| **JavaScript (Vanilla)** | Lógica client-side, SPA com hash routing |
| **Fetch API** | Comunicação com backend |

### Infraestrutura

- **Auto-hospedado** — roda em máquina local da Fundação
- **Sem dependência de nuvem** — banco e arquivos locais
- **Backup local** — cópias automáticas em disco

---

## 🏗️ Arquitetura┌─────────────────────────────────────────┐
│           Cliente (Browser)            │
│    HTML5 / CSS3 / JavaScript Puro      │
└──────────────────┬────────────────────┘
│ HTTP / REST
▼
┌─────────────────────────────────────────┐
│         Express Server (Port 3000)     │
│  ┌─────────┬──────┬─────────────────┐  │
│  │  CORS   │ JWT  │   Static Files   │  │
│  └─────────┴──────┴─────────────────┘  │
│  ┌───────────────────────────────────┐ │
│  │          Controllers (MVC)        │ │
│  └───────────────┬───────────────────┘ │
│  ┌───────────────▼───────────────────┐ │
│  │             Services               │ │
│  │    (Regras de Negócio)             │ │
│  └───────────────┬───────────────────┘ │
│  ┌───────────────▼───────────────────┐ │
│  │          DAO / Repositories       │ │
│  └───────────────┬───────────────────┘ │
│  ┌───────────────▼───────────────────┐ │
│  │        better-sqlite3 (SQLite)    │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │      Utilitários (PDF, QR, Hash)  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘Código
### Padrão MVC em 4 Camadas

1. **Controller** — recebe requisição HTTP, extrai parâmetros, delega ao Service
2. **Service** — aplica regras de negócio, orquestra múltiplos DAOs
3. **DAO** — executa queries SQLite com prepared statements
4. **Database** — SQLite local com foreign keys e WAL mode

---

## 📁 Estrutura de Pastasfundacao-somar/
│
├── .env.example                  # Template de variáveis de ambiente
├── .gitignore
├── package.json
├── server.js                     # Entry point da aplicação
│
├── src/
│   ├── app.js                    # Configuração do Express
│   │
│   ├── config/
│   │   ├── env.js                # Carregamento do dotenv
│   │   ├── cors.js               # Configuração de CORS
│   │   ├── database.js           # Inicialização do SQLite
│   │   ├── initDb.js             # Script: criar schema
│   │   └── seedDb.js             # Script: popular com dados fictícios
│   │
│   ├── database/
│   │   ├── schema.sql            # DDL completo (CREATE TABLE)
│   │   ├── somar.db              # Banco SQLite (gerado, não versionado)
│   │   └── backups/              # Backups automáticos
│   │
│   ├── middleware/
│   │   ├── auth.js               # Verificação de JWT
│   │   ├── rbac.js               # Controle de acesso por perfil
│   │   ├── errorHandler.js       # Handler centralizado de erros
│   │   └── logger.js             # Log de requisições
│   │
│   ├── controllers/              # 13 controllers
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── pacienteController.js
│   │   ├── preCadastroController.js
│   │   ├── acompanhamentoController.js
│   │   ├── beneficioController.js
│   │   ├── requisicaoController.js
│   │   ├── documentoController.js
│   │   ├── patologiaController.js
│   │   ├── medicamentoController.js
│   │   ├── relatorioController.js
│   │   ├── dashboardController.js
│   │   └── backupController.js
│   │
│   ├── services/                 # 7 services
│   │   ├── authService.js
│   │   ├── pacienteService.js
│   │   ├── pdfService.js
│   │   ├── qrCodeService.js
│   │   ├── backupService.js
│   │   ├── dashboardService.js
│   │   └── relatorioService.js
│   │
│   ├── dao/                      # 9 Data Access Objects
│   │   ├── usuarioDAO.js
│   │   ├── pacienteDAO.js
│   │   ├── preCadastroDAO.js
│   │   ├── acompanhamentoDAO.js
│   │   ├── beneficioDAO.js
│   │   ├── requisicaoDAO.js
│   │   ├── documentoDAO.js
│   │   ├── patologiaDAO.js
│   │   └── medicamentoDAO.js
│   │
│   ├── routes/                   # 13 arquivos de rota
│   │   ├── index.js              # Agrega todas as rotas
│   │   └── ...Routes.js
│   │
│   └── utils/
│       ├── jwt.js                # Assinatura e verificação de tokens
│       ├── hash.js               # bcryptjs helpers
│       ├── constants.js          # Enums e constantes
│       └── formatters.js         # Formatação de datas, CPF, idade
│
├── public/                       # Frontend estático
│   ├── index.html                # HTML principal
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css         # Design tokens
│   │   ├── layout.css            # Grid, sidebar, header
│   │   └── components.css        # Botões, tabelas, forms, badges
│   ├── js/
│   │   ├── api.js                # Cliente HTTP (fetch wrapper)
│   │   ├── auth.js               # Token, login, logout
│   │   ├── components.js         # Componentes UI reutilizáveis
│   │   ├── router.js             # Roteamento client-side
│   │   └── app.js                # Páginas e lógica da aplicação
│   └── assets/
│
├── uploads/                      # Arquivos enviados
│   ├── documentos/               # Documentos digitalizados
│   ├── qrcodes/                 # QR Codes dos pacientes
│   └── temp/                    # PDFs temporários
│
└── tests/Código
---

## ⚙️ Pré-requisitos

- **Node.js** v18 ou superior → [nodejs.org](https://nodejs.org)
- **npm** (incluído com Node.js)
- Sistema operacional: Linux, macOS ou Windows

---

## 🚀 Instalação e Execução

### 1. Clonar o repositório
```bash
git clone https://github.com/W4sh1ngt8n/SOMAR.git
cd SOMAR2. Instalar dependênciasnpm install3. Configurar variáveis de ambientecp .env.example .envEdite o .env e altere o JWT_SECRET para uma string aleatória de no mínimo 32 caracteres:JWT_SECRET=sua-chave-secreta-super-forte-com-32+caracteres-aqui4. Inicializar o banco de dadosnpm run init-dbIsso cria o arquivo src/database/somar.db com todas as tabelas.5. Popular com dados fictícios (opcional, recomendado)npm run seedIsso insere usuários de teste, benefícios, patologias, medicamentos e pacientes fictícios.6. Iniciar o servidorCódigo12345# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start7. Acessar no navegadorhttp://localhost:3000🔐 Logins de TesteApós executar o npm run seed, use estas credenciais:
























PerfilEmailSenhaAdministradoradmin@somar.localadmin123Coordenadorcoord@somar.localcoord123Assistenteassist@somar.localassist123⚙️ ConfiguraçãoVariáveis de Ambiente (.env)










































































VariávelDescriçãoPadrãoPORTPorta do servidor3000NODE_ENVAmbientedevelopmentDB_PATHCaminho do banco SQLite./src/database/somar.dbDB_BACKUP_PATHPasta de backups./src/database/backupsDB_BACKUP_INTERVAL_HOURSIntervalo do backup automático6JWT_SECRETChave secreta do JWT(obrigatório)JWT_EXPIRES_INValidade do token8hCORS_ORIGINOrigem permitidahttp://localhost:3000UPLOAD_DIRPasta de uploads./uploads/documentosUPLOAD_MAX_SIZE_MBTamanho máximo de arquivo10BACKUP_KEEP_DAYSDias de retenção de backup30MAX_LOGIN_ATTEMPTSTentativas de login5LOGIN_BLOCK_MINUTESBloqueio após tentativas15👥 Perfis de Usuário





























PerfilDescriçãoPermissõesadminAdministrador do sistemaAcesso total a todos os móduloscoordenadorCoordenador da FundaçãoCRUD de pacientes, aprova requisições, relatóriosassistenteAssistente de atendimentoPré-cadastro, cadastro, acompanhamentos, upload de docsvisitanteAcesso somente leituraDashboard e relatórios (dados sensíveis mascarados)Matriz de Permissões










































































AçãoadmincoordenadorassistentevisitanteGerenciar usuários✅❌❌❌Pré-cadastro✅✅✅❌Cadastro definitivo✅✅✅❌Registrar acompanhamento✅✅✅❌Solicitar benefício✅✅✅❌Aprovar/negar benefício✅✅❌❌Gerar relatórios PDF✅✅❌❌Ver dados de paciente✅✅✅✅ (mascarado)Backup do sistema✅❌❌❌📡 API EndpointsAutenticação



















MétodoEndpointDescriçãoPOST/api/auth/loginLogin, retorna JWTGET/api/auth/meDados do usuário logadoPacientes







































MétodoEndpointDescriçãoGET/api/pacientesListar (busca, filtros, paginação)POST/api/pacientesCriar cadastro definitivoGET/api/pacientes/:idDetalhe do pacientePUT/api/pacientes/:idEditar pacientePATCH/api/pacientes/:id/statusAlterar statusGET/api/pacientes/:id/historicoHistórico completoPré-Cadastro





























MétodoEndpointDescriçãoGET/api/pre-cadastrosListar pré-cadastrosPOST/api/pre-cadastrosCriar pré-cadastroPATCH/api/pre-cadastros/:id/validarValidar documentosPOST/api/pre-cadastros/:id/converterConverter em cadastro definitivoAcompanhamentos



















MétodoEndpointDescriçãoGET/api/acompanhamentos?paciente_id=Listar por pacientePOST/api/acompanhamentosRegistrar atendimentoBenefícios e Requisições

















































MétodoEndpointDescriçãoGET/api/beneficiosListar tipos de benefícioPOST/api/beneficiosCriar tipoGET/api/requisicoesListar requisiçõesPOST/api/requisicoesSolicitar benefícioPATCH/api/requisicoes/:id/aprovarAprovarPATCH/api/requisicoes/:id/negarNegarPATCH/api/requisicoes/:id/entregarMarcar como entregueGET/api/requisicoes/:id/comprovante-pdfComprovante em PDFDocumentos
























MétodoEndpointDescriçãoGET/api/documentos?paciente_id=Listar por pacientePOST/api/documentos/uploadUpload (multipart)DELETE/api/documentos/:idExcluirRelatórios
























MétodoEndpointDescriçãoGET/api/relatorios/mensal/pdf?mes=&ano=Relatório mensal em PDFGET/api/relatorios/anual/pdf?ano=Relatório anual em PDFGET/api/relatorios/pacientes/:id/ficha-pdfFicha completa do pacienteDashboard
























MétodoEndpointDescriçãoGET/api/dashboard/totaisContadores por statusGET/api/dashboard/alertasRetornos vencidosGET/api/dashboard/recentesÚltimos pacientes cadastradosBackup
























MétodoEndpointDescriçãoPOST/api/backup/gerarBackup manualGET/api/backup/listarListar backupsPOST/api/backup/restaurar/:filenameRestaurar backup🖥️ Telas do Sistema










































































TelaURLDescriçãoLogin/#/loginAutenticação com email/senhaDashboard/#/dashboardIndicadores, alertas, pacientes recentesPré-Cadastro/#/pre-cadastroFormulário de escuta inicial + listaPacientes/#/pacientesTabela com busca, filtros e paginaçãoFicha do Paciente/#/paciente/:idDados completos, histórico, QR CodeAcompanhamentos/#/acompanhamentosRegistro de atendimentosBenefícios/#/beneficiosCRUD de tipos de benefícioRequisições/#/requisicoesSolicitações com fluxo de aprovaçãoDocumentos/#/documentosUpload e gestão de arquivosRelatórios/#/relatoriosGeração de PDFs mensais e anuaisPatologias/#/patologiasCRUD de patologiasMedicamentos/#/medicamentosCRUD de medicamentosUsuários/#/usuariosGestão de usuários (admin)🗄️ Banco de DadosEntidades PrincipaisCódigousuarios
pacientes
pre_cadastros
acompanhamentos
beneficios
requisicoes
documentos
patologias
paciente_patologias (N:N)
medicamentos
paciente_medicamentos (N:N)
logs_auditoriaFluxo de AtendimentoCódigoChegada → Escuta Inicial → Solicitação de Documentos → Pré-cadastro
    → Validação → Cadastro Definitivo (+ QR Code) → Acompanhamento
    → Alta | Abandono | ÓbitoStatus de CadastroStatus de Tratamento🔒 Segurança
Senhas com hash bcrypt (10 rounds)
JWT com expiração de 8h
RBAC com 4 perfis e permissões granulares
Prepared statements em todas as queries (proteção contra SQL injection)
Rate limiting no endpoint de login
Mascaramento de dados sensíveis para perfil visitante (CPF, telefone, endereço)
Auditoria — tabela logs_auditoria registra acessos e alterações
Upload com validação de tipo e tamanho de arquivo
📋 LGPD e ConformidadeDurante o Desenvolvimento
Uso exclusivo de dados fictícios no seedDb.js
Nenhum dado real de paciente no repositório
.env não versionado (credenciais ficam apenas locais)
Na Aplicação
Princípio da minimização — apenas dados necessários são coletados
Controle de acesso — RBAC garante que só usuários autorizados veem dados sensíveis
Auditoria — logs de quem acessou/alterou dados e quando
Mascaramento — perfil visitante não vê CPF, telefone, endereço
Exportação — ficha completa do paciente em PDF sob demanda
Exclusão/anonimização — possível mediante solicitação do titular
💾 Backup




































AspectoEstratégiaFrequênciaAutomático a cada 6 horasLocalsrc/database/backups/Retenção30 diasFormatoCópia do .db com timestampBackup manualPOST /api/backup/gerar (admin)RestauraçãoPOST /api/backup/restaurar/:filename (admin)Backup na inicializaçãoExecutado ao iniciar o servidorComando manual via terminal:npm run backup🗺️ RoadmapEtapa 2 — Financeiro
Custos por paciente
Controle de despesas com benefícios
Relatórios financeiros
Dashboard financeiro
Etapa 3 — Nuvem
Migração SQLite → PostgreSQL
Deploy em VPS
HTTPS com certificados
Backup em armazenamento na nuvem
Etapa 4 — Funcionalidades Avançadas
Agenda de atividades
Notificações por e-mail/WhatsApp
Importação/exportação em massa (CSV)
App mobile (PWA)
Assinatura digital de documentos
Etapa 5 — Analytics
Relatórios preditivos
Análise de custo-benefício por patologia
Painel de indicadores para gestão
📜 LicençaEste projeto é de uso acadêmico, desenvolvido para a disciplina Laboratório de Programação com fins educacionais para a Fundação SOMAR.👨‍💻 AutorWashington Nunes
Email: eng.washington.nunes@gmail.com
GitHub: @W4sh1ngt8n
