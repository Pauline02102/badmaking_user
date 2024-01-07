export default function CustomModal({ isOpen, content, onClose ,children }) {
    if (!isOpen) return null;

    return (
      <div style={modalStyle}>
        <div style={modalContentStyle}>
          <div dangerouslySetInnerHTML={{ __html: content }} /> 
          {children} 
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }

const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const modalContentStyle = {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    maxWidth: '400px',
    margin: '0 auto',
};
