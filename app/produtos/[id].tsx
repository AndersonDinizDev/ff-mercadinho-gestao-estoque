import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { 
  useStorage, 
  Product, 
  StockMovement 
} from '../../hooks/useStorage';

const ProductDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    getProductById, 
    getProductMovements, 
    addStockMovement,
    deleteProduct
  } = useStorage();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [movementQuantity, setMovementQuantity] = useState<string>('');
  const [movementReason, setMovementReason] = useState<string>('');
  const [processingMovement, setProcessingMovement] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  const loadProductData = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!id) {
        Alert.alert('Erro', 'ID do produto inválido');
        router.back();
        return;
      }
      
      const productData = await getProductById(id);
      if (!productData) {
        Alert.alert('Erro', 'Produto não encontrado');
        router.back();
        return;
      }
      
      setProduct(productData);
      
      const movementsData = await getProductMovements(id);
      setMovements(movementsData);
    } catch (error) {
      console.error('Erro ao carregar dados do produto:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do produto');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (): void => {
    if (product) {
      router.push(`/produtos/editar/${product.id}`);
    }
  };

  const handleDeleteProduct = (): void => {
    if (!product) return;
    
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o produto "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Sucesso', 'Produto excluído com sucesso');
              router.back();
            } catch (error) {
              console.error('Erro ao excluir produto:', error);
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            }
          }
        },
      ]
    );
  };

  const openMovementModal = (type: 'entrada' | 'saida'): void => {
    setMovementType(type);
    setMovementQuantity('');
    setMovementReason('');
    setModalVisible(true);
  };

  const handleAddMovement = async (): Promise<void> => {
    if (!product) return;
    
    if (!movementQuantity || parseFloat(movementQuantity) <= 0) {
      Alert.alert('Erro', 'Por favor, informe uma quantidade válida');
      return;
    }

    setProcessingMovement(true);
    try {
      const quantity = parseFloat(movementQuantity);
      
      // Verificar se há estoque suficiente para saída
      if (movementType === 'saida' && quantity > product.stockQuantity) {
        Alert.alert('Erro', 'Quantidade insuficiente em estoque');
        return;
      }

      await addStockMovement({
        productId: product.id,
        type: movementType,
        quantity,
        reason: movementReason || (movementType === 'entrada' ? 'Compra' : 'Venda')
      });

      setModalVisible(false);
      await loadProductData();
      Alert.alert('Sucesso', `${movementType === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso`);
    } catch (error) {
      console.error('Erro ao registrar movimento:', error);
      Alert.alert('Erro', `Não foi possível registrar a ${movementType === 'entrada' ? 'entrada' : 'saída'}`);
    } finally {
      setProcessingMovement(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A80F0" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Produto não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <View style={styles.stockContainer}>
              <Text style={[
                styles.stockText, 
                product.stockQuantity <= product.minStockLevel && styles.lowStockText
              ]}>
                Estoque: {product.stockQuantity} {product.unit}
              </Text>
              {product.stockQuantity <= product.minStockLevel && (
                <View style={styles.warningBadge}>
                  <Feather name="alert-circle" size={12} color="#FFF" />
                  <Text style={styles.warningText}>Estoque Baixo</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleEditProduct}
            >
              <Feather name="edit-2" size={20} color="#4A80F0" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDeleteProduct}
            >
              <Feather name="trash-2" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Detalhes do Produto</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Preço de Venda:</Text>
            <Text style={styles.detailValue}>R$ {product.price.toFixed(2)}</Text>
          </View>
          
          {product.costPrice > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preço de Custo:</Text>
              <Text style={styles.detailValue}>R$ {product.costPrice.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estoque Mínimo:</Text>
            <Text style={styles.detailValue}>{product.minStockLevel} {product.unit}</Text>
          </View>
          
          {product.barcode && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Código de Barras:</Text>
              <Text style={styles.detailValue}>{product.barcode}</Text>
            </View>
          )}
          
          {product.expirationDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data de Validade:</Text>
              <Text style={styles.detailValue}>{formatDate(product.expirationDate)}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data de Cadastro:</Text>
            <Text style={styles.detailValue}>{formatDate(product.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.movementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Movimentações</Text>
            <View style={styles.movementButtons}>
              <TouchableOpacity 
                style={[styles.movementButton, styles.entryButton]} 
                onPress={() => openMovementModal('entrada')}
              >
                <Feather name="plus-circle" size={16} color="#FFF" />
                <Text style={styles.movementButtonText}>Entrada</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.movementButton, styles.exitButton]}
                onPress={() => openMovementModal('saida')}
              >
                <Feather name="minus-circle" size={16} color="#FFF" />
                <Text style={styles.movementButtonText}>Saída</Text>
              </TouchableOpacity>
            </View>
          </View>

          {movements.length === 0 ? (
            <View style={styles.emptyMovements}>
              <Feather name="activity" size={40} color="#DDD" />
              <Text style={styles.emptyMovementsText}>Nenhuma movimentação registrada</Text>
            </View>
          ) : (
            movements
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(movement => (
                <View key={movement.id} style={styles.movementItem}>
                  <View style={styles.movementHeader}>
                    <View style={styles.movementType}>
                      <Feather 
                        name={movement.type === 'entrada' ? 'plus-circle' : 'minus-circle'} 
                        size={16} 
                        color={movement.type === 'entrada' ? '#2C7D4F' : '#FF3B30'} 
                      />
                      <Text 
                        style={[
                          styles.movementTypeText,
                          { color: movement.type === 'entrada' ? '#2C7D4F' : '#FF3B30' }
                        ]}
                      >
                        {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </Text>
                    </View>
                    <Text style={styles.movementDate}>
                      {formatDate(movement.date)}
                    </Text>
                  </View>
                  
                  <View style={styles.movementDetails}>
                    <Text style={styles.movementQuantity}>
                      {movement.type === 'entrada' ? '+' : '-'} {movement.quantity} {product.unit}
                    </Text>
                    {movement.reason && (
                      <Text style={styles.movementReason}>{movement.reason}</Text>
                    )}
                  </View>
                </View>
              ))
          )}
        </View>
      </ScrollView>

      {/* Modal para registrar movimento */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {movementType === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                disabled={processingMovement}
              >
                <Feather name="x" size={20} color="#777" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quantidade *</Text>
                <TextInput
                  style={styles.input}
                  value={movementQuantity}
                  onChangeText={setMovementQuantity}
                  placeholder="0"
                  keyboardType="numeric"
                  editable={!processingMovement}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Motivo (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={movementReason}
                  onChangeText={setMovementReason}
                  placeholder={movementType === 'entrada' ? "Ex: Compra, Devolução" : "Ex: Venda, Perda"}
                  editable={!processingMovement}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={processingMovement}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  movementType === 'entrada' ? styles.confirmEntryButton : styles.confirmExitButton
                ]}
                onPress={handleAddMovement}
                disabled={processingMovement}
              >
                {processingMovement ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  lowStockText: {
    color: '#FF3B30',
  },
  warningBadge: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    marginLeft: 8,
  },
  warningText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  productActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#777',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  movementsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  movementButtons: {
    flexDirection: 'row',
  },
  movementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  entryButton: {
    backgroundColor: '#2C7D4F',
  },
  exitButton: {
    backgroundColor: '#FF3B30',
  },
  movementButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyMovements: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMovementsText: {
    marginTop: 8,
    color: '#777',
    textAlign: 'center',
  },
  movementItem: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  movementType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  movementDate: {
    fontSize: 12,
    color: '#777',
  },
  movementDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movementQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  movementReason: {
    fontSize: 14,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  confirmEntryButton: {
    backgroundColor: '#2C7D4F',
  },
  confirmExitButton: {
    backgroundColor: '#FF3B30',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;