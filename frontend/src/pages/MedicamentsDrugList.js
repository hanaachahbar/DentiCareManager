import React, { useState, useMemo } from 'react';
import '../styles/MedicamentsDrugsList.css';
import AddNewMedicament from './AddNewMedicament';

// Sample medication data
const initialMedicationsData = [
  {
    id: 1,
    name: 'Amoxicillin',
    commonUses: 'Bacterial Infections, Dental Abscess',
  },
  {
    id: 2,
    name: 'Ibuprofen',
    commonUses: 'Pain Relief, Anti-inflammatory',
  },
  {
    id: 3,
    name: 'Chlorhexidine Gluconate',
    commonUses: 'Gingivitis, Periodontitis',
  },
  {
    id: 4,
    name: 'Penicillin VK',
    commonUses: 'Severe Bacterial Infections',
  },
  {
    id: 5,
    name: 'Acetaminophen',
    commonUses: 'Pain Relief, Fever Reducer',
  },
  {
    id: 6,
    name: 'Lidocaine HCI',
    commonUses: 'Local Anesthetic',
  },
  {
    id: 7,
    name: 'Clindamycin',
    commonUses: 'Bacterial Infections',
  },
  {
    id: 8,
    name: 'Naproxen',
    commonUses: 'Pain Relief, Anti-inflammatory',
  },
  {
    id: 9,
    name: 'Codeine',
    commonUses: 'Moderate to Severe Pain',
  },
  {
    id: 10,
    name: 'Metronidazole',
    commonUses: 'Periodontal Infections',
  },
  {
    id: 11,
    name: 'Benzocaine',
    commonUses: 'Topical Anesthetic',
  },
  {
    id: 12,
    name: 'Triamcinolone',
    commonUses: 'Oral Inflammatory Conditions',
  }
];

function DentalFlow() {
  const [medications, setMedications] = useState(initialMedicationsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const itemsPerPage = 8;

  // Function to handle adding new medication
  const handleAddMedication = (newMed) => {
    // Auto-generate ID based on highest existing ID
    const maxId = Math.max(...medications.map(med => med.id), 0);
    const newId = maxId + 1;

    // Create complete medication object with all required fields
    const completeMedication = {
      id: newId,
      name: newMed.name,
      commonUses: newMed.commonUses || 'Not specified',
      dosageForms: newMed.dosageForms || 'Not specified',
      strengths: newMed.strengths || 'Not specified',
      category: newMed.category || 'General',
      activeIngredient: newMed.activeIngredient || newMed.name,
      warning: null
    };

    // Add new medication to the beginning of the list
    setMedications([completeMedication, ...medications]);
  };

  // Function to close the add form modal
  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  // Filter medications based on search and filters
  const filteredMedications = useMemo(() => {
    return medications.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            med.commonUses.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="dental-flow">
      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Page Heading */}
          <div className="page-heading">
            <div>
              <h1 className="page-title">Medicaments & Drugs</h1>
              <p className="page-subtitle">Manage the master list of available medications for prescriptions.</p>
            </div>
            <button className="btn-primary" onClick={() => { setShowAddForm(true); }}>
              <span className="material-symbols-outlined">add</span>
              <span>Add New Medicament</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="filter-section">
            <div className="search-bar">
                <div className="search-icon">
                <span className="material-symbols-outlined">search</span>
                </div>
                <input
                type="text"
                className="search-input"
                placeholder="Search by medication name..."
                value={searchTerm}
                onChange={handleSearch}
                />
            </div>
          </div>

          {/* Data Table */}
          <div className="table-container">
            <table className="medications-table">
              <thead>
                <tr>
                  <th>MEDICATION NAME</th>
                  <th>COMMON USES</th>
                </tr>
              </thead>
              <tbody>
                {currentMedications.map((med) => (
                  <tr key={med.id}>
                    <td className="med-name">
                      <div className="name-cell">
                        <span>{med.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{med.commonUses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-section">
            <p className="pagination-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMedications.length)} of {filteredMedications.length} results
            </p>
            <div className="pagination-buttons">
              <button
                className="pagination-nav"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="pagination-nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/*Pass correct props (onAdd and onClose) to AddNewMedicament */}
        {showAddForm && (
            <div className="add-medicament-container">
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

export default DentalFlow;