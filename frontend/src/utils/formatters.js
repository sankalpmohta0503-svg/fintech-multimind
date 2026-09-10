/**
 * Utility functions for formatting data
 */

/**
 * Format currency in Indian format
 */
export const formatCurrency = (amount, includeDecimals = false) => {
  if (amount === null || amount === undefined) return '₹0';
  
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  
  if (absAmount >= 10000000) {
    // Crores
    const value = absAmount / 10000000;
    return `${isNegative ? '-' : ''}₹${value.toFixed(includeDecimals ? 2 : 1)}Cr`;
  } else if (absAmount >= 100000) {
    // Lakhs
    const value = absAmount / 100000;
    return `${isNegative ? '-' : ''}₹${value.toFixed(includeDecimals ? 2 : 1)}L`;
  } else if (absAmount >= 1000) {
    // Thousands
    const value = absAmount / 1000;
    return `${isNegative ? '-' : ''}₹${value.toFixed(includeDecimals ? 2 : 1)}K`;
  } else {
    return `${isNegative ? '-' : ''}₹${absAmount.toFixed(0)}`;
  }
};

/**
 * Format number with Indian comma system
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format percentage
 */
export const formatPercent = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get severity color class
 */
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'text-[#DC2626] bg-[#FFF7ED] border-[#FED7AA]';
    case 'warning':
      return 'text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA]';
    case 'opportunity':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'healthy':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Get severity icon
 */
export const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'warning':
      return '🟠';
    case 'opportunity':
      return '🟡';
    case 'healthy':
      return '🟢';
    default:
      return '⚪';
  }
};

/**
 * Get health score status
 */
export const getHealthScoreStatus = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 70) return { label: 'Good', color: 'text-[#2563EB]' };
  if (score >= 60) return { label: 'Fair', color: 'text-yellow-600' };
  if (score >= 50) return { label: 'Needs Improvement', color: 'text-orange-600' };
  return { label: 'Critical', color: 'text-[#DC2626]' };
};

/**
 * Get health score color
 */
export const getHealthScoreColor = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-[#EA580C]';
};

/**
 * Format dimension name
 */
export const formatDimensionName = (dimension) => {
  const names = {
    cashFlow: 'Cash Flow',
    liquidity: 'Liquidity',
    goalReadiness: 'Goal Readiness',
    riskAlignment: 'Risk Alignment',
    diversification: 'Diversification',
    debtHealth: 'Debt Health',
    protection: 'Protection',
    taxEfficiency: 'Tax Efficiency'
  };
  return names[dimension] || dimension;
};

/**
 * Get goal status color
 */
export const getGoalStatusColor = (status) => {
  switch (status) {
    case 'on-track':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'attention':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'at-risk':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'critical':
      return 'bg-[#FFEDD5] text-[#C2410C] border-rose-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

/**
 * Format timeframe
 */
export const formatTimeframe = (years) => {
  if (years === 1) return '1 year';
  if (years < 1) return `${Math.round(years * 12)} months`;
  return `${Math.round(years)} years`;
};
