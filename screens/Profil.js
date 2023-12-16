import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import { useUser } from "./UserContext";
import EditProfileForm from "./EditProfil";



const Profil = () => {

  const { setIsSignedIn } = useUser();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showClassements, setShowClassements] = useState(false);
  const handleProfileUpdated = (updatedUser) => {
    setLoggedInUser(updatedUser);
  };
  const toggleClassements = () => {
    setShowClassements(!showClassements);
  };

  useEffect(() => {
    fetchLoggedInUserInfo()
  }, [], 30); // Utilisation d'un tableau vide de dépendances



  const fetchLoggedInUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('page match : Token non trouvé');
        return;
      }
      const response = await fetch('http://192.168.1.6:3030/get-user-info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setLoggedInUser(data.user);
        console.log(data.user);
      } else {
        console.error('Raté pour fetch user info:', data.message);
      }
    } catch (error) {
      console.error('Erreur pour fetch les info des users:', error);
    }
  };
  const handleLogout = async () => {
    // Fonction pour gérer la logique de déconnexion
    const logout = async () => {
      try {
        await fetch("http://192.168.1.6:3000/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${await AsyncStorage.getItem('userToken')}`,
          },
        });
        await AsyncStorage.removeItem('userToken');
        setIsSignedIn(false);
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
      }
    };

    // Affichage du pop-up de confirmation
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Non",
          style: "cancel"
        },
        {
          text: "Oui",
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>

        <Text style={styles.title}>Mon profil</Text>
        <View style={styles.infoContainer}>
          
          {loggedInUser ? (
            <>
              <Text style={styles.infoText}>Prénom: {loggedInUser.prenom}</Text>
              <Text style={styles.infoText}>Nom: {loggedInUser.nom}</Text>
              <Text style={styles.infoText}>Email: {loggedInUser.email}</Text>
              
              <View style={styles.classementsContainer}>
              <Text style={styles.classementText}>Simple: {loggedInUser.classement_simple}</Text>
              <Text style={styles.classementText}>Double: {loggedInUser.classement_double}</Text>
              <Text style={styles.classementText}>Mixte: {loggedInUser.classement_mixte}</Text>
              </View>
            </>
          ) : (
            <Text>Chargement...</Text>
          )}
        </View>


        <EditProfileForm user={loggedInUser} onProfileUpdated={handleProfileUpdated} />

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Déconnexion</Text>
        </TouchableOpacity>


      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    padding: 30,
    paddingTop: 110,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#467c86",
  },
  infoContainer: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    width: '100%',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 5,
    color: "#333333",
  },
  button: {
    backgroundColor: "#467c86", // Couleur de fond du bouton
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '30%', // Vous pouvez ajuster la largeur selon votre besoin
  },
  buttonText: {
    color: "#defdf5", // Couleur du texte
    textAlign: "center",
  },
  classementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  classementText: {
    fontSize: 16,
    color: "#333",
  },
});

export default Profil;
