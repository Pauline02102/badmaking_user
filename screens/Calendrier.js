import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  TextInput,
  KeyboardAvoidingView
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
import { BASE_URL } from './config';
import { useUser } from "./UserContext";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SelectList } from "react-native-dropdown-select-list";

moment.locale('fr'); // Définir la locale de moment en français

function Calendrier({ route }) {
  const moment = require("moment-timezone");
  const [customDatesStyles, setCustomDatesStyles] = useState({});
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
  const { setIsSignedIn } = useUser();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [participantsList, setParticipantsList] = useState([]);
  const [participantsCounts, setParticipantsCounts] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isJoueur, setIsJoueur] = useState(false);
  //pour admin
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isColorModalVisible, setColorModalVisible] = useState(false);
  const [dayColors, setDayColors] = useState({});


  const COLORS = ['red', 'green', 'blue', 'orange', 'white'];
  const data = [
    { key: "1", value: "Random" },
    { key: "2", value: "Par niveau" },
  ];
  const [time, setTime] = useState(new Date());
  const openColorModal = () => {
    setColorModalVisible(true);
  };
  useEffect(() => {
    fetchLoggedInUserInfo();
    fetchEvents();
    fetchDateColors();
    initializeDayColors();
    moment.locale('fr');

    const refreshInterval = setInterval(() => {
      fetchLoggedInUserInfo();
      fetchEvents();
      fetchDateColors();

    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    setTime(date);
    hideDatePicker();
  };

  const initializeDayColors = () => {
    setDayColors({
      'monday': 'green',
      'tuesday': 'blue',
      'thursday': 'blue',
      'sunday': 'blue'
    });
  };

  // Mise à jour des couleurs
  const updateDayColor = (day, color) => {
    setDayColors({ ...dayColors, [day]: color });
  };

  const combinedDateTime = moment(date).set({
    hour: time.getHours(),
    minute: time.getMinutes()
  }).toISOString();


  const createEvent = async () => {
    try {
      if (!loggedInUser || !loggedInUser.id) {
        console.error("Les informations de l'utilisateur ne sont pas disponibles");
        return;
      }

      // Afficher les valeurs initiales de date et time
      console.log("Date initiale:", date);
      console.log("Heure initiale:", time);

      const combinedDateTime = moment(date).set({
        hour: time.getHours(),
        minute: time.getMinutes()
      }).toISOString();

      // Vérifier la valeur de combinedDateTime
      console.log("combinedDateTime:", combinedDateTime);

      // Convertissez la date et l'heure en un format valide pour PostgreSQL
      const dateTime = moment.tz(
        `${combinedDateTime}`,
        "YYYY-MM-DDTHH:mm:ss.SSSZ", // Format d'entrée
        "UTC" // Fuseau horaire source (UTC)
      ).tz("Europe/Paris"); // Fuseau horaire cible (votre fuseau horaire)

      // Vérifier la valeur de dateTime
      console.log("dateTime:", dateTime);

      // Utilisez la méthode format pour obtenir la date et l'heure au format ISO 8601
      const formattedDateTime = dateTime.format();

      // Vérifier la valeur de formattedDateTime
      console.log("formattedDateTime:", formattedDateTime);

      await axios.post("http://192.168.1.6:3030/event/postcalendar", {
        title,
        status,
        date: formattedDateTime,
        heure: dateTime.format("HH:mm:ss"),
        user_id: loggedInUser.id,
        terrain_id: 1,
      });

      // Vérifier les données envoyées
      console.log("Données envoyées à l'API:", {
        title,
        status,
        date: formattedDateTime,
        heure: dateTime.format("HH:mm:ss"),
        user_id: loggedInUser.id,
        terrain_id: 1,
      });

      fetchEvents();
    } catch (error) {
      console.error("Erreur lors de la création de l'événement", error);
    }
  };


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
        console.log("data user", data.user);
        // Vérifiez si 'role' est défini avant d'appeler toLowerCase()
        const isAdmin = data.user.role && data.user.role.toLowerCase() === 'admin';
        const isJoueur = data.user.role && data.user.role.toLowerCase() === 'joueur';

        setIsAdmin(isAdmin);

        setIsJoueur(isJoueur);

        // Mettre à jour isAdmin et afficher la valeur mise à jour
        console.log('isAdmin:', isAdmin);
        console.log('isJoueur:', isJoueur);

      } else {
        console.error('Raté pour fetch user info page calendrier:', data.message);

      }
    } catch (error) {
      console.error('Erreur pour fetch les info des users:', error);

    }
  };
  const changeTerrainColor = async (currentColor) => {
    try {
      console.log("Valeur de 'selectedColor' :", currentColor);
      console.log("Valeur de 'selectedDate' avant la mise à jour :", selectedDate); // Ajoutez cette ligne

      let body;
      if (currentColor === 'white') {

        body = { date: selectedDate, color: null };
      } else {

        body = { date: selectedDate, color: currentColor };
      }

      const response = await axios.post(
        "http://192.168.1.6:3030/date_color/associateColorToDate",
        {
          date: selectedDate,
          color: currentColor,
        }
      );

      console.log("Réponse de la requête :", response.data);

      const updatedCustomDatesStyles = { ...customDatesStyles };

      if (currentColor === 'white') {

        updatedCustomDatesStyles[selectedDate] = {
          customStyles: {
            container: {},
            text: {
              color: 'black'
            },
          },
        };
      } else {

        updatedCustomDatesStyles[selectedDate] = {
          customStyles: {
            container: {
              backgroundColor: currentColor,
            },
            text: {
              color: 'white',
            },
          },
        };
      }

      setCustomDatesStyles(updatedCustomDatesStyles);

      setColorModalVisible(false);
    } catch (error) {
      console.error(
        "Erreur lors de l'association de la couleur à la date",
        error
      );
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
      const response = await axios.get(`${BASE_URL}/event/calendar`);
      const eventsByDate = {};
      response.data.forEach((event) => {
        //const eventDate = event.date.split("T")[0];
        const eventDate = moment.utc(event.date).local().format('YYYY-MM-DD');
        if (!eventsByDate[eventDate]) {
          eventsByDate[eventDate] = [];
        }
        //eventsByDate[eventDate].push(event);
        eventsByDate[eventDate].push({ ...event, date: eventDate, heure: event.heure, });
      });
      setEvents(eventsByDate);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements", error);
    }
  };

  //get le nombre de participants par evenement
  const fetchParticipantsParEvent = async (eventId) => {
    try {
      const response = await axios.get(`${BASE_URL}/participation_event/ouiparticipation/${eventId}`);
      setParticipantsList(response.data);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des participants", error);
    }
  };

  //participation event
  const handleParticipation = async (eventId, participation) => {
    try {

      if (!loggedInUser || !loggedInUser.id) {
        console.error("Les informations de l'utilisateur ne sont pas disponibles");
        return;
      }

      await axios.post(
        `${BASE_URL}/participation_event/updateParticipation/${eventId}`,
        {
          participation,
          id: loggedInUser.id, // Utiliser l'ID de loggedInUser
          prenom: loggedInUser.prenom, // Utiliser le prénom de loggedInUser

        }
      );

      if (participation === "Oui") {

        // Vérifiez si le prénom est correctement défini
        Alert.alert("Confirmation", "Vous êtes inscrit à l'événement! \n Les matchs seront disponnible 24h avant l'évenement", [
          {
            text: "OK",
            onPress: () => console.log("Confirmation de l'inscription"),
          },
        ]);
      }

      await fetchEvents();
      console.log("Participation validée");

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
      const newTime = new Date(selectedTime);
      newTime.setHours(newTime.getHours());

      const formattedTime = `${newTime.getHours().toString().padStart(2, '0')}:${newTime.getMinutes().toString().padStart(2, '0')}`;
      console.log("heure " + formattedTime);
      if (!loggedInUser || !loggedInUser.id) {
        console.error("Les informations de l'utilisateur ne sont pas disponibles");
        return;
      }
      await axios.post(
        `${BASE_URL}/participation_jeu/participationJeuLibre/${loggedInUser.id}`,
        {
          participation: participation === "Oui" ? "Oui" : "Non",
          date: moment(selectedDate).format("YYYY-MM-DD"),
          heure: formattedTime, // Ajoutez l'heure formatée ici
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
      const response = await axios.get(`${BASE_URL}/date_color/getAllDateColors`);
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
  const fetchParticipantsJeuLibre = async (selectedDate) => {
    try {
      const response = await axios.get(`${BASE_URL}/participation_jeu/ouiparticipationjeulibre/${selectedDate}`);
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
          participants.map((participant) => `${participant.prenom} à ${moment(selectedTime).format("HH:mm")}`).join(", \n"),
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
      if (color === "orange") {
        setShowTimePicker(false);
        setShowConfirmButton(false);
      }
    } else {
      // Gérer le cas où la date sélectionnée n'est pas correctement définie
      console.error("La date sélectionnée n'est pas correctement définie.");
    }
  };

  //legende des couleurs
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

  //calculer la taille du modal
  const calculateModalHeight = (numberOfParticipants) => {
    const minHeight = 200; // Hauteur minimale du modal
    const maxHeight = 600; // Hauteur maximale du modal
    const heightPerParticipant = 40; // Hauteur estimée par participant

    const calculatedHeight = Math.min(maxHeight, Math.max(minHeight, numberOfParticipants * heightPerParticipant));
    return calculatedHeight;
  };


  const fetchParticipantCount = async (eventId) => {
    try {
      const response = await axios.get(`${BASE_URL}/participation_event/participantcount/${eventId}`);
      return response.data.participant_count; // Renvoie le nombre de participants
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre de participants", error);
      return 0; // Renvoie 0 en cas d'erreur
    }
  };

  const calculateUsedCourts = (participantCount) => {
    const playersPerCourt = 4; // Nombre de joueurs par terrain
    return Math.ceil(participantCount / playersPerCourt); // Arrondir à l'entier supérieur pour obtenir le nombre total de terrains utilisés
  };


  //  gère la récupération du nombre de participants pour un événement spécifique.
  const ParticipantCount = ({ eventId }) => {
    const [participantCount, setParticipantCount] = useState(null);
    // s'assure que le nombre de participants est récupéré chaque fois que eventId change
    useEffect(() => {
      const fetchCount = async () => {
        const count = await fetchParticipantCount(eventId);
        setParticipantCount(count);
      };

      fetchCount();
    }, [eventId]);

    if (participantCount === null) {
      return <Text style={styles.eventInfo}>Chargement...</Text>;
    }

    return (
      <Text style={styles.eventInfo}>
        Terrains utilisés : {calculateUsedCourts(participantCount)}
      </Text>
    );
  };

  const handleEditEvent = (eventId) => {
    navigation.navigate("Gestion d'évenement", { eventId });
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
        {events[selectedDate].map((event) => (

          <View key={event.id} style={styles.eventItem}>
            <Text style={styles.eventTitle}>{event.status}</Text>
            <Text style={styles.eventInfo}>Date : {moment(event.date).format('LL')}</Text>
            <Text style={styles.eventInfo}>Heure : {event.heure}</Text>
          
            <ParticipantCount eventId={event.id} />

            <TouchableOpacity onPress={() => fetchParticipantsParEvent(event.id)}>
              <Icon name="person" size={30} color="blue" />
            </TouchableOpacity>
            {isAdmin && (
            <TouchableOpacity onPress={() => handleEditEvent(event.id)}>
              <Icon name="edit" size={30} color="purple" />
            </TouchableOpacity>
            )}
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
        <Modal
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalViewPlayers, { height: calculateModalHeight(participantsList.length) }]}>
              <Text style={styles.modalTitle}>Participants de l'Événement</Text>

              {participantsList.length === 0 ? (
                <Text style={styles.modalText}>Pas encore de participants inscrits.</Text>
              ) : (
                <ScrollView>
                  {participantsList.map((participant) => (
                    <Text key={participant.user_id} style={styles.modalText}>
                      {participant.prenom} {participant.nom}
                    </Text>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    );

  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <View style={styles.container}>
          <TouchableOpacity style={styles.legendButton} onPress={toggleLegend}>
            <Text style={styles.legendButtonText}>Voir la légende des couleurs</Text>
          </TouchableOpacity>
          {legendVisible && <Legend />}

          {isJoueur && (
            <Calendar
              onDayPress={handleDayPress} // Mettez à jour la date sélectionnée
              markedDates={customDatesStyles}
              markingType="custom"
            />
          )}

          {isAdmin && (
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setDate(day.dateString);
                openColorModal();
              }}
              markedDates={customDatesStyles}
              markingType="custom"
            />
          )}
          {/* Condition pour afficher le formulaire de création uniquement pour les administrateurs */}
          {isAdmin && (
            <>
              <View style={styles.formContainer}>
                <Text style={styles.title}>Formulaire</Text>

                <View style={[styles.inputContainer, { marginBottom: 18 }]}>
                  <SelectList
                    placeholder="status"
                    setSelected={(val) => setStatus(val)}
                    data={data}
                    save="value"
                    style={styles.choix}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Titre"
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date"
                  value={date}
                  onChangeText={(text) => setDate(text)}
                />

                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="time"
                  onConfirm={handleConfirm}
                  onCancel={hideDatePicker}
                  textColor="black"

                />


                <TouchableOpacity style={styles.input} onPress={() => setDatePickerVisibility(true)}>
                  <Text style={styles.buttonTextHeure}>
                    {time ? moment(time).format('HH:mm') : 'Choisir l\'heure'}
                  </Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.button} onPress={createEvent}>
                  <Text style={styles.buttonText}>Créer un événement</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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

          {isAdmin && isColorModalVisible && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={isColorModalVisible}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.colorselection}>Sélectionnez une couleur :</Text>
                {COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.colorOption, { backgroundColor: color }]}
                    onPress={() => {
                      changeTerrainColor(color);
                    }}
                  />
                ))}
                <TouchableOpacity
                  style={styles.closeButtonCouleur}
                  onPress={() => setColorModalVisible(false)}
                >
                  <Text style={styles.closeButtonTextColor}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Calendrier;