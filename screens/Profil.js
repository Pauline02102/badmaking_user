import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity,Alert} from "react-native";
import { useRoute } from '@react-navigation/native';

const Profil = () => {
  const route = useRoute();
  const [nom, setNom] = useState(route.params?.nom || '');
  const [prenom, setPrenom] = useState(route.params?.prenom || '');
  const [email, setEmail] = useState(route.params?.email || '');
  const [classementSimple, setClassementSimple] = useState('');
  const [classementDouble, setClassementDouble] = useState('');
  const [classementMixte, setClassementMixte] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(route.params?.id || '');

  const handleSave = async () => {
    try {
      const response = await fetch(`http://192.168.1.6:3030/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: nom,
          prenom: prenom,
          email: email,
          classement_simple: classementSimple || null,
          classement_double: classementDouble || null,
          classement_mixte: classementMixte || null
        }),
      });
  
      const data = await response.json();
      
      if (response.status === 200) {
        console.log('Mise à jour réussie:', data);
      } else {
        console.error('Erreur lors de la mise à jour:', data);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la requête:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon profil</Text>
      <View style={styles.inputContainer}>
        <TextInput
          editable={isEditing}
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Nom"
        />
        <TextInput
          editable={isEditing}
          style={styles.input}
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Prénom"
        />
        <TextInput
          editable={isEditing}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />
        <TextInput
          keyboardType="numeric"
          editable={isEditing}
          style={styles.input}
          value={classementSimple}
          onChangeText={setClassementSimple}
          placeholder="Classement Simple"
        />
        <TextInput
          keyboardType="numeric"
          editable={isEditing}
          style={styles.input}
          value={classementDouble}
          onChangeText={setClassementDouble}
          placeholder="Classement Double"
        />
        <TextInput
          keyboardType="numeric"
          editable={isEditing}
          style={styles.input}
          value={classementMixte}
          onChangeText={setClassementMixte}
          placeholder="Classement Mixte"
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (isEditing) {
            handleSave();
          }
          setIsEditing(!isEditing);
        }}>
        <Text style={styles.buttonText}>
          {isEditing ? 'Sauvegarder les modifications' : 'Modifier mes informations'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 30,
    shadowColor: "rgba(0, 0, 0, 0.062)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default Profil;
