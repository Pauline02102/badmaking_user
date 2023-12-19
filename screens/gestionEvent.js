import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Calendar } from 'react-native-calendars';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, SelectList, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BASE_URL } from './config';
import RNPickerSelect from 'react-native-picker-select';

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
        const formattedTime = time.toISOString().split('T')[1].split('.')[0];
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
        <View style={styles.container}>
            <Text style={styles.header}>Modifier l'événement :  {eventId} </Text>
            <Text>Date :</Text>
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

            <Text>Titre :</Text>
            <TextInput
                style={styles.input}
                value={newEventData.title}
                onChangeText={(text) => setNewEventData({ ...newEventData, title: text })}
            />
            <Text>Heure :</Text>
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



            <Text>Status :</Text>

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
            <Button title="Enregistrer les modifications" onPress={handleUpdateEvent} />
        </View>
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
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
});

export default ModifierEvent;
