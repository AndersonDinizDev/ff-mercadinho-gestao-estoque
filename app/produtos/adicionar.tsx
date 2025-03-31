import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useStorage } from '../../hooks/useStorage';

type UnitOption = 'un' | 'kg' | 'g' | 'L' | 'mL' | 'cx' | 'pct';

const AddProductScreen: React.FC = () => {
  const { addProduct } = useStorage();
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('');
  const [minStockLevel, setMinStockLevel] = useState<string>('');
  const [unit, setUnit] = useState<UnitOption>('un');
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);


  const unitOptions: UnitOption[] = ['un', 'kg', 'g', 'L', 'mL', 'cx', 'pct'];

  const handleSave = async (): Promise<void> => {

    if (!name || !category || !price || !stockQuantity || !minStockLevel) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const newProduct = {
        name,
        category,
        barcode: barcode || '',
        price: parseFloat(price.replace(',', '.')),
        costPrice: parseFloat(costPrice.replace(',', '.') || '0'),
        stockQuantity: parseInt(stockQuantity, 10),
        minStockLevel: parseInt(minStockLevel, 10),
        unit,
        expirationDate: expirationDate ? expirationDate.toISOString() : undefined,
      };

      await addProduct(newProduct);
      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const showDatePicker = (): void => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = (): void => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date: Date): void => {
    setExpirationDate(date);
    hideDatePicker();
  };

  const formatExpirationDate = (): string => {
    if (!expirationDate) return '';
    return `${expirationDate.getDate().toString().padStart(2, '0')}/${(expirationDate.getMonth() + 1).toString().padStart(2, '0')}/${expirationDate.getFullYear()}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do Produto *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Arroz Branco 5kg"
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoria *</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Ex: Alimentos, Limpeza, etc."
              maxLength={30}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Código de Barras (Opcional)</Text>
            <TextInput
              style={styles.input}
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Digite o código de barras"
              keyboardType="number-pad"
              maxLength={15}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Valores</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preço de Venda *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="R$ 0,00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preço de Custo (Opcional)</Text>
            <TextInput
              style={styles.input}
              value={costPrice}
              onChangeText={setCostPrice}
              placeholder="R$ 0,00"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Controle de Estoque</Text>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 2 }]}>
              <Text style={styles.label}>Quantidade Atual *</Text>
              <TextInput
                style={styles.input}
                value={stockQuantity}
                onChangeText={setStockQuantity}
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 16 }]}>
              <Text style={styles.label}>Unidade</Text>
              <View style={styles.unitContainer}>
                {unitOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.unitOption,
                      unit === option && styles.unitOptionSelected,
                    ]}
                    onPress={() => setUnit(option)}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        unit === option && styles.unitTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Estoque Mínimo *</Text>
            <TextInput
              style={styles.input}
              value={minStockLevel}
              onChangeText={setMinStockLevel}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Data de Validade (Opcional)</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
              <Text style={styles.datePickerText}>
                {expirationDate ? formatExpirationDate() : 'Selecionar data'}
              </Text>
              <Feather name="calendar" size={20} color="#777" />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
              minimumDate={new Date()}
            />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Produto</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    padding: 16,
  },
  formSection: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 8,
    marginBottom: 8,
  },
  unitOptionSelected: {
    backgroundColor: '#4A80F0',
    borderColor: '#4A80F0',
  },
  unitText: {
    color: '#555',
    fontSize: 14,
  },
  unitTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddProductScreen;