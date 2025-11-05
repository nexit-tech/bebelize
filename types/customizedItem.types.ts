import { Item } from './item.types';

export interface ItemCustomization {
  fabricId: string;
  primaryColorId: string;
  secondaryColorId: string;
  embroideryName: string;
  embroideryStyle: string;
}

export interface CustomizedItem extends Item, ItemCustomization {
  // O id do CustomizedItem precisa ser único, pois o mesmo ITEM (ID original) 
  // pode ser adicionado múltiplas vezes com personalizações diferentes.
  cartItemId: string; 
}