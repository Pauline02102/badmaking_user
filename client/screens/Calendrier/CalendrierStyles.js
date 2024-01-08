import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 40,

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
  matchItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    backgroundColor: '#cee3ed', // Couleur de fond blanc pour chaque match
    borderRadius: 10
  },
  badmintonPlayer: {
    //borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#00887e', // Couleur de fond bleu pour chaque joueur
    borderRadius: 10
  },
  legendButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
  },
  legendButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "#214353",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  buttonClose: {
    backgroundColor: "#559ea2",
    borderRadius: 20,
    padding: 7,
    elevation: 2,
    marginTop: 15

  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  legendTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: 'bold',
    color: "#e4ebef"
  },
  legendText: {
    textAlign: "center",
    marginVertical: 5,
    color: "#e4ebef"
  },
  eventItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#467c86",
    marginBottom: 5,
  },
  eventTitle2: {
    fontSize: 20, // Augmenter la taille de la police
    fontWeight: 'bold', // Rendre le texte en gras
    color: "#123e53", // Choisir une couleur qui correspond au thème
    marginBottom: 10, // Ajouter une marge en bas
    marginTop: 10, // Ajouter une marge en haut
    textAlign: 'center', // Centrer le texte
  },
  eventInfo: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },
  participationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  }, confirmationMessage: {
    fontSize: 16,
    color: 'green', // Couleur de texte de confirmation
    marginVertical: 10, // Espacement vertical
    textAlign: 'center', 
  },
  modalViewPlayers: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 450,
    maxHeight: '90%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: "#333"
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
    color: '#000'
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  colorselection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ccc",
    color: "black",
    borderRadius: 10
  },
  colorOption: {
    width: 50,
    height: 50,
    margin: 10,
    borderRadius: 25,
  },  
  colorOptionText: {
    color: 'white', // Texte en blanc
    fontWeight: 'bold', // Texte en gras
  },
  colorOptionContainer: {
    
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Espacement entre les options de couleur
  },
  closeButtonCouleur: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 10
  },
  closeButtonTextColor:{
    color: "black",
    textAlign: "center",

  },  
  button: {
    alignItems: "center",
    backgroundColor: "#467c86",
    padding: 12,
    borderRadius: 15, // Augmenté pour plus de courbure
    margin: 5, // Ajout d'une marge entre les boutons
    borderColor: "#000000", // Bordure noire
    borderWidth: 1, // Bordure fine
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: "#B0C4DE",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 15,
    borderRadius: 15, // Augmenté pour plus de courbure
    backgroundColor: "#F8F8FF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 24, // Taille de police importante pour le titre
    color: "#123e53", // Couleur harmonieuse avec le style du bouton
    textAlign: "center", // Alignement centré
    marginTop: 20, // Espace en dessous du titre
    marginBottom: 20,
    fontWeight:'bold'
  },
  buttonHeure:{
    alignItems: "Left",
    height: 50,
    backgroundColor: "#F8F8FF",
    padding: 10,
    paddingLeft: 15,
    borderRadius: 15, // Augmenté pour plus de courbure
    margin: 5, // Ajout d'une marge entre les boutons
    borderColor: "#000000", // Bordure noire
    borderWidth: 1, // Bordure fine
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonTextHeure:{
    paddingTop:15,
    fontSize: 15,
    color: "#141607",
  },
  formContainer: {
    borderWidth: 1, 
    borderColor: 'gray',
    borderRadius: 10, 
    padding: 10,
    backgroundColor: 'white', 
    shadowColor: 'black', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 4,
    elevation: 4, 
    marginBottom: 17, 
    marginTop : 20
  },
  editButton: {
    color: 'blue',
    marginTop: 8,
  },
  dateTimePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
        marginTop : 20,
  },
  dateTimePicker: {
    // Vos styles spécifiques au DateTimePicker ici
  },
  instructions: {
    marginTop: 8,
    marginBottom : 20,
    fontSize: 16,
    color: '#333',
    fontWeight:'bold'
  },
  confirmButton: {
    backgroundColor: '#467c86',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closedRegistrationText: {
    color: 'red', // Couleur du texte
    fontSize: 16, // Taille de la police
    fontWeight: 'bold', // Gras
    textAlign: 'center', // Alignement du texte
    marginTop: 10, // Marge en haut
    marginBottom: 10, // Marge en bas
  },


  
});

export default styles;