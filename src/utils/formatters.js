function formatDate(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr); if (isNaN(d)) return dateStr; return d.toLocaleDateString('pt-BR'); }
function formatDateTime(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr); if (isNaN(d)) return dateStr; return d.toLocaleString('pt-BR'); }
function maskCPF(cpf, perfil) { if (perfil === 'visitante' && cpf) return '***.***.***-**'; return cpf || '-'; }
function maskPhone(phone, perfil) { if (perfil === 'visitante' && phone) return '(**) *****-****'; return phone || '-'; }
function calcularIdade(dataNasc) { if (!dataNasc) return null; const hoje = new Date(); const nasc = new Date(dataNasc); let idade = hoje.getFullYear() - nasc.getFullYear(); const m = hoje.getMonth() - nasc.getMonth(); if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--; return idade; }
module.exports = { formatDate, formatDateTime, maskCPF, maskPhone, calcularIdade };
