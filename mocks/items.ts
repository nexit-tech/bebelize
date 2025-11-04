export interface Item {
  id: string;
  collectionId: string;
  name: string;
  description: string;
  code: string;
}

export const mockItems: Item[] = [
  {
    id: '1',
    collectionId: 'anjos',
    name: 'Kit Berço Premium',
    description: 'Kit completo com protetor e lençol',
    code: 'ITEM-001'
  },
  {
    id: '2',
    collectionId: 'anjos',
    name: 'Manta Bordada',
    description: 'Manta em algodão egípcio',
    code: 'ITEM-002'
  },
  {
    id: '3',
    collectionId: 'anjos',
    name: 'Almofada Decorativa',
    description: 'Almofada com tema anjos',
    code: 'ITEM-003'
  },
  {
    id: '4',
    collectionId: 'essencial',
    name: 'Kit Berço Básico',
    description: 'Kit essencial para o berço',
    code: 'ITEM-004'
  },
  {
    id: '5',
    collectionId: 'essencial',
    name: 'Toalha de Banho',
    description: 'Toalha felpuda 100% algodão',
    code: 'ITEM-005'
  },
  {
    id: '6',
    collectionId: 'premium',
    name: 'Enxoval Completo Premium',
    description: 'Kit luxuoso com 15 peças',
    code: 'ITEM-006'
  }
];