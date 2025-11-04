export interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  createdAt: string;
}

export const mockCollections: Collection[] = [
  {
    id: 'anjos',
    name: 'Coleção Anjos',
    description: 'Peças delicadas com tema celestial',
    itemCount: 12,
    createdAt: '10/09/2024'
  },
  {
    id: 'essencial',
    name: 'Coleção Essencial',
    description: 'Itens básicos e práticos para o dia a dia',
    itemCount: 8,
    createdAt: '15/08/2024'
  },
  {
    id: 'premium',
    name: 'Coleção Premium',
    description: 'Enxoval completo de luxo',
    itemCount: 15,
    createdAt: '01/07/2024'
  }
];