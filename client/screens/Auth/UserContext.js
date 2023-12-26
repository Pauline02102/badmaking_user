import React, { createContext, useState, useContext } from 'react';


{/*défini un fournisseur de contexte (UserProvider) qui utilise un état pour gérer les informations de l'utilisateur. Le hook personnalisé useUser permet d'accéder et de modifier l'état de l'utilisateur dans les composants de l'application.*/ }


// Création du contexte
const UserContext = createContext(null);

// Fournisseur de contexte
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // pour le rôle

  const contextValue = {
    isSignedIn,
    setIsSignedIn,
    user,
    setUser,
    userRole,    
    setUserRole
  };

  return (
    <UserContext.Provider  value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  return context;
};

export default UserContext;
