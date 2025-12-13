import React, { useState, useMemo, useEffect } from 'react';
import '../styles/MedicamentsDrugsList.css';
import AddNewMedicament from './AddNewMedicament';
import axios from 'axios';

// API Base URL - Change this to match your backend
const API_BASE_URL = 'http://localhost:5000/api/medications';

function MedicamentsDrugList() {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [editingCommonUses, setEditingCommonUses] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const itemsPerPage = 8;

  // Fetch all medications from database
  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      console.log('Fetching medications from:', API_BASE_URL);
      const response = await axios.get(API_BASE_URL);
      console.log('Medications fetched:', response.data);
      setMedications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching medications:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Failed to load medications. ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding new medication
  const handleAddMedication = async (newMed) => {
    try {
      console.log('Adding medication:', newMed);
      const response = await axios.post(API_BASE_URL, {
        name: newMed.name,
        common_uses: newMed.common_uses
      });
      console.log('Add response:', response.data);

      if (response.data.status === "New Medication create") {
        // Refresh the medications list
        await fetchMedications();
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Error adding medication:', err);
      console.error('Error details:', err.response?.data);
      alert('Failed to add medication: ' + (err.response?.data?.error || err.message));
    }
  };

  // Function to handle editing medication
  const handleEditMedication = async (medId, newCommonUses) => {
    try {
      console.log('Updating medication:', medId, newCommonUses);
      const response = await axios.put(`${API_BASE_URL}/${medId}`, {
        common_uses: newCommonUses
      });
      console.log('Update response:', response.data);

      if (response.data.status === "medication updated") {
        // Update local state
        setMedications(medications.map(med => 
          med.medication_id === medId ? { ...med, common_uses: newCommonUses } : med
        ));
        setEditingMed(null);
        setEditingCommonUses('');
      }
    } catch (err) {
      console.error('Error updating medication:', err);
      console.error('Error details:', err.response?.data);
      alert('Failed to update medication: ' + (err.response?.data?.error || err.message));
    }
  };

  // Function to handle deleting medication
  const handleDeleteMedication = async (medId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        console.log('Deleting medication:', medId);
        const response = await axios.delete(`${API_BASE_URL}/${medId}`);
        console.log('Delete response:', response.data);
        
        if (response.data.status === "Medication deleted") {
          // Remove from local state
          setMedications(medications.filter(med => med.medication_id !== medId));
        }
      } catch (err) {
        console.error('Error deleting medication:', err);
        console.error('Error details:', err.response?.data);
        alert('Failed to delete medication: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // Function to start editing
  const handleEditClick = (med) => {
    setEditingMed(med.medication_id);
    setEditingCommonUses(med.common_uses);
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingMed(null);
    setEditingCommonUses('');
  };

  // Function to save edit
  const handleSaveEdit = (medId) => {
    handleEditMedication(medId, editingCommonUses);
  };

  // Function to close the add form modal
  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  // Filter medications based on search
  const filteredMedications = useMemo(() => {
    return medications.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (med.common_uses && med.common_uses.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [medications, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedications = filteredMedications.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="dental-flow-medication">
        <div className="main-content-medication">
          <div className="loading-medication">
            <span className="material-symbols-outlined" style={{fontSize: '48px', marginBottom: '16px'}}>hourglass_empty</span>
            <p>Loading medications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dental-flow-medication">
        <div className="main-content-medication">
          <div className="error-medication">
            <div style={{textAlign: 'center'}}>
              <span className="material-symbols-outlined" style={{fontSize: '48px', marginBottom: '16px'}}>error</span>
              <p>{error}</p>
              <button 
                className="btn-primary-medication" 
                onClick={fetchMedications}
                style={{marginTop: '16px'}}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dental-flow-medication">
      {/* Main Content */}
      <main className="main-content-medication">
        <div className="content-wrapper-medication">
          {/* Page Heading */}
          <div className="page-heading-medication">
            <div>
              <h1 className="page-title-medication">Medicaments & Drugs</h1>
              <p className="page-subtitle-medication">Manage the master list of available medications for prescriptions.</p>
            </div>
            <div className="header-actions-medication">
              <button className="btn-primary-medication" onClick={() => { setShowAddForm(true); }}>
                <span className="material-symbols-outlined">add</span>
                <span>Add New Medicament</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="filter-section-medication">
            <div className="search-bar-medication">
                <div className="search-icon-medication">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  className="search-input-medication"
                  placeholder="Search by medication name..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
            </div>
          </div>

          {/* Data Table */}
          <div className="table-container-medication">
            <table className="medications-table-medication">
              <thead>
                <tr>
                  <th>MEDICATION NAME</th>
                  <th>COMMON USES</th>
                  <th className="actions-header-medication">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentMedications.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="no-data-medication">No medications found</td>
                  </tr>
                ) : (
                  currentMedications.map((med) => (
                    <tr key={med.medication_id}>
                      <td className="med-name-medication">
                        <div className="name-cell-medication">
                          <span>{med.name}</span>
                        </div>
                      </td>
                      <td className="text-muted-medication">
                        {editingMed === med.medication_id ? (
                          <input
                            type="text"
                            className="edit-input-medication"
                            value={editingCommonUses}
                            onChange={(e) => setEditingCommonUses(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          med.common_uses || 'N/A'
                        )}
                      </td>
                      <td className="actions-cell-medication">
                        {editingMed === med.medication_id ? (
                          <>
                            <button 
                              className="action-button-medication save-medication"
                              onClick={() => handleSaveEdit(med.medication_id)}
                              title="Save changes"
                            >
                              <span className="material-symbols-outlined">check</span>
                            </button>
                            <button 
                              className="action-button-medication cancel-medication"
                              onClick={handleCancelEdit}
                              title="Cancel editing"
                            >
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="action-button-medication"
                              onClick={() => handleEditClick(med)}
                              title={"Edit medication"}
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button 
                              className="action-button-medication delete-medication"
                              onClick={() => handleDeleteMedication(med.medication_id)}
                              title="Delete medication"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-section-medication">
            <p className="pagination-info-medication">
              Showing {filteredMedications.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredMedications.length)} of {filteredMedications.length} results
            </p>
            <div className="pagination-buttons-medication">
              <button
                className="pagination-nav-medication"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`pagination-number-medication ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="pagination-nav-medication"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
            <div className="add-medicament-container-medication">
                <AddNewMedicament
                  onAdd={handleAddMedication}
                  onClose={handleCloseForm}
                />
            </div>
        )}
      </main>
    </div>
  );
};

export default MedicamentsDrugList;