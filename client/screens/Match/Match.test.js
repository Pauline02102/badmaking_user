import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Match from './Match';
import { UserProvider } from '../Auth/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('mocked-token')),
}));

jest.mock('react-native-modal', () => 'Modal');

describe('Match Component', () => {
  beforeEach(() => {
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(/* Mocked response data */),
      })
    );
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <UserProvider>
        <Match />
      </UserProvider>
    );

    expect(getByText('Matchs')).toBeTruthy();

  });



  


  

  afterEach(() => {
    jest.clearAllMocks();
  });
});
