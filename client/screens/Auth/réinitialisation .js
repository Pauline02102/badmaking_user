import React, { useState } from 'react';

function ResetPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/user_tokens/request-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }), // Utilisation de l'état email
      });
  
      if (response.ok) {
        console.log('Demande de réinitialisation de mot de passe envoyée');
        // Gestion de la réponse
      } else {
        console.error('Erreur lors de la demande de réinitialisation');
        // Gestion des erreurs
      }
    } catch (error) {
      console.error('Erreur de réseau ou du serveur', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="submit">Réinitialiser le mot de passe</button>
    </form>
  );
}

export default ResetPassword;
