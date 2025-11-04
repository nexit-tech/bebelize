import { User } from '@/types';

export const usersData: User[] = [
  {
    id: 'user-001',
    name: 'Ana Paula Silva',
    email: 'ana.silva@bebelize.com',
    password: 'senha123',
    role: 'consultora',
    createdAt: '2024-01-15',
    active: true
  },
  {
    id: 'user-002',
    name: 'Carla Mendes',
    email: 'carla.mendes@bebelize.com',
    password: 'senha123',
    role: 'consultora',
    createdAt: '2024-02-10',
    active: true
  },
  {
    id: 'user-003',
    name: 'Beatriz Santos',
    email: 'beatriz.santos@bebelize.com',
    password: 'senha123',
    role: 'consultora',
    createdAt: '2024-03-05',
    active: true
  },
  {
    id: 'user-004',
    name: 'Carlos Silva',
    email: 'carlos.silva@bebelize.com',
    password: 'senha123',
    role: 'atelier',
    createdAt: '2024-01-20',
    active: true
  },
  {
    id: 'user-005',
    name: 'Marina Costa',
    email: 'marina.costa@bebelize.com',
    password: 'senha123',
    role: 'atelier',
    createdAt: '2024-02-15',
    active: true
  },
  {
    id: 'user-admin',
    name: 'Administrador',
    email: 'admin@bebelize.com',
    password: 'admin123',
    role: 'admin',
    createdAt: '2024-01-01',
    active: true
  }
];