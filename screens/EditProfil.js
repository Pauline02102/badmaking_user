import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileForm = ({ user, onProfileUpdated }) => {
    const [prenom, setPrenom] = useState(user ? user.prenom : '');
    const [nom, setNom] = useState(user ? user.nom : '');
    const [email, setEmail] = useState(user ? user.email : '');
    const [classement_simple, setclassement_simple] = useState(user ? user.classement_simple : '');
    const [classement_double, setclassement_double] = useState(user ? user.classement_double : '');
    const [classement_mixte, setclassement_mixte] = useState(user ? user.classement_mixte : '');

    const handleSubmit = async () => {
        try {
            // Remplacer avec votre URL de backend
            const response = await fetch("http://192.168.1.6:3030/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${await AsyncStorage.getItem('userToken')}`,
                },
                body: JSON.stringify({ prenom, nom, email ,classement_simple, classement_double, classement_mixte}),
            });

            const data = await response.json();
            if (data.message) {
                onProfileUpdated({ prenom, nom, email ,classement_simple, classement_double, classement_mixte});
                Alert.alert("Succès", "Profil mis à jour avec succès");
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                onChangeText={setPrenom}
                value={prenom}
                placeholder="Prénom"
            />
            <TextInput
                style={styles.input}
                onChangeText={setNom}
                value={nom}
                placeholder="Nom"
            />
            <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="Email"
            />
            <TextInput
                style={styles.input}
                onChangeText={setclassement_simple}
                value={classement_simple}
                placeholder="classement simple"
            />
            <TextInput
                style={styles.input}
                onChangeText={setclassement_double}
                value={classement_double}
                placeholder="classement double"
            />
            <TextInput
                style={styles.input}
                onChangeText={setclassement_mixte}
                value={classement_mixte}
                placeholder="classement mixte"
            />
            <Button title="Mettre à jour" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff",
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
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 15,
        padding: 10,
    },
    button: {
        backgroundColor: "#467c86",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
});


export default EditProfileForm;
