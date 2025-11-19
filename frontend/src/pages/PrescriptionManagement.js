import React, { useState } from 'react';
import '../styles/PrescriptionManagement.css';
import AddNewMedicament from './AddNewMedicament';

// Sample medication data
const initialPrescriptionData = [
    {
      appointment_id: 1,
      medications: [
        {
          medication_id: 1,
          name: 'Amoxicillin',
          common_uses: 'Bacterial Infections, Dental Abscess'
        }
      ],
      dosage: '500mg',
      frequency_per_day: 'Twice a day',
      duration_by_days: '7 days',
      description: 'Take with food. Finish the entire course of medication.',
      prescribedDate: '10/26/2023'
    },
    {
      appointment_id: 2,
      medications: [
        {
          medication_id: 2,
          name: 'Ibuprofen',
          common_uses: 'Pain Relief, Anti-inflammatory'
        }
      ],
      dosage: '400mg',
      frequency_per_day: 'Three times a day',
      duration_by_days: '5 days',
      description: 'Take after meals to avoid stomach upset.',
      prescribedDate: '09/15/2023'
    },
    {
      appointment_id: 3,
      medications: [
        {
          medication_id: 3,
          name: 'Metformin',
          common_uses: 'Blood Sugar Control'
        }
      ],
      dosage: '850mg',
      frequency_per_day: 'Once a day',
      duration_by_days: '30 days',
      description: 'Take with breakfast. Monitor blood sugar levels.',
      prescribedDate: '08/01/2023'
    }
];

//initialMedecamentdata
const initialMedecamentdata = [
    { medication_id: 101, name: 'Paracetamol', common_uses: 'Pain Relief, Fever Reducer'},
    { medication_id: 102, name: 'Aspirin', common_uses: 'Pain Relief, Blood Thinner'},
    { medication_id: 103, name: 'Ciprofloxacin', common_uses: 'Bacterial Infections'},
    { medication_id: 104, name: 'Azithromycin', common_uses: 'Bacterial Infections'},
    { medication_id: 105, name: 'Omeprazole', common_uses: 'Acid Reflux, Ulcers'},
    { medication_id: 106, name: 'Lisinopril', common_uses: 'High Blood Pressure'}
];

