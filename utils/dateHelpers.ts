export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};

export const isDatePast = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date < today;
};

export const getDaysUntil = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isDateSoon = (dateString: string, daysThreshold: number = 7): boolean => {
  const daysUntil = getDaysUntil(dateString);
  return daysUntil <= daysThreshold && daysUntil >= 0;
};