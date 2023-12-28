import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Profil from './Profil';
import { UserProvider } from '../Auth/UserContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve('mocked-token')),
  }));

describe('Profil Component', () => {
    it("Test de Composant: affiche le chargement lorsqu\'aucun utilisateur n\'est pas connecté", () => {
        const { getByText } = render(
            <UserProvider>
                <Profil />
            </UserProvider>
        );

        expect(getByText('Chargement...')).toBeTruthy();
    });
    // Test pour vérifier l'intégration avec AsyncStorage
    it("Test d'Intégration: récupère le token utilisateur depuis AsyncStorage", async () => {
        jest.spyOn(AsyncStorage, 'getItem').mockImplementation(() => Promise.resolve('mocked-token'));

        render(
            <UserProvider>
                <Profil />
            </UserProvider>
        );

        // Vérifie si getItem a été appelé pour récupérer le token
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('userToken');
    });

    // Test pour vérifier l'accessibilité des éléments du composant
    it("Test d'Interface Utilisateur: a des éléments accessibles", () => {
        const { getByText } = render(
            <UserProvider>
                <Profil />
            </UserProvider>
        );

        // vérifie que le titre est accessible
        const title = getByText('Mon profil');
        expect(title.props.accessibilityRole).toBe('header');

    });
    it(' Test de Performance : charge  rapidement', async () => {
        const start = performance.now();

        render(<UserProvider>
            <Profil />
        </UserProvider>);



        const end = performance.now();
        expect(end - start).toBeLessThan(2000);
    });



});
