export interface Item {
  id: string;
  collectionId: string;
  name: string;
  description: string;
  code: string;
}

export interface ItemCreateInput {
  collectionId: string;
  name: string;
  description: string;
  code: string;
}

export interface ItemUpdateInput {
  name?: string;
  description?: string;
  code?: string;
}