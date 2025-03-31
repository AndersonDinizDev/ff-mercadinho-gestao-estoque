// hooks/useStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export interface Product {
  id: string;
  name: string;
  barcode?: string;
  category: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  expirationDate?: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'entrada' | 'saida';
  quantity: number;
  date: string;
  reason?: string;
  documentNumber?: string;
  notes?: string;
}

const PRODUCTS_STORAGE_KEY = '@FFMercadinho:products';
const STOCK_MOVEMENTS_STORAGE_KEY = '@FFMercadinho:stockMovements';

export const useStorage = () => {
  // Funções para gerenciar produtos
  const getProducts = async (): Promise<Product[]> => {
    try {
      const productsJSON = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      return productsJSON ? JSON.parse(productsJSON) : [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  };

  const saveProducts = async (products: Product[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
    try {
      const products = await getProducts();
      const newProduct: Product = {
        ...product,
        id: uuid.v4() as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await saveProducts([...products, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      return null;
    }
  };

  const updateProduct = async (updatedProduct: Product): Promise<Product | null> => {
    try {
      const products = await getProducts();
      const updatedProducts = products.map(product => 
        product.id === updatedProduct.id 
          ? {...updatedProduct, updatedAt: new Date().toISOString()} 
          : product
      );
      
      await saveProducts(updatedProducts);
      return updatedProduct;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return null;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const products = await getProducts();
      const updatedProducts = products.filter(product => product.id !== productId);
      
      await saveProducts(updatedProducts);
      return true;
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return false;
    }
  };

  const getProductById = async (productId: string): Promise<Product | null> => {
    try {
      const products = await getProducts();
      const product = products.find(product => product.id === productId);
      return product || null;
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      return null;
    }
  };

  const getStockMovements = async (): Promise<StockMovement[]> => {
    try {
      const movementsJSON = await AsyncStorage.getItem(STOCK_MOVEMENTS_STORAGE_KEY);
      return movementsJSON ? JSON.parse(movementsJSON) : [];
    } catch (error) {
      console.error('Erro ao buscar movimentações de estoque:', error);
      return [];
    }
  };

  const saveStockMovements = async (movements: StockMovement[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STOCK_MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
    } catch (error) {
      console.error('Erro ao salvar movimentações de estoque:', error);
    }
  };

  const addStockMovement = async (movement: Omit<StockMovement, 'id' | 'date'>): Promise<StockMovement | null> => {
    try {
      const movements = await getStockMovements();
      const product = await getProductById(movement.productId);
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      
      const newMovement: StockMovement = {
        ...movement,
        id: uuid.v4() as string,
        date: new Date().toISOString(),
      };
      
      let newQuantity = product.stockQuantity;
      
      if (movement.type === 'entrada') {
        newQuantity += movement.quantity;
      } else if (movement.type === 'saida') {
        newQuantity -= movement.quantity;
        
        if (newQuantity < 0) {
          throw new Error('Quantidade insuficiente em estoque');
        }
      }
      
      await updateProduct({
        ...product,
        stockQuantity: newQuantity
      });
      
      await saveStockMovements([...movements, newMovement]);
      return newMovement;
    } catch (error) {
      console.error('Erro ao adicionar movimentação de estoque:', error);
      throw error;
    }
  };

  const getProductMovements = async (productId: string): Promise<StockMovement[]> => {
    try {
      const movements = await getStockMovements();
      return movements.filter(movement => movement.productId === productId);
    } catch (error) {
      console.error('Erro ao buscar movimentações do produto:', error);
      return [];
    }
  };

  const getLowStockProducts = async (): Promise<Product[]> => {
    try {
      const products = await getProducts();
      return products.filter(product => product.stockQuantity <= product.minStockLevel);
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      return [];
    }
  };

  const getExpiringProducts = async (daysThreshold: number = 30): Promise<Product[]> => {
    try {
      const products = await getProducts();
      const today = new Date();
      
      return products.filter(product => {
        if (!product.expirationDate) return false;
        
        const expirationDate = new Date(product.expirationDate);
        const diffTime = expirationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= daysThreshold && diffDays >= 0;
      });
    } catch (error) {
      console.error('Erro ao buscar produtos próximos do vencimento:', error);
      return [];
    }
  };

  const clearAllData = async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(PRODUCTS_STORAGE_KEY);
      await AsyncStorage.removeItem(STOCK_MOVEMENTS_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  };

  return {
    getProducts,
    saveProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getStockMovements,
    saveStockMovements,
    addStockMovement,
    getProductMovements,
    getLowStockProducts,
    getExpiringProducts,
    clearAllData
  };
};