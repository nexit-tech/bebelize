import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { Item } from '@/types';
import Input from '../Input/Input';
import CartItemCard from '../CartItemCard/CartItemCard';
import styles from './ProjetoCarrinho.module.css';

interface ProjetoCarrinhoProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  cartItems: Item[];
  onRemoveItem: (itemId: string) => void;
}

export default function ProjetoCarrinho({
  projectName,
  onProjectNameChange,
  cartItems,
  onRemoveItem,
}: ProjetoCarrinhoProps) {
  return (
    <div className={styles.container}>
      <Input
        type="text"
        id="projectName"
        label="Nome do Projeto"
        placeholder="Ex: Enxoval - Maria Alice"
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value)}
        required
      />

      <h3 className={styles.title}>Itens do Projeto</h3>

      {cartItems.length === 0 ? (
        <div className={styles.emptyState}>
          <FiShoppingCart size={64} className={styles.emptyIcon} />
          <p className={styles.emptyText}>Carrinho Vazio</p>
          <p className={styles.emptySubtext}>
            Adicione itens do catálogo ao lado.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {cartItems.map(item => (
            <CartItemCard 
              key={item.id} 
              item={item} 
              onRemove={onRemoveItem} 
            />
          ))}
        </div>
      )}
    </div>
  );
}