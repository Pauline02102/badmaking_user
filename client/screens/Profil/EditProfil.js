import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';
const EditProfileForm = ({ user, onProfileUpdated }) => {
    const [prenom, setPrenom] = useState(user ? user.prenom : '');
    const [nom, setNom] = useState(user ? user.nom : '');
    const [email, setEmail] = useState(user ? user.email : '');
    const [classement_simple, setclassement_simple] = useState(user ? user.classement_simple : '');
    const [classement_double, setclassement_double] = useState(user ? user.classement_double : '');
    const [classement_mixte, setclassement_mixte] = useState(user ? user.classement_mixte : '');

    const handleSubmit = async () => {
        const isValidClassement = (classement) => {
            const numericValue = parseInt(classement, 10);
            return numericValue >= 1 && numericValue <= 12;
        };

        if (
            (!classement_simple || isValidClassement(classement_simple)) &&
            (!classement_double || isValidClassement(classement_double)) &&
            (!classement_mixte || isValidClassement(classement_mixte))
        ) {
            // OK, les champs sont soit vides, soit valides
        } else {
            Alert.alert("Erreur", "Les classements doivent contenir uniquement des chiffres entre 1 et 12.");
            return;
        }
        // Vérifier que l'email contient "@" et "."
        if (email && (!email.includes("@") || !email.includes("."))) {
            Alert.alert("Erreur", "L'adresse email doit contenir '@' et '.'.");
            return;
        }
        const updatedFields = {};
        // Ajoute seulement les champs non vides et modifiés
        if (prenom && prenom !== user.prenom) updatedFields.prenom = prenom;
        if (nom && nom !== user.nom) updatedFields.nom = nom;
        if (email && email !== user.email) updatedFields.email = email;
        if (classement_simple && classement_simple !== user.classement_simple) updatedFields.classement_simple = classement_simple;
        if (classement_double && classement_double !== user.classement_double) updatedFields.classement_double = classement_double;
        if (classement_mixte && classement_mixte !== user.classement_mixte) updatedFields.classement_mixte = classement_mixte;


        if (Object.keys(updatedFields).length === 0) {
            Alert.alert("Aucune modification", "Vous n'avez modifié aucun champ.");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/user_tokens/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${await AsyncStorage.getItem('userToken')}`,
                },
                body: JSON.stringify(updatedFields),
            });

            const data = await response.json();
            if (data.message) {
                onProfileUpdated({ ...user, ...updatedFields });
                Alert.alert("Succès", "Profil mit à jour avec succès");
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
                keyboardType="email-address" // Utilise le clavier adapté aux adresses email
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                onChangeText={setclassement_simple}
                value={classement_simple}
                placeholder="Classement simple"
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                onChangeText={setclassement_double}
                value={classement_double}
                placeholder="Classement double"
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                onChangeText={setclassement_mixte}
                value={classement_mixte}
                placeholder="Classement mixte"
                keyboardType="numeric"
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
