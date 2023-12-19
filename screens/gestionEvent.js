import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Calendar } from 'react-native-calendars';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, SelectList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BASE_URL } from './config';
import RNPickerSelect from 'react-native-picker-select';
import moment from "moment";
import 'moment/locale/fr';
moment.locale('fr');
const ModifierEvent = ({ route, navigation }) => {
    const [event, setEvent] = useState({});
    const [newEventData, setNewEventData] = useState({
        title: '',
        status: 'Random',
        date: '',
        heure: '',
    });

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const { eventId } = route.params;

    useEffect(() => {
        fetchEvent();
    }, []);


    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };
    const handleDateConfirm = (date) => {
        hideDatePicker();
        const formattedDate = date.toISOString().split('T')[0];
        setNewEventData({ ...newEventData, date: formattedDate });
    };
    const showTimePicker = () => {
        setTimePickerVisible(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisible(false);
    };

    const handleTimeConfirm = (time) => {
        hideTimePicker();
        const formattedTime = moment(time).format('HH:mm'); // Format de l'heure locale
        setNewEventData({ ...newEventData, heure: formattedTime });
    };



    const fetchEvent = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/event/calendar/${eventId}`);
            setEvent(response.data);
            setNewEventData(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'événement", error);
        }
    };

    const handleUpdateEvent = async () => {
        try {
            await axios.put(`${BASE_URL}/event/modifier/${eventId}`, newEventData);
            Alert.alert('Succès', 'Événement mis à jour avec succès.');
            navigation.goBack(); // Retour à la page de gestion des événements
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'événement", error);
            Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour de l\'événement.');
        }
    };

    return (
        <KeyboardAvoidingView>
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.header}>Modifier l'événement :  {eventId} </Text>

                    <View style={styles.card}>
                        <Text style={styles.inputTitle}>Date :</Text>

                        <TextInput
                            style={styles.input}
                            value={newEventData.date}
                            onFocus={showDatePicker}
                        />


                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleDateConfirm}
                            onCancel={hideDatePicker}
                            textColor="black"
                        />

                    </View>

                    <View style={styles.card}>
                        <Text style={styles.inputTitle}>Titre :</Text>
                        <TextInput
                            style={styles.input}
                            value={newEventData.title}
                            onChangeText={(text) => setNewEventData({ ...newEventData, title: text })}
                        />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.inputTitle}>Heure :</Text>
                        <TextInput
                            style={styles.input}
                            value={newEventData.heure}
                            onFocus={showTimePicker}
                            textColor="black"
                        />


                        <DateTimePickerModal
                            isVisible={isTimePickerVisible}
                            mode="time"
                            onConfirm={handleTimeConfirm}
                            onCancel={hideTimePicker}
                            textColor="black"
                            locale="fr-FR"
                        />
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.inputTitle}>Status :</Text>
                        <RNPickerSelect
                            style={pickerSelectStyles} // Ajoutez le style du composant
                            value={newEventData.status}
                            onValueChange={(value) =>
                                setNewEventData({ ...newEventData, status: value })
                            }
                            items={[
                                { label: 'Random', value: 'Random' },
                                { label: 'Par niveau', value: 'Par niveau' },
                            ]}
                        />
                    </View>
                    <Button title="Enregistrer les modifications" onPress={handleUpdateEvent} color="transparent" />
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Enregistrer les modifications</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};


const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // pour s'assurer que la flèche de sélection reste visible
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // pour s'assurer que la flèche de sélection reste visible
    },
});

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eef2f3', // Arrière-plan doux
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#305f72',
        marginBottom: 30,
        letterSpacing: 1, // Espacement des lettres
        textShadowColor: 'rgba(0, 0, 0, 0.2)', // Ombre du texte
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 10,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        width: '100%',
        marginBottom: 20,
    },
    inputTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#467c86',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#b0c4de',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#467c86',
        borderRadius: 20,
        paddingVertical: 12, // Plus grand
        paddingHorizontal: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
        marginTop: -25,

    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});



export default ModifierEvent;
