import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Joueurs from './Joueurs'; 
import { UserProvider } from './UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve('mocked-token')),
  }));
  
describe('Joueurs Component', () => {
    it('affiche une liste de joueurs', async () => {
        const fakeJoueurs = [
            { user_id: 1, prenom: 'Alice', nom: 'Smith', total_victoires: 5, total_defaites: 2 },
            { user_id: 2, prenom: 'Bob', nom: 'Brown', total_victoires: 3, total_defaites: 4 }
          
        ];

        jest.spyOn(global, 'fetch').mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve(fakeJoueurs)
            })
        );

        const { findByText } = render(<UserProvider><Joueurs/></UserProvider>);

        await waitFor(() => {
            expect(findByText('Alice Smith')).toBeTruthy();
          });
          
    });

    it('filtre les joueurs en fonction de la recherche', async () => {
    
      
        const { getByPlaceholderText, findByText } = render(<UserProvider><Joueurs /></UserProvider>);
        const searchBox = getByPlaceholderText('Rechercher un joueur');
      
        fireEvent.changeText(searchBox, 'Alice');
      
        expect(await findByText('Alice Smith')).toBeTruthy();
        expect(searchBox.props.value).toBe('Alice');
      });
      


})
