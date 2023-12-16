import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Button
} from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import 'moment/locale/fr'; // Importez le locale français
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from './UserContext';
import styles from './CalendrierStyles';
import DatePicker from 'react-native-date-picker'
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


moment.locale('fr'); // Définir la locale de moment en français

function Calendrier({ route }) {
  const [customDatesStyles, setCustomDatesStyles] = useState({});
  const moment = require("moment");
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const navigation = useNavigation();
  const { prenom, setprenom } = route.params || {};
  const { id, setId } = route.params || {};
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [legendVisible, setLegendVisible] = useState(false); 
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  
  useEffect(() => {
    fetchLoggedInUserInfo();
    fetchEvents();
    fetchDateColors();
    
    /*fetchDateColors().th §en((colors) => {
      setCustomDatesStyles(colors);
    });*/
    moment.locale('fr');

    const refreshInterval = setInterval(() => {
      fetchLoggedInUserInfo();
      fetchEvents();
      fetchDateColors();
      /*fetchDateColors().then((colors) => {
        setCustomDatesStyles(colors);
      });*/
    }, 3000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  
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
     
      } else {
        console.error('Raté pour fetch user info:', data.message);
      }
    } catch (error) {
      console.error('Erreur pour fetch les info des users:', error);
    }
  };


  // Fonction pour afficher ou cacher la légende
  const toggleLegend = () => {
    setLegendVisible(!legendVisible);
  };

  const onTimeSelected = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTime(selectedTime); // Sauvegarder l'heure sélectionnée
      /*sendParticipation("Oui", selectedTime); // Envoyez la participation avec l'heure choisie.*/
      console.log("Heure sélectionnée:", selectedTime);
    }
  };
  
  // fonction de confirmation
  const confirmTime = () => {
    setShowTimePicker(false); // Fermer le sélecteur de temps
    setShowConfirmButton(false); // Cacher le bouton de confirmation
    sendParticipation("Oui", selectedTime); // Envoyer la participation avec l'heure confirmée
    console.log("Heure confirmée:", selectedTime);
  };

  // Appelée quand l'utilisateur confirme la participation
  const confirmParticipationWithTime = () => {
        setShowTimePicker(true); // Afficher le TimePicker
  };
    

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://192.168.1.6:3030/calendar");
      const eventsByDate = {};
      response.data.forEach((event) => {
        //const eventDate = event.date.split("T")[0];
        const eventDate = moment.utc(event.date).local().format('YYYY-MM-DD');
        if (!eventsByDate[eventDate]) {
          eventsByDate[eventDate] = [];
        }
        //eventsByDate[eventDate].push(event);
        eventsByDate[eventDate].push({ ...event, date: eventDate});
      });
      setEvents(eventsByDate);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements", error);
    }
  };

  //participation event
  const handleParticipation = async (eventId, participation) => {
    try {
      // Vérifier si selectedDate est une instance de Date
      let dateUTC;
      if (selectedDate instanceof Date) {
        dateUTC = selectedDate.toISOString();
      } else if (typeof selectedDate === 'string') {
        // Convertir depuis une chaîne, si nécessaire
        dateUTC = new Date(selectedDate).toISOString();
      } else {
        console.error("selectedDate n'est pas une date valide");
        return;
      }

      if (!loggedInUser || !loggedInUser.id) {
        console.error("Les informations de l'utilisateur ne sont pas disponibles");
        return;
      }
  
      await axios.post(
        `http://192.168.1.6:3030/updateParticipation/${eventId}`,
        {
          participation,
          id: loggedInUser.id, // Utiliser l'ID de loggedInUser
          prenom: loggedInUser.prenom, // Utiliser le prénom de loggedInUser
          date: dateUTC,
        }
      );
  
      if (participation === "Oui") {
        console.log("ID de l'utilisateur:", id); // Vérifiez si l'ID est correctement défini
        console.log("Prénom de l'utilisateur:", prenom); // Vérifiez si le prénom est correctement défini
       
      }
  
      await fetchEvents();
      console.log("Participation validée");
      console.log(dateUTC);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la participation", error);
      if (error.response) {
        // Une réponse a été reçue du serveur avec un statut d'erreur
        console.error("Statut de réponse :", error.response.status);
        console.error("Données de réponse :", error.response.data);
      }
    }
  };
  
  //participation au jeu libre

  const sendParticipation = async (participation, time = selectedTime) => {
    try {
      if (participation !== "Oui" && participation !== "Non") {
        throw new Error("La participation doit être soit 'Oui' soit 'Non'");
      }
      const newTime = new Date(selectedTime);
      newTime.setHours(newTime.getHours());
      
      const formattedTime = `${newTime.getHours().toString().padStart(2, '0')}:${newTime.getMinutes().toString().padStart(2, '0')}`;
      console.log("heure " + formattedTime);
      if (!loggedInUser || !loggedInUser.id) {
        console.error("Les informations de l'utilisateur ne sont pas disponibles");
        return;
      }
      await axios.post(
        `http://192.168.1.6:3030/participationJeuLibre/${loggedInUser.id}`,
        {
          participation : participation === "Oui" ? "Oui" : "Non",
          date: moment(selectedDate).format("YYYY-MM-DD"),
          heure : formattedTime , // Ajoutez l'heure formatée ici
        }
      );
      await fetchEvents();
      console.log("Participation mise à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la participation", error);
      if (error.response) {
        console.error("Statut de réponse :", error.response.status);
        console.error("Données de réponse :", error.response.data);
      }
    }
  };

  //nouvelle fonction pour fetch toutes les couleurs
  const fetchDateColors = async () => {
    try {
      const response = await axios.get("http://192.168.1.6:3030/getAllDateColors");
      const dateColors = response.data || {};
  
      // Vérifiez si les données sont correctement renvoyées depuis le backend
     
      const backendDates = response.data;
  
      // Convertir les dates dans le format 'YYYY-MM-DD'
      const convertedDates = {};
      for (const date in backendDates) {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        convertedDates[formattedDate] = backendDates[date];
      }
  
      // Utilisez 'convertedDates' dans votre application pour afficher les dates dans le format 'YYYY-MM-DD'.
      
      if (dateColors) {
        const updatedCustomDatesStyles = {};
        for (const date in convertedDates) {
          const color = convertedDates[date];
          updatedCustomDatesStyles[date] = {
            customStyles: {
              container: {
                backgroundColor: color,
              },
              text: {
                color: "white",
              },
            },
          };
        }
  
        setCustomDatesStyles(updatedCustomDatesStyles);
      } else {
        // Gérer le cas où aucune couleur de date n'est trouvée
        console.error("Aucune couleur de date trouvée.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de toutes les couleurs de date", error);
      return {};
    }
  };
  
// fetch participation jeu libre
  const fetchParticipantsJeuLibre= async (selectedDate) => {
    try {
      const response = await axios.get(
        `http://192.168.1.6:3030/ouiparticipationjeulibre/${selectedDate}`
      );
      return response.data;
      
    } catch (error) {
      console.error("Erreur lors de la récupération des participants", error);
      return [];
    }
  };

  const handleDayPress = async (day) => {
    console.log("Date sélectionnée :", day.dateString);
    //const color = customDatesStyles[day.dateString]?.customStyles?.container?.backgroundColor;
    if (day && day.dateString) {
      const selectedDateString = day.dateString;
      setSelectedDate(selectedDateString);
      fetchDateColors(); // Récupérer la couleur associée à la date sélectionnée
  
      // Récupérer la liste des participants avant d'afficher la boîte de dialogue
      const participants = await fetchParticipantsJeuLibre(selectedDateString);
  
      // Vérifier si la couleur de la date est verte ou bleue
      const color =
        customDatesStyles[selectedDateString]?.customStyles?.container
          ?.backgroundColor;
      if (color === "green" || color === "blue") {
        setShowTimePicker(true); // Afficher le sélecteur de temps
        setShowConfirmButton(true); // Afficher le bouton de confirmation
        // Afficher la liste des participants
        console.log("Participants présents :", participants);
  
        // Afficher la boîte de dialogue
        Alert.alert(
          
          "Viens- tu au jeu libre ? \n Voici les joueurs présents",
          participants .map((participant) => `${participant.prenom} à ${participant.heure}`).join(", \n"),
          [
            {
              text: "Non",
              onPress: () => sendParticipation("Non"),
              style: "cancel",
            },
            {
              text: "Oui",
              //onPress: () => sendParticipation("Oui"),
              onPress: () => confirmParticipationWithTime()
            },
            {
              text: "Fermer",
              onPress: () => console.log("Boîte de dialogue fermée"),
              style: "cancel",
              cancelable: true, // Permet à l'utilisateur de fermer la boîte de dialogue sans y répondre
            },
          ]
        );
      }
      if (color === 'red') {
        setShowTimePicker(false);
        setShowConfirmButton(false);
        // Affiche une alerte si la date sélectionnée est marquée en rouge
        Alert.alert("Information", "Salle fermée", [
          { text: "OK", onPress: () => console.log("Alerte fermée") }
        ]);
      }
      if (color ==="orange"){
        setShowTimePicker(false);
        setShowConfirmButton(false);
      }
    } else {
      // Gérer le cas où la date sélectionnée n'est pas correctement définie
      console.error("La date sélectionnée n'est pas correctement définie.");
    }
  };

  const Legend = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={legendVisible}
      onRequestClose={() => {
        Alert.alert("La légende a été fermée.");
        setLegendVisible(!legendVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.legendTitle}>Légende des couleurs:</Text>
          <Text style={styles.legendText}><Text style={{ color: 'green' }}>●</Text> Vert: jeu libre au Verseau</Text>
          <Text style={styles.legendText}><Text style={{ color: 'blue' }}>●</Text> Bleu: jeu libre à Rixensart</Text>
          <Text style={styles.legendText}><Text style={{ color: 'orange' }}>●</Text> Orange: soirée à thème</Text>
          <Text style={styles.legendText}><Text style={{ color: 'red' }}>●</Text> Rouge: fermeture de la salle</Text>

          <TouchableOpacity style={styles.buttonClose} onPress={toggleLegend}>
            <Text style={styles.textStyle}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEventsForDate = () => {
    
    if (
      !selectedDate ||
      !customDatesStyles[selectedDate] ||
      !events[selectedDate]
    ) {
      return null;
    }
    return (
      <View>
        {events[selectedDate].map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventInfo}>Date : {moment(event.date).format('LL')}</Text>
  
            <View style={styles.participationButtons}>
              <TouchableOpacity onPress={() => handleParticipation(event.id, "Oui")}>
                <Icon name="check-circle" size={30} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleParticipation(event.id, "Non")}>
                <Icon name="cancel" size={30} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    
    <ScrollView>
      <View style={styles.container}>
      <TouchableOpacity style={styles.legendButton} onPress={toggleLegend}>
          <Text style={styles.legendButtonText}>Voir la légende des couleurs</Text>
        </TouchableOpacity>
        {legendVisible && <Legend />}
        <Calendar
          onDayPress={handleDayPress} // Mettez à jour la date sélectionnée
          markedDates={customDatesStyles}
          markingType="custom"
        />

         
        <Text style={styles.eventTitle2}>Événements  :</Text>

        {renderEventsForDate()}
        {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeSelected}
  
        />
        
      )}
         {showConfirmButton && (
          <Button title="Confirmer l'heure" onPress={confirmTime} />
        )}
      </View>
    </ScrollView>
  );
}

export default Calendrier;
