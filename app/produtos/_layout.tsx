import React from 'react';
import { Stack } from 'expo-router';

export default function ProdutosLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Produtos',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalhes do Produto',
        }}
      />
      <Stack.Screen
        name="adicionar"
        options={{
          title: 'Novo Produto',
        }}
      />
      <Stack.Screen
        name="editar/[id]"
        options={{
          title: 'Editar Produto',
        }}
      />
    </Stack>
  );
}