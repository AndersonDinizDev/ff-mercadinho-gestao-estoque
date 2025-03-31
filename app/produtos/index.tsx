import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ProductItem from '../../components/ProductItem';
import { useStorage, Product } from '../../hooks/useStorage';

const ProductListScreen: React.FC = () => {
  const { getProducts, getLowStockProducts } = useStorage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState<boolean>(false);
  
  useFocusEffect(
    useCallback(() => {
      loadProducts();
      return () => {};
    }, [])
  );
  
  useEffect(() => {
    filterProducts();
  }, [searchQuery, products, showLowStock]);
  
  const loadProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filterProducts = async (): Promise<void> => {
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (showLowStock) {
      const lowStock = await getLowStockProducts();
      const lowStockIds = lowStock.map(p => p.id);
      filtered = filtered.filter(p => lowStockIds.includes(p.id));
    }
    
    setFilteredProducts(filtered);
  };
  
  const handleProductPress = (product: Product): void => {
    router.push(`/produtos/${product.id}`);
  };
  
  const renderEmptyList = (): React.ReactElement => (
    <View style={styles.emptyContainer}>
      <Feather name="package" size={50} color="#ccc" />
      <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
      {showLowStock && (
        <Text style={styles.emptySubtext}>Não há produtos com estoque baixo</Text>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity 
          style={[styles.filterButton, showLowStock && styles.filterActiveButton]} 
          onPress={() => setShowLowStock(!showLowStock)}
        >
          <Feather 
            name="alert-circle" 
            size={20} 
            color={showLowStock ? "#FFF" : "#555"} 
          />
          <Text style={[styles.filterText, showLowStock && styles.filterActiveText]}>
            Estoque Baixo
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4A80F0" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductItem product={item} onPress={handleProductPress} />
          )}
          contentContainerStyle={filteredProducts.length === 0 ? styles.emptyListContent : undefined}
          ListEmptyComponent={renderEmptyList}
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/produtos/adicionar')}
      >
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  filterActiveButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  filterText: {
    color: '#555',
    marginLeft: 4,
    fontSize: 14,
  },
  filterActiveText: {
    color: '#FFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ProductListScreen;