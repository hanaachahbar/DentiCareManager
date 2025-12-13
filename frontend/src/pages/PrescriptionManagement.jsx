import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/PrescriptionManagement.css";
import AddNewMedicament from "./AddNewMedicament";

function PrescriptionManagement() {
  const { appointmentId } = useParams();
  const [assignedPrescriptions, setAssignedPrescriptions] = useState([]);
  const [masterMedications, setMasterMedications] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [editedPrescription, setEditedPrescription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api/prescriptions";

  //normalize API response to array of prescriptions
  const normalizePrescriptions = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") return [data];
    return [];
  };

  // Load all needed data
  const loadAllData = async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError("");
    try {
      const [presRes, availRes, patientRes] = await Promise.all([
        axios.get(`${API_BASE}/${appointmentId}`),
        axios.get(`${API_BASE}/${appointmentId}/available-medications`),
        axios.get(`${API_BASE}/${appointmentId}/patient-data`),
      ]);

      const presData = normalizePrescriptions(presRes.data);
      setAssignedPrescriptions(presData);
      setMasterMedications(Array.isArray(availRes.data) ? availRes.data : []);
      setPatientData(Array.isArray(patientRes.data) && patientRes.data.length > 0 ? patientRes.data[0] : null);

      // set defaults for selected / edited
      if (presData.length > 0) {
        setSelectedPrescription(presData[0]);
        setEditedPrescription({ ...presData[0] });
      } else {
        setSelectedPrescription(null);
        setEditedPrescription(null);
      }
    } catch (err) {
      console.error("loadAllData error:", err.response?.data || err.message);
      setError("Failed to load prescription data.");
      setAssignedPrescriptions([]);
      setMasterMedications([]);
      setPatientData(null);
      setSelectedPrescription(null);
      setEditedPrescription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  // Filter meds by search term
  const filteredMedications = masterMedications.filter((med) =>
    (med.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select a prescription from list
  const handleSelectPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setEditedPrescription({ ...prescription }); // clone to edit safely
    setIsEditing(false);
  };

  // Delete prescription
  const handleRemovePrescription = async (prescription, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this prescription?")) return;

    const medication_id = prescription.medication_id;
    try {
      await axios.delete(`${API_BASE}/${appointmentId}/${medication_id}`);
      await loadAllData();
    } catch (err) {
      console.error("delete error:", err.response?.data || err.message);
      alert("Failed to remove prescription.");
    }
  };


  const handleAddMedication = async (medication) => {
    const medication_id = medication.medication_id;
    try {
      await axios.post(`${API_BASE}/${appointmentId}/${medication_id}`);
      await loadAllData();
      setSearchTerm("");
      setShowAddMedicationModal(false);
    } catch (err) {
      console.error("add medication error:", err.response?.data || err.message);
      if (err.response?.status === 409) {
        alert("This medication is already prescribed for this appointment.");
      } else {
        alert("Failed to add medication -appointment doesn't exist-.");
      }
    }
  };

  // Field changes for edited prescription
  const handleFieldChange = (field, value) => {
    setEditedPrescription((prev) => ({ ...(prev || {}), [field]: value }));
    setIsEditing(true);
  };

  // Save updated prescription
  const handleSave = async () => {
    if (!editedPrescription) return;
    const medication_id = editedPrescription.medication_id;
    try {
      const payload = {
        dosage: editedPrescription.dosage || null,
        frequency_per_day: editedPrescription.frequency_per_day || null,
        duration_by_days: editedPrescription.duration_by_days || null,
        description: editedPrescription.description || null,
      };

      await axios.put(`${API_BASE}/${appointmentId}/${medication_id}`, payload);
      setIsEditing(false);
      await loadAllData();
      alert("Prescription saved successfully!");
    } catch (err) {
      console.error("save error:", err.response?.data || err.message);
      alert("Failed to save prescription.");
    }
  };

  // Add new medication -------fix later after Merge PR ------------
  const handleAddNewMedicationToMaster = async (newMed) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/medications`, {
        name: newMed.name,
        common_uses: newMed.common_uses
      });
      if (res.data && res.data.medication_id) {
        setMasterMedications((prev) => [res.data, ...prev]);
      } else {
        // fallback: reload available meds
        const availRes = await axios.get(`${API_BASE}/${appointmentId}/available-medications`);
        setMasterMedications(Array.isArray(availRes.data) ? availRes.data : []);
      }
      setShowAddMedicationModal(false);
    } catch (err) {
      console.error("add new medication to master error:", err.response?.data || err.message);
      alert("Failed to add medication to master list.");
    }
  };

  // Print all prescriptions
  const printAllPrescriptions = (prescriptions) => {
    if (!prescriptions || prescriptions.length === 0) return;

    const prescriptionCards = prescriptions
      .map((p, idx) => {
        const medName = p.medication_name || "—";
        const common = p.common_uses || "—";
        return `
        <div class="print-card">
          <div class="card-header"><h3>Prescription #${idx + 1}</h3></div>
          <div class="card-row"><span class="label">Medication:</span> <span class="value">${medName}</span></div>
          <div class="card-row"><span class="label">Common Uses:</span> <span class="value">${common}</span></div>
          <div class="card-row"><span class="label">Dosage:</span> <span class="value">${p.dosage || '—'}</span></div>
          <div class="card-row"><span class="label">Frequency:</span> <span class="value">${p.frequency_per_day || '—'}</span></div>
          <div class="card-row"><span class="label">Duration:</span> <span class="value">${p.duration_by_days || '—'}</span></div>
          <div class="card-row"><span class="label">Description:</span> <span class="value">${p.description || '—'}</span></div>
        </div>
      `;
      })
      .join("");

    const content = `
      <html>
        <head>
          <title>All Prescriptions</title>
          <link rel="stylesheet" href="/print.css" />
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <h2>Clinic Name</h2>
              <p><strong>Doctor:</strong> Doctor Name</p>
              <p><strong>Patient:</strong> ${patientData?.first_name ?? "Unknown"} ${patientData?.last_name ?? ""}</p>
              <p><strong>Date of Birth:</strong> ${patientData?.date_of_birth ?? ""} </p>
            </div>
            ${prescriptionCards}
          </div>
          <script>window.onload=function(){window.print();}</script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=900,height=700");
    if (w) {
      w.document.open();
      w.document.write(content);
      w.document.close();
      w.focus();
    } else {
      alert("Please allow pop-ups for this site to print prescriptions.");
    }
  };

  // Safe guard renderers
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="prescription-container-prescription">
      <main className="main-content-prescription">
        <div className="content-grid-prescription">
          {/* Sidebar */}
          <div className="sidebar-prescription">
            <div className="page-header-prescription">
              <div>
                <h1>Prescription Management</h1>
                <p>Patient: {patientData?.first_name ?? "Unknown"} {patientData?.last_name ?? ""}</p>
              </div>
            </div>

            {/* Assigned Prescriptions */}
            <div className="card-prescription">
              <div className="card-header-prescription">
                <h2>Assigned Prescriptions</h2>
              </div>
              <div className="prescription-list-prescription">
                {assignedPrescriptions.length === 0 ? (
                  <div style={{ padding: 16 }}>No prescriptions assigned.</div>
                ) : (
                  assignedPrescriptions.map((prescription) => (
                    <div
                      key={prescription.medication_id ?? `${prescription.appointment_id}-${Math.random()}`}
                      className={`prescription-item-prescription ${
                        selectedPrescription?.medication_id === prescription.medication_id ? "active" : ""
                      }`}
                      onClick={() => handleSelectPrescription(prescription)}
                    >
                      <div className="prescription-icon-prescription">
                        <span className="material-symbols-outlined">pill</span>
                      </div>

                      <div className="prescription-info-prescription">
                        <p className="prescription-name-prescription">{prescription.medication_name || "Unknown"}</p>
                      </div>

                      <button
                        className="remove-prescription-btn-prescription"
                        onClick={(e) => handleRemovePrescription(prescription, e)}
                        title="Remove prescription"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Medication */}
            <div className="card-prescription">
              <div className="card-header-prescription">
                <h2>Add Medication</h2>
              </div>

              <div className="add-medication-button-container-prescription">
                <button className="add-medication-button-prescription" onClick={() => setShowAddMedicationModal(true)}>
                  <span className="material-symbols-outlined">add_circle</span> Add New Medication
                </button>
              </div>

              <div className="search-container-prescription">
                <span className="material-symbols-outlined search-icon-prescription">search</span>
                <input
                  type="text"
                  className="search-input-prescription"
                  placeholder="Search medication master list..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="medication-list-prescription">
                {filteredMedications.length === 0 ? (
                  <div style={{ padding: 12 }}>No available medications.</div>
                ) : (
                  filteredMedications.map((med) => (
                    <div key={med.medication_id} className="medication-item-prescription">
                      <div className="medication-icon-prescription">
                        <span className="material-symbols-outlined">medication</span>
                      </div>
                      <div className="medication-info-prescription">
                        <p className="medication-name-prescription">{med.name}</p>
                        <p className="medication-dosages-prescription">{med.common_uses}</p>
                      </div>
                      <button className="add-button-prescription" onClick={() => handleAddMedication(med)}>
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Details */}
          <div className="details-section-prescription">
            {selectedPrescription ? (
              <div className="card-prescription details-card-prescription">
                <div className="details-header-prescription">
                  <div>
                    <h2>Prescription Details</h2>
                    <p>
                      Details for <strong>{editedPrescription?.medication_name || "Unknown"}</strong>, prescribed for {patientData?.first_name ?? "Unknown"} {patientData?.last_name ?? ""}.
                    </p>
                  </div>

                  <div>
                    <button className="print-button-prescription" onClick={() => printAllPrescriptions(assignedPrescriptions)}>
                      <span className="material-symbols-outlined">print</span> Print
                    </button>
                  </div>
                </div>

                <div className="details-grid-prescription">
                  <div className="form-group-prescription">
                    <label>Medication Name</label>
                    <div className="input-display-prescription">
                      <span className="material-symbols-outlined">medication</span>
                      <p>{editedPrescription?.medication_name || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="form-group-prescription">
                    <label>Common Uses</label>
                    <div className="input-display-prescription">
                      <span className="material-symbols-outlined">info</span>
                      <p>{editedPrescription?.common_uses || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="form-group-prescription">
                    <label>Dosage</label>
                    <input
                      type="text"
                      className="form-input-prescription"
                      value={editedPrescription?.dosage ?? ""}
                      onChange={(e) => handleFieldChange("dosage", e.target.value)}
                      placeholder= "Dosage..."
                    />
                  </div>

                  <div className="form-group-prescription">
                    <label>Frequency Per Day</label>
                    <input
                      type="text"
                      className="form-input-prescription"
                      value={editedPrescription?.frequency_per_day ?? ""}
                      onChange={(e) => handleFieldChange("frequency_per_day", e.target.value)}
                      placeholder="Frequency Per Day..."
                    />
                  </div>

                  <div className="form-group-prescription full-width-prescription">
                    <label>Duration (Days)</label>
                    <input
                      type="text"
                      className="form-input-prescription"
                      value={editedPrescription?.duration_by_days ?? ""}
                      onChange={(e) => handleFieldChange("duration_by_days", e.target.value)}
                      placeholder="Duration..."
                    />
                  </div>

                  <div className="form-group-prescription full-width-prescription">
                    <label>Description / Instructions</label>
                    <textarea
                      className="form-textarea-prescription"
                      value={editedPrescription?.description ?? ""}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      rows="4"
                      placeholder="Enter prescription instructions..."
                    />
                  </div>
                </div>

                <div className="details-footer-prescription">
                  <button
                    className={`save-button-prescription ${isEditing ? "active" : ""}`}
                    onClick={handleSave}
                    disabled={!isEditing}
                  >
                    <span className="material-symbols-outlined">save</span> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-prescription details-card-prescription">
                <div className="empty-state-prescription">
                  <span className="material-symbols-outlined empty-icon-prescription">inbox</span>
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
        <AddNewMedicament onAdd={handleAddNewMedicationToMaster} onClose={() => setShowAddMedicationModal(false)} />
      )}
    </div>
  );
}

export default PrescriptionManagement;
