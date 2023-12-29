import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignupScreen from './inscription';
import { UserProvider } from '../Auth/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';


jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve('mocked-token')),
}));
jest.mock('react-native-dropdown-select-list', () => {
    return {
        SelectList: () => null,
    };
});
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesomeMock');

jest.mock('react-native-picker-select', () => 'PickerSelectMock');


describe('SignupScreen Component', () => {

    const MockedNavigation = ({ children }) => (
        <NavigationContainer>{children}</NavigationContainer>
    );
    it("Test d'Interface Utilisateur: affiche le formulaire d'inscription", () => {
        const { getByPlaceholderText, getByText, getByTestId } = render(
            <MockedNavigation>
                <SignupScreen />
            </MockedNavigation>
        );

        expect(getByPlaceholderText('Nom')).toBeTruthy();
        expect(getByPlaceholderText('Prenom')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
        expect(getByTestId('inscriptionText')).toBeTruthy();
    });

    it("Test d'Interface Utilisateur: coche/décoche la case de consentement", async () => {
        const { getByTestId } = render(
            <MockedNavigation>
                <SignupScreen />
            </MockedNavigation>
        );

        const checkbox = getByTestId("consentCheckbox");

        expect(checkbox.props.value).toBe(false);

        fireEvent(checkbox, "onValueChange", true);

        expect(checkbox.props.value).toBe(true);

        fireEvent(checkbox, "onValueChange", false);

        expect(checkbox.props.value).toBe(false);
    });

});
