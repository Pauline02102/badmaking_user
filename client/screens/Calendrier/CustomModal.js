
import React from 'react';export default function CustomModal({ isOpen, content, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div style={modalContainerStyle} className="custom-modal">
      <div style={modalBackgroundStyle} onClick={onClose}></div>
      <div style={modalContentStyle} className="modal-content">
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {children}
        <button
          style={closeButtonStyle}
          onClick={onClose}
          className="close-button"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
// Styles CSS dans des constantes
const modalContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
};

const modalBackgroundStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: -1,
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  maxWidth: '400px',
  margin: '0 auto',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  fontFamily: 'Arial',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '5px', // Réduit la distance depuis le haut
  right: '5px', // Réduit la distance depuis la droite
  backgroundColor: '#ff6b6b',
  color: '#fff',
  padding: '2px 4px', // Ajuste le padding pour réduire la taille du bouton
  fontSize: '12px', // Réduit la taille de la police
  border: 'none',
  borderRadius: '3px', // Réduit le rayon de la bordure
  cursor: 'pointer',
  fontWeight: 'bold',
  textAlign: 'center',
};


const closeButtonHoverStyle = {
  backgroundColor: '#ff4646',
};

