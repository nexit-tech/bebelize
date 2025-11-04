export interface Collection {
  id: string;
  name: string;
  theme: string;
  description: string;
  itemCount: number;
  createdAt: string;
  imageUrl?: string;
  active: boolean;
}

export interface CollectionCreateInput {
  name: string;
  theme: string;
  description: string;
}

export interface CollectionUpdateInput {
  name?: string;
  theme?: string;
  description?: string;
  active?: boolean;
}