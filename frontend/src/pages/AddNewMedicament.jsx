import React, { useState } from "react";
import "../styles/AddNewMedicament.css";

function AddNewMedicament({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [common_uses, setCommonUses] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!common_uses.trim()) e.common_uses = "Please add at least one common use";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    const newMed = {
      name: name.trim(),
      common_uses: common_uses.trim(),
    };

    try {
      await onAdd(newMed);
      
      setName("");
      setCommonUses("");
      setErrors({});
    } catch (error) {
      console.error('Error in form submission:', error);
      setErrors({ submit: 'Failed to add medication. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-new-medicament">
      <div className="Form-container">
        <button className="close-btn" onClick={() => onClose()} disabled={isSubmitting}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="modal-title">Add New Medicament</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Name</label>
            {errors.name && <p className="error">{errors.name}</p>}
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Common Uses</label>
            {errors.common_uses && <p className="error">{errors.common_uses}</p>}
            <input
              type="text"
              className="form-input"
              value={common_uses}
              onChange={(e) => setCommonUses(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {errors.submit && <p className="error submit-error">{errors.submit}</p>}

          <button 
            className="submit-btn" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Medication'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddNewMedicament;