import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from "../Auth/UserContext";
import EditProfileForm from "./EditProfil";
import { BASE_URL } from '../config';

const Profil = () => {

  const { setIsSignedIn } = useUser();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showClassements, setShowClassements] = useState(false);
  const [showInfo, setshowInfo] = useState(false);


  const toggleClassements = () => {
    setShowClassements(!showClassements);
  };
  const toggleInfo = () => {
    setshowInfo(!showInfo);
  };

  useEffect(() => {
    fetchLoggedInUserInfo()
  }, [], 300); // Utilisation d'un tableau vide de dépendances



  const fetchLoggedInUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('page match : Token non trouvé');

        return;
      }
      const response = await fetch(`${BASE_URL}/user_tokens/get-user-info`, {
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
        console.error('Raté pour fetch user info page profil :', data.message);
      }
    } catch (error) {
      console.error('Erreur pour fetch les info des users:', error);
    }
  };

  const handleLogout = async () => {
    console.log("test");
    const logout = async () => {
      try {
        await fetch(`${BASE_URL}/user_tokens/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${await AsyncStorage.getItem('userToken')}`,
          },
        });
        // Utiliser AsyncStorage pour React Native et localStorage pour le web
        if (Platform.OS === 'web') {
          localStorage.removeItem('userToken');
        } else {
          await AsyncStorage.removeItem('userToken');
        }
        setIsSignedIn(false);
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
      }
    };

    // Utiliser window.confirm pour le web et Alert.alert pour React Native
    if (Platform.OS === 'web') {
      if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        logout();
      }
    } else {
      Alert.alert(
        "Déconnexion",
        "Êtes-vous sûr de vouloir vous déconnecter ?",
        [
          { text: "Non", style: "cancel" },
          { text: "Oui", onPress: () => logout() }
        ]
      );
    }
  };

  const handleLogoutDelete = async () => {
    console.log("testdelete");
    const logoutDelete = async () => {
      try {
        await fetch(`${BASE_URL}/user_tokens/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${await AsyncStorage.getItem('userToken')}`,
          },
        });
        // Utiliser AsyncStorage pour React Native et localStorage pour le web
        if (Platform.OS === 'web') {
          localStorage.removeItem('userToken');
        } else {
          await AsyncStorage.removeItem('userToken');
        }
        setIsSignedIn(false);
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
      }
    };

    // Supprimer la confirmation de déconnexion pour toutes les plates-formes
    logoutDelete();
  };
  


  const handleDeleteAccount = async () => {
    if (Platform.OS === 'web') {
      const isConfirmed = window.confirm("Suppression de compte\n\nÊtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.");
      if (isConfirmed) {
        // Continuer avec la suppression du compte
        try {
          const token = await AsyncStorage.getItem('userToken');
          const response = await fetch(`${BASE_URL}/user_tokens/delete-account`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (data.success) {
            // Déconnecter l'utilisateur
            handleLogoutDelete();
          } else {
            console.error('Erreur lors de la suppression du compte:', data.message);
            // Afficher une alerte ou un message d'erreur spécifique à la plateforme Web de Windows si nécessaire
          }
        } catch (error) {
          console.error('Erreur lors de la suppression du compte:', error);
          // Afficher une alerte ou un message d'erreur spécifique à la plateforme Web de Windows si nécessaire
        }
      }
    } else {
      // Code pour les autres plates-formes mobiles en utilisant Alert.alert
      Alert.alert(
        "Suppression de compte",
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
        [
          { text: "Non", style: "cancel" },
          {
            text: "Oui",
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await fetch(`${BASE_URL}/user_tokens/delete-account`, {
                  method: "PUT",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });

                const data = await response.json();
                if (data.success) {
                  // Déconnecter l'utilisateur
                  handleLogoutDelete();
                } else {
                  console.error('Erreur lors de la suppression du compte:', data.message);
                  Alert.alert("Erreur", "La suppression du compte a échoué.");
                }
              } catch (error) {
                console.error('Erreur lors de la suppression du compte:', error);
                Alert.alert("Erreur", "La suppression du compte a échoué.");
              }
            }
          }
        ],
        { cancelable: false }
      );
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>

          <Text style={styles.title} accessibilityRole="header">Mon profil</Text>


          {loggedInUser ? (
            <>

              <TouchableOpacity style={styles.infoContainer} onPress={toggleInfo}>
                <Text style={styles.infoTextTitre}>Informations personnelles {showInfo ? '▲' : '▼'} </Text>
                {showInfo && (
                  <View style={styles.classementsDetails}>
                    <Text style={styles.infoText}>Prénom: {loggedInUser.prenom}</Text>
                    <Text style={styles.infoText}>Nom: {loggedInUser.nom}</Text>
                    <Text style={styles.infoText}>Email: {loggedInUser.email}</Text>
                  </View>
                )}
              </TouchableOpacity>


              <TouchableOpacity style={styles.infoContainer} onPress={toggleClassements}>
                <Text style={styles.infoTextTitre}>Classements {showClassements ? '▲' : '▼'}</Text>
                {showClassements && (
                  <View style={styles.classementsDetails}>
                    <Text style={styles.infoText}>Simple: {loggedInUser.classement_simple}</Text>
                    <Text style={styles.infoText}>Double: {loggedInUser.classement_double}</Text>
                    <Text style={styles.infoText}>Mixte: {loggedInUser.classement_mixte}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <Text>Chargement...</Text>
          )}

          <EditProfileForm user={loggedInUser} onProfileUpdated={setLoggedInUser} />

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Déconnexion</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSupp} onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    padding: 30,
    paddingTop: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#123e53",
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
  classementsDetails: {
    marginTop: 10,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 5,
    color: "#333333",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: "#467c86",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
  },
  buttonSupp: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
  },
  buttonText: {
    color: "#defdf5",
    textAlign: "center",
  },
  infoTextTitre: {
    fontSize: 18,
    marginBottom: 5,
    color: "#333333",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: 'bold'

  }
});

export default Profil;
