import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Joueurs from './Joueurs';
import { UserProvider } from '../Auth/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve('mocked-token')),
}));

describe('Joueurs Component', () => {
    it('renders correctly', () => {
        const { getByText } = render(
            <UserProvider>
                <Joueurs />
            </UserProvider>
        );

        expect(getByText('Résultats')).toBeTruthy();
    });

    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([
                    { user_id: 1, prenom: 'Alice', nom: 'Smith', total_victoires: 3, total_defaites: 1, date: '2023-01-01' }
                    // Add other mock joueur objects here
                ]),
            })
        );
    });

    // Assuming fetchJoueurs function populates the joueurs state
    it('fetches and displays joueur data', async () => {
        const { findByText } = render(
            <UserProvider>
                <Joueurs />
            </UserProvider>
        );

        const joueurName = await findByText('Alice Smith');
        expect(joueurName).toBeTruthy();
    });


    // Cleanup mock
    afterEach(() => {
        jest.restoreAllMocks();
    });
});
