import React from 'react';
import '../styles/DeleteModalInvoice.css';

const DeleteModal = ({ isOpen, onClose, onConfirm, invoice }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Delete Invoice</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete invoice <strong>{invoice?.invoiceNum}</strong> for <strong>{invoice?.patientName}</strong>?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn-danger" 
            onClick={() => onConfirm(invoice)}
          >
            Delete Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;