function PrescriptionManagement() {
  const [assignedPrescriptions, setAssignedPrescriptions] = useState(initialPrescriptionData);

  const [masterMedications, setMasterMedications] = useState(initialMedecamentdata);

  const [selectedPrescription, setSelectedPrescription] = useState(assignedPrescriptions[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState(assignedPrescriptions[0] || null);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);

  const filteredMedications = masterMedications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setEditedPrescription(prescription);
    setIsEditing(false);
  };

  const handleRemovePrescription = (appointment_id, e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to remove this prescription?')) {
      const updatedPrescriptions = assignedPrescriptions.filter(
        p => p.appointment_id !== appointment_id
      );
      setAssignedPrescriptions(updatedPrescriptions);
      
      if (selectedPrescription?.appointment_id === appointment_id) {
        if (updatedPrescriptions.length > 0) {
          setSelectedPrescription(updatedPrescriptions[0]);
          setEditedPrescription(updatedPrescriptions[0]);
        } else {
          setSelectedPrescription(null);
          setEditedPrescription(null);
        }
      }
    }
  };

  const handleAddMedication = (medication) => {
    const newPrescription = {
      appointment_id: Date.now(),
      medications: [
        {
          medication_id: medication.medication_id,
          name: medication.name,
          common_uses: medication.common_uses
        }
      ],
      dosage: 'Enter dosage',
      frequency_per_day: 'Once a day',
      duration_by_days: '7 days',
      description: '',
      prescribedDate: new Date().toLocaleDateString('en-US')
    };
    
    setAssignedPrescriptions([newPrescription, ...assignedPrescriptions]);
    setSelectedPrescription(newPrescription);
    setEditedPrescription(newPrescription);
    setIsEditing(true);
    setSearchTerm('');
  };

  const handleAddNewMedicationToMaster = (newMed) => {
    const maxId = Math.max(...masterMedications.map(med => med.medication_id), 0);
    const newId = maxId + 1;

    const completeMedication = {
      medication_id: newId,
      name: newMed.name,
      common_uses: newMed.common_uses || 'Not specified',
    };

    setMasterMedications([completeMedication, ...masterMedications]);
  };

  const handleFieldChange = (field, value) => {
    setEditedPrescription({
      ...editedPrescription,
      [field]: value
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedPrescriptions = assignedPrescriptions.map(p =>
      p.appointment_id === editedPrescription.appointment_id ? editedPrescription : p
    );
    setAssignedPrescriptions(updatedPrescriptions);
    setSelectedPrescription(editedPrescription);
    setIsEditing(false);
    alert('Prescription saved successfully!');
  };

  return (
    <div className="prescription-container">
      <main className="main-content">
        <div className="content-grid">
          {/* Left Sidebar */}
          <div className="sidebar">
            {/* Page Header - Moved Inside */}
            <div className="page-header">
              <div>
                <h1>Prescription Management</h1>
                <p>Patient: John Appleseed (ID: P00123)</p>
              </div>
            </div>

            {/* Assigned Prescriptions */}
            <div className="card">
              <div className="card-header">
                <h2>Assigned Prescriptions</h2>
              </div>
              <div className="prescription-list">
                {assignedPrescriptions.map((prescription) => (
                  <div
                    key={prescription.appointment_id}
                    className={`prescription-item ${selectedPrescription?.appointment_id === prescription.appointment_id ? 'active' : ''}`}
                    onClick={() => handleSelectPrescription(prescription)}
                  >
                    <div className="prescription-icon">
                      <span className="material-symbols-outlined">pill</span>
                    </div>
                    <div className="prescription-info">
                      <p className="prescription-name">
                        {prescription.medications[0]?.name || 'Unknown'}
                      </p>
                      <p className="prescription-date">Prescribed on {prescription.prescribedDate}</p>
                    </div>
                    <button
                      className="remove-prescription-btn"
                      onClick={(e) => handleRemovePrescription(prescription.appointment_id, e)}
                      title="Remove prescription"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Prescription */}
            <div className="card">
              <div className="card-header">
                <h2>Add Prescription</h2>
              </div>
              <div className="add-medication-button-container">
                <button 
                  className="add-medication-button"
                  onClick={() => setShowAddMedicationModal(true)}
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Add New Medication
                </button>
              </div>
              <div className="search-container">
                <span className="material-symbols-outlined search-icon">search</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search medication master list..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="medication-list">
                {filteredMedications.map((medication) => (
                  <div key={medication.medication_id} className="medication-item">
                    <div className="medication-icon">
                      <span className="material-symbols-outlined">medication</span>
                    </div>
                    <div className="medication-info">
                      <p className="medication-name">{medication.name}</p>
                      <p className="medication-dosages">{medication.common_uses}</p>
                    </div>
                    <button
                      className="add-button"
                      onClick={() => handleAddMedication(medication)}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="details-section">
            {selectedPrescription ? (
              <div className="card details-card">
                <div className="details-header">
                  <div>
                    <h2>Prescription Details</h2>
                    <p>Details for {editedPrescription?.medications[0]?.name || 'Unknown'}, prescribed for John Appleseed.</p>
                  </div>
                  <button className="print-button">
                    <span className="material-symbols-outlined">print</span>
                    Print
                  </button>
                </div>

                <div className="details-grid">
                  <div className="form-group">
                    <label>Medication Name</label>
                    <div className="input-display">
                      <span className="material-symbols-outlined">medication</span>
                      <p>{editedPrescription?.medications[0]?.name || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Common Uses</label>
                    <div className="input-display">
                      <span className="material-symbols-outlined">info</span>
                      <p>{editedPrescription?.medications[0]?.common_uses || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Dosage</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editedPrescription?.dosage || ''}
                      onChange={(e) => handleFieldChange('dosage', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Frequency Per Day</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editedPrescription?.frequency_per_day || ''}
                      onChange={(e) => handleFieldChange('frequency_per_day', e.target.value)}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Duration (Days)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editedPrescription?.duration_by_days || ''}
                      onChange={(e) => handleFieldChange('duration_by_days', e.target.value)}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description / Instructions</label>
                    <textarea
                      className="form-textarea"
                      value={editedPrescription?.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows="4"
                      placeholder="Enter prescription instructions..."
                    />
                  </div>
                </div>

                <div className="details-footer">
                  <p className="created-date">Created: {selectedPrescription?.prescribedDate}</p>
                  <button
                    className={`save-button ${isEditing ? 'active' : ''}`}
                    onClick={handleSave}
                    disabled={!isEditing}
                  >
                    <span className="material-symbols-outlined">save</span>
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="card details-card">
                <div className="empty-state">
                  <span className="material-symbols-outlined empty-icon">inbox</span>
                  <h3>No Prescription Selected</h3>
                  <p>Select a prescription from the list or add a new one to get started.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Medication Modal */}
      {showAddMedicationModal && (
        <AddNewMedicament
          onAdd={handleAddNewMedicationToMaster}
          onClose={() => setShowAddMedicationModal(false)}
        />
      )}
    </div>
  );
}

export default PrescriptionManagement;