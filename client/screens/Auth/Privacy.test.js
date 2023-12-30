import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import { UserProvider } from './UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve('mocked-token')),
}));
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));


describe('PrivacyPolicyScreen', () => {

    it("S'affiche correctmeent ", () => {
        const { getByText } = render(

            <UserProvider>
                <PrivacyPolicyScreen />
            </UserProvider>
        );

        expect(getByText('Politique de Confidentialité')).toBeTruthy();
        expect(getByText('Votre vie privée est importante pour nous. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.')).toBeTruthy();
    });

    it('Affiche les informations de sections', () => {
        const { getByText } = render(
            <UserProvider>
                <PrivacyPolicyScreen />
            </UserProvider>
        );

        expect(getByText('Informations que nous collectons')).toBeTruthy();
        expect(getByText('Utilisation des informations')).toBeTruthy();
        expect(getByText('Partage des informations')).toBeTruthy();
        expect(getByText('Sécurité des informations')).toBeTruthy();
        expect(getByText('Vos droits')).toBeTruthy();
        expect(getByText('Contact')).toBeTruthy();
    });

});
