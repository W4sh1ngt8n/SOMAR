const STATUS_CADASTRO = ['pre_cadastro','triagem','assistido','alta','abandono','obito'];
const STATUS_TRATAMENTO = ['em_tratamento','em_acompanhamento','retorno_trimestral','retorno_semestral'];
const STATUS_REQUISICAO = ['solicitada','aprovada','entregue','negada'];
const STATUS_PRE_CADASTRO = ['aguardando','validado','convertido','recusado'];
const LABELS_STATUS_CADASTRO = { pre_cadastro:'Pré-cadastro',triagem:'Triagem',assistido:'Assistido',alta:'Alta',abandono:'Abandono',obito:'Óbito' };
const LABELS_STATUS_TRATAMENTO = { em_tratamento:'Em Tratamento',em_acompanhamento:'Em Acompanhamento',retorno_trimestral:'Retorno Trimestral',retorno_semestral:'Retorno Semestral' };
const CATEGORIAS_BENEFICIO = ['combustivel','medicamento','exame','passagem','nutren','dieta_enteral'];
module.exports = { STATUS_CADASTRO,STATUS_TRATAMENTO,STATUS_REQUISICAO,STATUS_PRE_CADASTRO,LABELS_STATUS_CADASTRO,LABELS_STATUS_TRATAMENTO,CATEGORIAS_BENEFICIO };
