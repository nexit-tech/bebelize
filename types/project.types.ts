export type ProjectStatus = 
  | 'rascunho'
  | 'negociacao' 
  | 'aprovado' 
  | 'producao' 
  | 'finalizado' 
  | 'cancelado';

export type ProjectPriority = 'normal' | 'urgente';

export interface ProjectCustomization {
  fabric: string;
  fabricName: string;
  primaryColor: string;
  secondaryColor: string;
  embroideryName: string;
  embroideryStyle: string;
  embroideryStyleName: string;
  observations?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  consultantId: string;
  consultantName: string;
  collectionId: string;
  collectionName: string;
  customization: ProjectCustomization;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
  productionNotes?: string;
}

export interface ProjectCreateInput {
  name: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  collectionId: string;
  customization: ProjectCustomization;
  priority?: ProjectPriority;
  deliveryDate?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  customization?: Partial<ProjectCustomization>;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  deliveryDate?: string;
  productionNotes?: string;
}