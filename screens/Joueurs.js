import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';
import { useUser } from "./UserContext";
import { Picker } from '@react-native-picker/picker';

const Joueurs = () => {
  const [joueurs, setJoueurs] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [joueurSelectionne, setJoueurSelectionne] = useState(null);
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);
  const { setIsSignedIn } = useUser();
  const [selectedDate, setSelectedDate] = useState(null);
  const [datesDisponibles, setDatesDisponibles] = useState([]);

  const toggleJoueurSelectionne = (id) => {
    setJoueurSelectionne(joueurSelectionne === id ? null : id);
  };

  const handleDateChange = (value) => {
    setSelectedDate(value);

    // Si "Toutes les dates confondues" est sélectionné, chargez tous les joueurs sans filtre de date.
    if (value === null) {
      fetchJoueurs();
    } else {
      // Sinon, chargez les joueurs pour la date sélectionnée.
      fetchJoueursByDate(value);
    }
  };
  const fetchJoueurs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/resultat/joueurs_resultats`);
      const data = await response.json();
      setJoueurs(data);
      console.log("date", data)
      const uniqueDates = [...new Set(data.map((joueur) => joueur.date))];
      setDatesDisponibles(uniqueDates);
      console.log(uniqueDates)
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
    }
  };

  const fetchJoueursByDate = async (date) => {
    try {
      const response = await fetch(`${BASE_URL}/resultat/joueurs_resultatsPardate/${date}`);
      const data = await response.json();
      setJoueurs(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
    }
  };


  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Page joueur : Token non trouvé');
        return;
      }
      const response = await fetch(`${BASE_URL}/user_tokens/get-user-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      if (data.success) {
        setUtilisateurConnecte(data.user);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'utilisateur:', error);
      setIsSignedIn(false);
    }
  };

  useEffect(() => {
    fetchJoueurs(); // Charge initialement les données
    fetchUserInfo();

    const intervalId = setInterval(() => {
      fetchUserInfo();
      fetchJoueurs(); // Rafraîchit les données toutes les 30 secondes
    }, 30000);

    return () => clearInterval(intervalId); // Nettoie l'intervalle lors du démontage du composant
  }, []);


  const handleSearch = (text) => {
    setRecherche(text);

    // Si la chaîne de recherche est vide,  caréinitialise la liste des joueurs
    if (!text.trim()) {
      fetchJoueurs();
      return;
    }
    // Filtre la liste des joueurs en fonction du texte de recherche
    const filteredJoueurs = joueurs.filter(joueur => {
      const joueurFullName = `${joueur.prenom.toLowerCase()} ${joueur.nom.toLowerCase()}`;
      return joueurFullName.includes(text.toLowerCase());
    });

    setJoueurs(filteredJoueurs);
  };

  return (
    <View style={styles.container}>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDate}
          onValueChange={(itemValue, itemIndex) => handleDateChange(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Toutes les dates confondues" value={null} />
          {datesDisponibles.map((date, index) => (
            <Picker.Item
              key={index}
              label={new Date(date).toISOString().split('T')[0]}
              value={date} />
          ))}
        </Picker>
      </View>
      <Text style={styles.title}>Résultats</Text>
      <TextInput
        style={styles.searchBox}
        onChangeText={handleSearch}
        value={recherche}
        placeholder="Rechercher un joueur"
      />
      <ScrollView>
        {joueurs.map((joueur, index) => (
          <TouchableOpacity
            key={index}
            style={styles.joueurItem}
            onPress={() => toggleJoueurSelectionne(joueur.user_id)}
          >
            <Text style={[
              styles.joueurNom,
              joueur.user_id === utilisateurConnecte?.id && styles.joueurConnecte
            ]}>
              {joueur.prenom} {joueur.nom}
            </Text>
            {joueurSelectionne === joueur.user_id && (
              <>
                <Text style={styles.joueurVictoires}>Victoires : {joueur.total_victoires}</Text>
                <Text style={styles.joueurDefaites}>Défaites : {joueur.total_defaites}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4', // Fond légèrement gris
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#123e53', // Texte plus sombre pour le titre
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center', // Centrer le titre
  },
  searchBox: {
    fontSize: 16,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  joueurItem: {
    backgroundColor: '#fff', // Fond blanc pour chaque élément
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  joueurNom: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Texte plus sombre pour le nom
    marginBottom: 5,
  },
  joueurVictoires: {
    fontSize: 16,
    color: 'green',
  },
  joueurDefaites: {
    fontSize: 16,
    color: 'red',
  },
  joueurConnecte: {
    color: '#890936',
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#f2f2f2', // Fond clair
    borderRadius: 10, // Coins arrondis
    borderWidth: 1, // Bordure fine
    borderColor: '#dcdcdc', // Couleur de la bordure
    shadowColor: '#000', // Couleur de l'ombre
    shadowOpacity: 0.2, // Opacité de l'ombre
    shadowRadius: 3, // Rayon de l'ombre
    shadowOffset: { width: 0, height: 2 }, // Décalage de l'ombre
  },
  picker: {
    color: '#333', // Couleur de la police
    fontSize: 16, // Taille de la police
    marginTop: -80
  },
});


export default Joueurs