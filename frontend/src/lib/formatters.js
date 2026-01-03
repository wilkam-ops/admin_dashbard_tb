// Fonction pour formater les montants en Franc CFA (XOF)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 FCFA';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '0 FCFA';
  
  // Formater avec séparateur de milliers
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
  
  return `${formatted} FCFA`;
};

// Fonction pour formater les nombres avec séparateur de milliers
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  const numValue = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('fr-FR').format(numValue);
};

// Fonction pour formater les pourcentages
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(1)}%`;
};

// Fonction pour formater le temps de réponse
export const formatResponseTime = (ms) => {
  if (ms === null || ms === undefined) return '0 ms';
  
  const numMs = typeof ms === 'string' ? parseFloat(ms) : ms;
  
  if (isNaN(numMs)) return '0 ms';
  
  if (numMs < 1000) {
    return `${numMs.toFixed(0)} ms`;
  } else {
    return `${(numMs / 1000).toFixed(2)} s`;
  }
};
