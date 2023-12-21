import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Match from './Match'; 
import { UserProvider } from './UserContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve('mocked-token')),
  }));
describe('Match Component', () => {

    it(' Test de Performance : charge les matchs rapidement', async () => {
        const start = performance.now();

        render(<UserProvider><Match /></UserProvider>);

        const end = performance.now();
        expect(end - start).toBeLessThan(2000);
    });



});