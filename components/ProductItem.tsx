import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Product } from '../hooks/useStorage';

interface ProductItemProps {
  product: Product;
  onPress: (product: Product) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {

  const isLowStock = product.stockQuantity <= product.minStockLevel;
  
  const isExpiring = (): boolean => {
    if (!product.expirationDate) return false;
    
    const expirationDate = new Date(product.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30 && diffDays >= 0;
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, isLowStock && styles.lowStockContainer]}
      onPress={() => onPress(product)}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
          <View style={styles.quantityContainer}>
            <Text style={[
              styles.quantity, 
              isLowStock && styles.lowStockText
            ]}>
              Estoque: {product.stockQuantity} {product.unit}
            </Text>
          </View>
        </View>
        
        {isExpiring() && (
          <View style={styles.warningContainer}>
            <Feather name="alert-triangle" size={14} color="#FF6B00" />
            <Text style={styles.warningText}>
              Vence em {calculateDaysToExpiration(product.expirationDate)} dias
            </Text>
          </View>
        )}
      </View>
      <View style={styles.arrowContainer}>
        <Feather name="chevron-right" size={24} color="#777" />
      </View>
    </TouchableOpacity>
  );
};

const calculateDaysToExpiration = (expirationDateStr?: string): number => {
  if (!expirationDateStr) return 0;
  
  const expirationDate = new Date(expirationDateStr);
  const today = new Date();
  const diffTime = expirationDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  lowStockContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C7D4F',
  },
  quantityContainer: {
    borderRadius: 4,
    padding: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#444',
  },
  lowStockText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  warningText: {
    color: '#FF6B00',
    fontSize: 12,
    marginLeft: 4,
  },
  arrowContainer: {
    marginLeft: 10,
  },
});

export default ProductItem;