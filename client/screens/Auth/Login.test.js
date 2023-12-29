import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from './Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './UserContext';
import { useNavigation } from "@react-navigation/native";


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

describe('LoginScreen Component', () => {

    const MockedNavigation = ({ children }) => (
        <NavigationContainer>{children}</NavigationContainer>
    );
    it('affiche le texte "Connexion"', () => {
        const { getByTestId } = render(<NavigationContainer>
            <UserProvider>
                <LoginScreen />
            </UserProvider>
        </NavigationContainer>);
        const connexionText = getByTestId('ConnexionText');
        expect(connexionText).toBeTruthy();
    });

    it('permet de saisir un email', () => {
        const { getByPlaceholderText } = render(
            <NavigationContainer>
                <UserProvider>
                    <LoginScreen />
                </UserProvider>
            </NavigationContainer>
        );
        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'test@example.com');
        expect(emailInput.props.value).toBe('test@example.com');
    });


    it('permet de saisir un mot de passe', () => {
        const { getByPlaceholderText } = render(<NavigationContainer>
            <UserProvider>
                <LoginScreen />
            </UserProvider>
        </NavigationContainer>);
        const passwordInput = getByPlaceholderText('Mot de passe');
        fireEvent.changeText(passwordInput, 'password123');
        expect(passwordInput.props.value).toBe('password123');
    });

    it('affiche la visibilité du mot de passe', () => {
        const { getByTestId } = render(<NavigationContainer>
            <UserProvider>
                <LoginScreen />
            </UserProvider>
        </NavigationContainer>);
        const passwordInput = getByTestId('passwordInput');
        const eyeIcon = getByTestId('eyeIcon');

        fireEvent.press(eyeIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);

        fireEvent.press(eyeIcon);
        expect(passwordInput.props.secureTextEntry).toBe(true);
    });

});
