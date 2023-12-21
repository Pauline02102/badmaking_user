import React from 'react';
import { render } from '@testing-library/react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserProvider } from './UserContext'; 
import Calendrier from './Calendrier'; // Assurez-vous que le chemin est correct
import { Platform ,  KeyboardAvoidingView} from 'react-native';

// Mock pour Platform
Platform.OS = 'ios'; // ou 'android' selon le besoin de votre test

// Ensuite, importez vos composants et bibliothèques

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock pour 'route'
const mockRoute = {
  params: {
    prenom: 'Pauline', 
    setprenom: jest.fn(),
    id: '1',
    setId: jest.fn(),
    // Ajoutez d'autres paramètres nécessaires
  },
};

describe('Calendrier Component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('charge les événements depuis l\'API', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 1, title: 'Événement 1', date: '2023-03-15' },
        // Autres événements mockés...
      ],
    });
    AsyncStorage.getItem.mockResolvedValue('token-mocké');

    const { findByText } = render(<UserProvider><Calendrier route={mockRoute} /></UserProvider>);

    const event = await findByText('Événement 1');
    expect(event).toBeTruthy();
  });

  // Ajoutez d'autres tests selon vos besoins
});
