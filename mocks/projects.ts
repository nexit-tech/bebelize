export interface Project {
  id: string;
  name: string;
  clientName: string;
  consultantName: string;
  consultantId: string;
  createdAt: string;
  status: 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado';
  statusLabel: string;
  priority?: 'normal' | 'urgent';
  collection: string;
  collectionName: string;
  primaryColor: string;
  secondaryColor: string;
  embroideryName: string;
  fabric: string;
  fabricName: string;
  embroideryStyle: string;
  embroideryStyleName: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Enxoval - Maria Alice',
    clientName: 'Ana Paula Silva',
    consultantName: 'Ana Paula Silva',
    consultantId: 'ana',
    createdAt: '15/10/2024',
    status: 'negociacao',
    statusLabel: 'Em Negociação',
    priority: 'normal',
    collection: 'anjos',
    collectionName: 'Coleção Anjos',
    primaryColor: 'rosa',
    secondaryColor: 'bege',
    embroideryName: 'Maria Alice',
    fabric: 'algodao',
    fabricName: 'Algodão Egípcio Premium',
    embroideryStyle: 'script',
    embroideryStyleName: 'Script (Cursiva)'
  },
  {
    id: '2',
    name: 'Kit Berço - Pedro Henrique',
    clientName: 'Cliente de Carla',
    consultantName: 'Carla Mendes',
    consultantId: 'carla',
    createdAt: '12/10/2024',
    status: 'aprovado',
    statusLabel: 'Aprovado',
    priority: 'normal',
    collection: 'essencial',
    collectionName: 'Coleção Essencial',
    primaryColor: 'azul',
    secondaryColor: 'branco',
    embroideryName: 'Pedro',
    fabric: 'linho',
    fabricName: 'Linho Premium',
    embroideryStyle: 'block',
    embroideryStyleName: 'Block (Maiúscula)'
  },
  {
    id: '3',
    name: 'Enxoval Completo - Sofia',
    clientName: 'Cliente de Juliana',
    consultantName: 'Juliana Costa',
    consultantId: 'juliana',
    createdAt: '08/10/2024',
    status: 'producao',
    statusLabel: 'Em Produção',
    priority: 'urgent',
    collection: 'anjos',
    collectionName: 'Coleção Anjos',
    primaryColor: 'rosa',
    secondaryColor: 'bege',
    embroideryName: 'Sofia',
    fabric: 'algodao',
    fabricName: 'Algodão Egípcio Premium',
    embroideryStyle: 'script',
    embroideryStyleName: 'Script (Cursiva)'
  },
  {
    id: '4',
    name: 'Kit Maternidade - Lucas',
    clientName: 'Cliente de Beatriz',
    consultantName: 'Beatriz Santos',
    consultantId: 'beatriz',
    createdAt: '05/10/2024',
    status: 'finalizado',
    statusLabel: 'Finalizado',
    priority: 'normal',
    collection: 'premium',
    collectionName: 'Coleção Premium',
    primaryColor: 'verde',
    secondaryColor: 'branco',
    embroideryName: 'Lucas',
    fabric: 'misto',
    fabricName: 'Misto Premium',
    embroideryStyle: 'elegant',
    embroideryStyleName: 'Elegant (Serifada)'
  },
  {
    id: '5',
    name: 'Enxoval Premium - Isabella',
    clientName: 'Fernanda Oliveira',
    consultantName: 'Ana Paula Silva',
    consultantId: 'ana',
    createdAt: '20/09/2024',
    status: 'negociacao',
    statusLabel: 'Em Negociação',
    priority: 'urgent',
    collection: 'premium',
    collectionName: 'Coleção Premium',
    primaryColor: 'rosa',
    secondaryColor: 'bege',
    embroideryName: 'Isabella',
    fabric: 'algodao',
    fabricName: 'Algodão Egípcio Premium',
    embroideryStyle: 'script',
    embroideryStyleName: 'Script (Cursiva)'
  },
  {
    id: '6',
    name: 'Kit Berço Anjos - Miguel',
    clientName: 'Patricia Lima',
    consultantName: 'Carla Mendes',
    consultantId: 'carla',
    createdAt: '18/09/2024',
    status: 'aprovado',
    statusLabel: 'Aprovado',
    priority: 'normal',
    collection: 'anjos',
    collectionName: 'Coleção Anjos',
    primaryColor: 'azul',
    secondaryColor: 'branco',
    embroideryName: 'Miguel',
    fabric: 'algodao',
    fabricName: 'Algodão Egípcio Premium',
    embroideryStyle: 'block',
    embroideryStyleName: 'Block (Maiúscula)'
  },
  {
    id: '7',
    name: 'Enxoval Cancelado - Gabriel',
    clientName: 'Cliente Desistente',
    consultantName: 'Juliana Costa',
    consultantId: 'juliana',
    createdAt: '10/09/2024',
    status: 'cancelado',
    statusLabel: 'Cancelado',
    priority: 'normal',
    collection: 'essencial',
    collectionName: 'Coleção Essencial',
    primaryColor: 'verde',
    secondaryColor: 'branco',
    embroideryName: 'Gabriel',
    fabric: 'linho',
    fabricName: 'Linho Premium',
    embroideryStyle: 'elegant',
    embroideryStyleName: 'Elegant (Serifada)'
  },
  {
    id: '8',
    name: 'Kit Premium - Laura',
    clientName: 'Amanda Ferreira',
    consultantName: 'Beatriz Santos',
    consultantId: 'beatriz',
    createdAt: '01/10/2024',
    status: 'finalizado',
    statusLabel: 'Finalizado',
    priority: 'normal',
    collection: 'premium',
    collectionName: 'Coleção Premium',
    primaryColor: 'rosa',
    secondaryColor: 'bege',
    embroideryName: 'Laura',
    fabric: 'algodao',
    fabricName: 'Algodão Egípcio Premium',
    embroideryStyle: 'script',
    embroideryStyleName: 'Script (Cursiva)'
  }
];