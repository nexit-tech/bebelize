import { ProjectStatus } from '@/types';

export const getStatusLabel = (status: ProjectStatus): string => {
  const labels: Record<ProjectStatus, string> = {
    rascunho: 'Rascunho',
    negociacao: 'Em Negociação',
    aprovado: 'Aprovado',
    producao: 'Em Produção',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado'
  };
  return labels[status];
};

export const getStatusColor = (status: ProjectStatus): string => {
  const colors: Record<ProjectStatus, string> = {
    rascunho: '#A69A94',
    negociacao: '#D4C29A',
    aprovado: '#A3B59F',
    producao: '#B0C4DE',
    finalizado: '#A3B59F',
    cancelado: '#D9A6A0'
  };
  return colors[status];
};

export const getStatusVariant = (status: ProjectStatus): string => {
  const variants: Record<ProjectStatus, string> = {
    rascunho: 'rascunho',
    negociacao: 'negociacao',
    aprovado: 'aprovado',
    producao: 'producao',
    finalizado: 'finalizado',
    cancelado: 'cancelado'
  };
  return variants[status];
};