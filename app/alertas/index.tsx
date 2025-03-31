import React, { useState, useEffect, useCallback } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStorage, Product } from '../../hooks/useStorage';

const AlertsScreen: React.FC = () => {
  const { getLowStockProducts, getExpiringProducts } = useStorage();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'lowStock' | 'expiring'>('lowStock');
  const [loading, setLoading] = useState<boolean>(true);
  
  useFocusEffect(
    useCallback(() => {
      loadAlerts();
      return () => {};
    }, [])
  );
  
  const loadAlerts = async (): Promise<void> => {
    setLoading(true);
    try {
      const lowStock = await getLowStockProducts();
      setLowStockProducts(lowStock);

      const expiring = await getExpiringProducts(30);
      setExpiringProducts(expiring);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProductPress = (product: Product): void => {
    router.push(`/produtos/${product.id}`);
  };
  
  const renderLowStockItem = ({ item }: { item: Product }): React.ReactElement => (
    <TouchableOpacity
      style={styles.alertItem}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.alertIconContainer}>
        <Feather name="alert-circle" size={24} color="#FF3B30" />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>
            Estoque: <Text style={styles.stockValue}>{item.stockQuantity} {item.unit}</Text>
          </Text>
          <Text style={styles.stockText}>
            Mínimo: <Text style={styles.stockValue}>{item.minStockLevel} {item.unit}</Text>
          </Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#777" />
    </TouchableOpacity>
  );

  const renderExpiringItem = ({ item }: { item: Product }): React.ReactElement => {
    if (!item.expirationDate) return <></>;
    
    const expirationDate = new Date(item.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return (
      <TouchableOpacity
        style={styles.alertItem}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.alertIconContainer}>
          <Feather name="clock" size={24} color="#FF9500" />
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={styles.expirationInfo}>
            <Text style={styles.expirationText}>
              Vence em: <Text style={styles.expirationValue}>{diffDays} dias</Text>
            </Text>
            <Text style={styles.expirationDate}>
              {expirationDate.toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color="#777" />
      </TouchableOpacity>
    );
  };

  const renderEmptyList = (): React.ReactElement => (
    <View style={styles.emptyContainer}>
      <Feather 
        name={activeTab === 'lowStock' ? 'check-circle' : 'check'} 
        size={50} 
        color="#4CD964" 
      />
      <Text style={styles.emptyText}>
        {activeTab === 'lowStock' 
          ? 'Nenhum produto com estoque baixo' 
          : 'Nenhum produto próximo ao vencimento'
        }
      </Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'lowStock'
          ? 'Todos os produtos estão com estoque acima do mínimo'
          : 'Todos os produtos estão com data de validade adequada'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lowStock' && styles.activeTab]}
          onPress={() => setActiveTab('lowStock')}
        >
          <Feather 
            name="alert-circle" 
            size={18} 
            color={activeTab === 'lowStock' ? '#FF3B30' : '#777'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'lowStock' && styles.activeTabText
            ]}
          >
            Estoque Baixo ({lowStockProducts.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expiring' && styles.activeTab]}
          onPress={() => setActiveTab('expiring')}
        >
          <Feather 
            name="clock" 
            size={18} 
            color={activeTab === 'expiring' ? '#FF9500' : '#777'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'expiring' && styles.activeTabText
            ]}
          >
            Próximos ao Vencimento ({expiringProducts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A80F0" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'lowStock' ? lowStockProducts : expiringProducts}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'lowStock' ? renderLowStockItem : renderExpiringItem}
          contentContainerStyle={
            (activeTab === 'lowStock' && lowStockProducts.length === 0) || 
            (activeTab === 'expiring' && expiringProducts.length === 0) 
              ? styles.emptyListContent 
              : undefined
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4A80F0',
  },
  tabText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productCategory: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockText: {
    fontSize: 14,
    color: '#555',
  },
  stockValue: {
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  expirationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expirationText: {
    fontSize: 14,
    color: '#555',
  },
  expirationValue: {
    fontWeight: 'bold',
    color: '#FF9500',
  },
  expirationDate: {
    fontSize: 13,
    color: '#777',
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AlertsScreen;