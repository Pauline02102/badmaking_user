import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Match from './Match'; // Assurez-vous que le chemin est correct
import { UserProvider } from './UserContext'; // Utilisez le chemin correct
import AsyncStorage from '@react-native-async-storage/async-storage';


describe('Match Component', () => {

    it(' Test de Performance : charge les matchs rapidement', async () => {
        const start = performance.now();

        render(<UserProvider><Match /></UserProvider>);



        const end = performance.now();
        expect(end - start).toBeLessThan(2000);
    });



});