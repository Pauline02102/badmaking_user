import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

function Calendrier({ route }) {
  const [customDatesStyles, setCustomDatesStyles] = useState({});
  const moment = require("moment");
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateColor, setSelectedDateColor] = useState(null); // Nouvel état pour stocker la couleur de la date sélectionnée
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const { prenom, setprenom } = route.params || {};
  const { id, setId } = route.params || {};

  useEffect(() => {
    fetchEvents();
    fetchDateColors();
    /*fetchDateColors().then((colors) => {
      setCustomDatesStyles(colors);
    });*/
    const refreshInterval = setInterval(() => {
      fetchEvents();
      fetchDateColors();
      /*fetchDateColors().then((colors) => {
        setCustomDatesStyles(colors);
      });*/
    }, 30300);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://172.20.10.4:3030/calendar");
      const eventsByDate = {};
      response.data.forEach((event) => {
        const eventDate = event.date.split("T")[0];
        if (!eventsByDate[eventDate]) {
          eventsByDate[eventDate] = [];
        }
        eventsByDate[eventDate].push(event);
      });
      setEvents(eventsByDate);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements", error);
    }
  };

  //participation event
  const handleParticipation = async (eventId, participation) => {
    try {
      await axios.post(
        `http://172.20.10.4:3030/updateParticipation/${eventId}`,
        {
          participation,
          id: id, // Envoyer l'ID de l'utilisateur
          prenom: prenom, // Envoyer le prénom de l'utilisateur
          date: selectedDate,
        }
      );

      if (participation === "Oui") {
        console.log("ID de l'utilisateur:", id); // Vérifiez si l'ID est correctement défini
        console.log("Prénom de l'utilisateur:", prenom); // Vérifiez si le prénom est correctement défini
        navigation.navigate("Match", { id: id, prenom: prenom });
      }
      await fetchEvents();
      console.log("participation validée");
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

  const sendParticipation = async (participation) => {
    try {
      if (participation !== "Oui" && participation !== "Non") {
        throw new Error("La participation doit être soit 'Oui' soit 'Non'");
      }
      await axios.post(
        `http://172.20.10.4:3030/participationJeuLibre/${id}`,
        {
          participation : participation === "Oui" ? "Oui" : "Non",
          date: moment(selectedDate).format("YYYY-MM-DD"),
        }
      );

      /*if (participation === "Oui") {
        console.log("ID de l'utilisateur :", id);
        console.log("Prénom de l'utilisateur :", prenom);
        navigation.navigate("Match", { id: id, prenom: prenom });
      }*/
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
      const response = await axios.get(
        "http://172.20.10.4:3030/getAllDateColors"
      );
      const dateColors = response.data || {};

      // Vérifiez si les données sont correctement renvoyées depuis le backend
      console.log("Toutes les couleurs de date :", dateColors);
      const backendDates = response.data;

      // Convertir les dates dans le format 'YYYY-MM-DD'
      const convertedDates = {};
      for (const date in backendDates) {
        const formattedDate = moment(date, "ddd MMM DD YYYY HH:mm:ss").format(
          "YYYY-MM-DD"
        );
        convertedDates[formattedDate] = backendDates[date];
      }

      // Utilisez 'convertedDates' dans votre application pour afficher les dates dans le format 'YYYY-MM-DD'.
      console.log("Dates converties :", convertedDates);

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
      console.error(
        "Erreur lors de la récupération de toutes les couleurs de date",
        error
      );
      return {};
    }
  };
// fetch participation jeu libre
  const fetchParticipantsJeuLibre= async (selectedDate) => {
    try {
      const response = await axios.get(
        `http://172.20.10.4:3030/ouiparticipationjeulibre/${selectedDate}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des participants", error);
      return [];
    }
  };

  

  const handleDayPress = async (day) => {
    console.log("Date sélectionnée :", day.dateString);
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
        // Afficher la liste des participants
        console.log("Participants présents :", participants);
  
        // Afficher la boîte de dialogue
        Alert.alert(
          
          "Viens- tu au jeu libre ? \n Voici les joueurs présents",
          participants.map((participant) => participant.prenom).join(", \n"),
          [
            {
              text: "Non",
              onPress: () => sendParticipation("Non"),
              style: "cancel",
            },
            {
              text: "Oui",
              onPress: () => sendParticipation("Oui"),
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
    } else {
      // Gérer le cas où la date sélectionnée n'est pas correctement définie
      console.error("La date sélectionnée n'est pas correctement définie.");
    }
  };

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
        <Text>
          Couleur de la date sélectionnée : {selectedDateColor || "N/A"}
        </Text>

        {events[selectedDate].map((event) => (
          <View key={event.id} style={styles.eventContainer}>
            <Text>{event.title}</Text>
            <Text>{event.type}</Text>
            <Text>{event.status}</Text>
            <Text>{event.date}</Text>
            <View style={styles.participationButtons}>
              <TouchableOpacity
                onPress={() => handleParticipation(event.id, "Oui")}
              >
                <Icon name="check-circle" size={30} color="green" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleParticipation(event.id, "Non")}
              >
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
        <Calendar
          onDayPress={handleDayPress} // Mettez à jour la date sélectionnée
          markedDates={customDatesStyles}
          markingType="custom"
        />
        <Text>Événements pour la date sélectionnée :</Text>
        <Text>Bonjour, {prenom}! </Text>
        <Text>Bonjour, {id}! </Text>
        {renderEventsForDate()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  eventContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
  },
  participationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  attendanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default Calendrier;
