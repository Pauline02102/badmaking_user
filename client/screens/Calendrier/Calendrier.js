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
  KeyboardAvoidingView,
  Platform,

} from "react-native";
import { Calendar } from "react-native-calendars";
import CustomModal from './CustomModal';

import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";

import { useNavigation } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from '../Auth/UserContext';
import styles from './CalendrierStyles';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';
import { useUser } from "../Auth/UserContext";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DatePicker from 'react-datepicker';
import { SelectList } from "react-native-dropdown-select-list";
import { utcToZonedTime } from 'date-fns-tz';
import { format, parseISO, isValid, parse, subHours, isBefore, setHours, setMinutes } from 'date-fns';
import './styles.css'
function Calendrier({ route }) {

  const [customDatesStyles, setCustomDatesStyles] = useState({});
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const navigation = useNavigation();
  const { prenom, setprenom } = route.params || {};
  const { id, setId } = route.params || {};
  const [showTimePicker, setShowTimePicker] = useState(false);

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
  const [selectedDateColor, setSelectedDateColor] = useState('');
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const startTime = new Date();
  startTime.setHours(19, 30);
  const endTime = new Date();
  endTime.setHours(23, 0);
  const [selectedTime, setSelectedTime] = useState(startTime);
  const [selectedTimeWeb, setSelectedTimeWeb] = useState('18:00');
  const [showButtons, setShowButtons] = useState(true);
  const data = [
    { key: "1", value: "Tous niveau" },
    { key: "2", value: "Par niveau" },
  ];


  const Arrow = ({ direction }) => {
    return <Icon name={direction === 'left' ? 'chevron-left' : 'chevron-right'} />;
  };

  const [time, setTime] = useState(new Date());
  const openColorModal = () => {
    setColorModalVisible(true);
  };
  useEffect(() => {
    fetchLoggedInUserInfo();
    fetchEvents();
    fetchDateColors();
    initializeDayColors();


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

  const handleTimeChange = (event) => {
    console.log("Nouvelle heure sélectionnée:", event.target.value); // Log pour le débogage
    setSelectedTimeWeb(event.target.value);
  };

  const handleConfirm = (date) => {

    setTime(date);
    hideDatePicker();
  };

  const initializeDayColors = () => {
    setDayColors({
      'monday': '#96dfa2',
      'tuesday': '#9199ff',
      'thursday': '#9199ff',
      'sunday': '#9199ff'
    });
  };

  // Mise à jour des couleurs
  const updateDayColor = (day, color) => {
    setDayColors({ ...dayColors, [day]: color });
  };


  const combinedDateTime = () => {
    const timeZone = 'Europe/Paris';
    const zonedDate = utcToZonedTime(date, timeZone);
    return format(zonedDate, 'yyyy-MM-dd HH:mm:ssX', { timeZone });
  };



  const createEvent = async () => {
    try {
      if (!loggedInUser || !loggedInUser.id) {
        console.error("Les informations de l'utilisateur ne sont pas disponibles");
        return;
      }

      let combinedDateTime;

      if (Platform.OS === 'web') {
        // Pour le web,  selectedTimeWeb
        const [hours, minutes] = selectedTimeWeb.split(':');
        const dateObject = parseISO(date);
        combinedDateTime = setMinutes(setHours(dateObject, parseInt(hours, 10)), parseInt(minutes, 10));
      } else {
        // Pour le mobile,  time
        const dateObject = parseISO(date);
        const timeObject = new Date(time);
        combinedDateTime = setMinutes(setHours(dateObject, timeObject.getHours()), timeObject.getMinutes());
      }

      // Convert to the desired timezone and format
      const timeZone = 'Europe/Paris';
      const zonedDateTime = utcToZonedTime(combinedDateTime, timeZone);
      const formattedDateTime = format(zonedDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX", { timeZone });

      console.log("formattedDateTime:", formattedDateTime);

      await axios.post(`${BASE_URL}/event/postcalendar`, {
        title,
        status,
        date: formattedDateTime,
        heure: format(zonedDateTime, "HH:mm:ss"),
        user_id: loggedInUser.id,
      });

      console.log("Données envoyées à l'API:", {
        title,
        status,
        date: formattedDateTime,
        heure: format(zonedDateTime, "HH:mm:ss"),
        user_id: loggedInUser.id,
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
        console.error('page calendrier : Token non trouvé');
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
        // Vérifie si 'role' est défini avant d'appeler toLowerCase()
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
      console.log("Valeur de 'selectedDate' avant la mise à jour :", selectedDate);

      let body;
      if (currentColor === 'white') {

        body = { date: selectedDate, color: null };
      } else {

        body = { date: selectedDate, color: currentColor };
      }

      const response = await axios.post(
        `${BASE_URL}/date_color/associateColorToDate`,
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
    // Vérifier si l'heure sélectionnée est dans la plage autorisée
    if (selectedTime >= startTime && selectedTime <= endTime) {
      setSelectedTime(selectedTime); // Sauvegarder l'heure sélectionnée
      console.log("Heure sélectionnée:", selectedTime);
    } else {
      // Informer l'utilisateur ou ajuster automatiquement l'heure
      Alert.alert("Heure non autorisée", "Veuillez sélectionner une heure entre 19:30 et 23:00.");
      setSelectedTime(startTime); // Réinitialiser à l'heure de début ou la plus proche valide
    }
  };

  const onTimeSelectedWeb = (date) => {
    setSelectedTime(date); // Sauvegarder directement l'heure sélectionnée
    console.log("Heure sélectionnée:", date);
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
  const handleModalResponseWeb = (response) => {
    if (response === "Oui") {
      confirmParticipationWithTime();
    } else {
      sendParticipation("Non");
    }
    setIsModalVisible(false); // Fermer le modal
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/event/calendar`);
      const eventsByDate = {};
      response.data.forEach((event) => {
        //const eventDate = event.date.split("T")[0];
        const eventDate = format(utcToZonedTime(event.date, 'Europe/Paris'), 'yyyy-MM-dd');
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
        // Vérifie si l'application est en cours d'exécution dans un navigateur web
        if (Platform.OS === 'web') {
          // Utilisation de window.alert pour les utilisateurs web
          window.alert("Vous êtes inscrit à l'événement! Les matchs seront disponibles 24h avant l'événement");
        } else {
          // Utilisation de Alert.alert pour les autres plateformes (comme iOS et Android)
          Alert.alert("Confirmation", "Vous êtes inscrit à l'événement! \n Les matchs seront disponibles 24h avant l'événement", [
            {
              text: "OK",
              onPress: () => console.log("Confirmation de l'inscription"),
            },
          ]);
        }
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
          date: format(parseISO(selectedDate), 'yyyy-MM-dd'),
          heure: formattedTime,
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

      // Vérifie si les données sont correctement renvoyées depuis le backend

      const backendDates = response.data;

      // Convertir les dates dans le format 'YYYY-MM-DD'
      const convertedDates = {};

      for (const date in backendDates) {
        try {
          // Parse the date using JavaScript's Date constructor
          const parsedDate = new Date(date);
          const formattedDate = format(parsedDate, 'yyyy-MM-dd');
          convertedDates[formattedDate] = backendDates[date];
        } catch (parseError) {
          console.error(`Error parsing date: ${date}`, parseError);
        }
      }


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
      console.log(participants);

      // Vérifier si la date est passée
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit pour la comparaison
      const selectedDate = new Date(selectedDateString);
      selectedDate.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit pour la comparaison
      const isDatePassed = selectedDate < today;
      // Vérifier si la couleur de la date est verte ou bleue
      const color =
        customDatesStyles[selectedDateString]?.customStyles?.container
          ?.backgroundColor;
      setSelectedDateColor(color);


      if (Platform.OS !== 'web') {
        if ((color === "#96dfa2" || color === "#9199ff") && !isDatePassed) {
          const readableDate = format(parseISO(selectedDateString), 'dd/MM/yyyy');
          setShowTimePicker(true);
          setShowConfirmButton(true);
          console.log("Participants présents :", participants);

          // Mise à jour de l'état selectedTime avec l'heure de la base de données
          if (participants.length > 0) {
            Alert.alert(
              `Viens-tu au jeu libre le ${readableDate}?`,
              "Voici les joueurs présents:\n" + participants.map((participant) => {
                // Extracting hours and minutes from the 'heure' property
                const [hours, minutes] = participant.heure.split(':');
                return `${participant.prenom} ${participant.nom} à ${hours}:${minutes}`;
              }).join(", \n"),
              [
                { text: "Non", onPress: () => sendParticipation("Non"), style: "cancel" },
                { text: "Oui", onPress: () => confirmParticipationWithTime() },
                { text: "Fermer", onPress: () => console.log("Boîte de dialogue fermée"), style: "cancel" }
              ]
            );

          }
        } else if (color === '#e05642') {
          setShowTimePicker(false);
          setShowConfirmButton(false);
          Alert.alert("Information", "Salle fermée");
        } else if (color === "#eac849") {
          setShowTimePicker(false);
          setShowConfirmButton(false);
        }
      } else {
        if ((color === "#96dfa2" || color === "#9199ff")) {
          if (!isDatePassed) {
            const readableDate = format(parseISO(selectedDateString), 'dd/MM/yyyy');
            const modalMessage = `<strong> Viens-tu au jeu libre le ${readableDate}?, <br/> <br/> Voici les joueurs présents: <br/>  <br/> </strong>  ${participants.map((participant) => {
              // Extracting hours and minutes from the 'heure' property
              const [hours, minutes] = participant.heure.split(':');
              return `${participant.prenom} ${participant.nom} à ${hours}:${minutes}`;
            }).join("<br/>")}`;
            setModalContent(modalMessage);
            setIsModalVisible(true);
            setShowTimePicker(true); // Afficher le sélecteur de temps
            setShowConfirmButton(true); // Afficher le bouton de confirmation
            setShowButtons(true);
          } else {
            // Affiche une alerte si la date est passée
            window.alert("Impossible de s'inscrire au jeu libre pour une date antérieure");
          }
        } else if (color === '#e05642') {
          setModalContent(" <strong> <br/> La salle est fermée pour cette date </strong>");
          setIsModalVisible(true);
          setShowConfirmButton(false);
          setShowButtons(false);
        } else if (color === "#eac849") {
          setShowTimePicker(false);
          setShowConfirmButton(false);
        }

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
          <Text style={styles.legendText}><Text style={{ color: '#96dfa2' }}>●</Text>  Jeu libre au Verseau</Text>
          <Text style={styles.legendText}><Text style={{ color: '#9199ff' }}>●</Text> Jeu libre à Rixensart</Text>
          <Text style={styles.legendText}><Text style={{ color: '#eac849' }}>●</Text>  Soirée à thème</Text>
          <Text style={styles.legendText}><Text style={{ color: '#e05642' }}>●</Text>  Fermeture de la salle</Text>

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
    console.log(eventId)
  };

  const isRegistrationOpen = (eventDateTime) => {
    const now = new Date();
    const eventMoment = subHours(parseISO(eventDateTime), 24);
    return isBefore(now, eventMoment);
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
            <Text style={styles.eventInfo}>Date : {format(parseISO(event.date), 'PP')}</Text>
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

            {isRegistrationOpen(`${event.date}T${event.heure}`) ? (
              <View style={styles.participationButtons}>
                <TouchableOpacity onPress={() => handleParticipation(event.id, "Oui")}>
                  <Icon name="check-circle" size={30} color="green" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleParticipation(event.id, "Non")}>
                  <Icon name="cancel" size={30} color="red" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.closedRegistrationText}>Inscription fermée</Text>
            )}
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
  const colorOptions = [
    { color: '#e05642', text: 'Fermé' },
    { color: '#96dfa2', text: 'Verseau' },
    { color: '#9199ff', text: 'Rixensart' },
    { color: '#eac849', text: 'Evènement' },
    { color: 'white', text: 'Retirer' },
  ];

  const CustomTimePicker = () => {

    if (Platform.OS === 'web') {
      // Sur le web,  react-datepicker
      return (
        <DatePicker
          selected={selectedTime}
          onChange={date => onTimeSelectedWeb(date)}
          showTimeSelect
          showTimeSelectOnly
          dateFormat="HH:mm"
          timeCaption=""
          className="hide-time-list"

        />
      );


    } else {
      // Sur le mobile,  DateTimePicker
      return (

        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeSelected}
          style={styles.dateTimePicker}
          minimumDate={startTime} // Définir l'heure de début minimale
          maximumDate={endTime} // Définir l'heure de fin maximale
        />
      );
    }
  };

  const CustomDateTimePicker = () => {
    if (Platform.OS === 'web') {
      // Sur le web,  un DatePicker HTML5
      return (
        <input
          type="time"
          onChange={handleTimeChange}// Gérer le changement de temps
          value={selectedTimeWeb}        // La valeur sélectionnée (heure)
          style={{ /* Styles optionnels pour le sélecteur d'heure */ }}
        />
      );
    } else {
      // Sur le mobile,  DateTimePickerModal
      return (
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          textColor="black"
        />
      );
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.container}>
          <TouchableOpacity style={styles.legendButton} onPress={toggleLegend}>
            <Text style={styles.legendButtonText}>Voir la légende des couleurs</Text>
          </TouchableOpacity>
          {legendVisible && <Legend />}

          {isJoueur && (
            <Calendar
              onDayPress={handleDayPress}
              markedDates={customDatesStyles}
              markingType="custom"
              renderArrow={(direction) => <Arrow direction={direction} />}
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
              renderArrow={(direction) => <Arrow direction={direction} />}
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
                {CustomDateTimePicker()}


                {Platform.OS !== 'web' && (
                  <TouchableOpacity style={styles.input} onPress={() => setDatePickerVisibility(true)}>
                    <Text style={styles.buttonTextHeure}>
                      {time ? format(time, 'HH:mm') : 'Choisir l\'heure'}
                    </Text>
                  </TouchableOpacity>
                )}


                <TouchableOpacity style={styles.button} onPress={createEvent}>
                  <Text style={styles.buttonText}>Créer un événement</Text>
                </TouchableOpacity>
              </View>
            </>
          )}


          {showTimePicker && (
            <View style={styles.dateTimePickerContainer}>
              <Text style={styles.instructions}>Choisissez l'heure avant de confirmer</Text>
              {CustomTimePicker()}
              {showConfirmButton && (

                <TouchableOpacity style={styles.confirmButton} onPress={confirmTime}>
                  <Text style={styles.confirmButtonText}>Confirmer la participation</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.eventTitle2}>{selectedDateColor !== '#9199ff' && selectedDateColor !== '#96dfa2'
            ? ' Événements :'
            : ''}</Text>

          {renderEventsForDate()}
          {isAdmin && isColorModalVisible && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={isColorModalVisible}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.colorselection}>Sélectionnez une couleur :</Text>
                {colorOptions.map((option, index) => (
                  <View key={index} style={styles.colorOptionContainer}>
                    <TouchableOpacity
                      style={[styles.colorOption, { backgroundColor: option.color }]}
                      onPress={() => {
                        changeTerrainColor(option.color);
                      }}
                    />
                    <Text style={styles.colorOptionText}>{option.text}</Text>
                  </View>
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

          <CustomModal
            isOpen={isModalVisible}
            content={modalContent}
            onClose={() => setIsModalVisible(false)}
          >
            {showButtons && (
              <>
                <button onClick={() => handleModalResponseWeb("Oui")} className="button">Oui</button>
                <button onClick={() => handleModalResponseWeb("Non")} className="button">Non</button>
              </>

            )}
          </CustomModal>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Calendrier;