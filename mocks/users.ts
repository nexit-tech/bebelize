export interface User {
  id: string;
  name: string;
  email: string;
  role: 'consultora' | 'producao' | 'admin';
}

export const mockUsers: User[] = [
  {
    id: 'ana',
    name: 'Ana Paula Silva',
    email: 'ana@bebelize.com',
    role: 'consultora'
  },
  {
    id: 'carla',
    name: 'Carla Mendes',
    email: 'carla@bebelize.com',
    role: 'consultora'
  },
  {
    id: 'juliana',
    name: 'Juliana Costa',
    email: 'juliana@bebelize.com',
    role: 'consultora'
  },
  {
    id: 'beatriz',
    name: 'Beatriz Santos',
    email: 'beatriz@bebelize.com',
    role: 'consultora'
  },
  {
    id: 'carlos',
    name: 'Carlos Silva',
    email: 'carlos@bebelize.com',
    role: 'producao'
  },
  {
    id: 'admin',
    name: 'Administrador',
    email: 'admin@bebelize.com',
    role: 'admin'
  }
];