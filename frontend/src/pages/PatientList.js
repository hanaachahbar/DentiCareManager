import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PatientList.css';
import axios from 'axios';

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allPatients, setAllPatients] = useState([]); // All patients from API
  const [filteredPatients, setFilteredPatients] = useState([]); // Filtered patients
  const [displayedPatients, setDisplayedPatients] = useState([]); // Patients to display on current page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Refs
  const searchInputRef = useRef(null);
  const initialFetchDone = useRef(false);
  const debounceTimer = useRef(null);

  // Constants
  const PATIENTS_PER_PAGE = 5;

  // API base URL
  const API_URL = 'http://localhost:5000/api';

  // Fetch ALL patients from backend (initial load - no pagination params)
  const fetchAllPatients = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_URL}/patients`, {
        params: {
          page: 1,
          limit: 100 // Fetch a large number to get all patients
        }
      });

      let fetchedPatients = [];
      
      if (response.data && response.data.patients) {
        fetchedPatients = response.data.patients;
      } else if (Array.isArray(response.data)) {
        fetchedPatients = response.data;
      }
      
      // Format patients
      const formattedPatients = fetchedPatients.map(patient => ({
        ...patient,
        name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
        id: patient.patient_id || patient.id,
        contact: patient.phone_number || patient.contact || 'N/A',
        allergies: patient.allergies || 'None',
        chronique: patient.chronic_conditions || patient.chronique || 'None',
        hereditaire: patient.hereditary_conditions || patient.hereditaire || 'None',
        formatted_dob: patient.date_of_birth || patient.dob || 'N/A',
        lastVisit: patient.lastVisit || 'N/A'
      }));
      
      setAllPatients(formattedPatients);
      setFilteredPatients(formattedPatients);
      updateDisplayedPatients(formattedPatients, 1);
      
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
      
      
    } finally {
      setLoading(false);
      initialFetchDone.current = true;
    }
  };

  // Update displayed patients based on current page
  const updateDisplayedPatients = (patientsArray, page) => {
    const startIndex = (page - 1) * PATIENTS_PER_PAGE;
    const endIndex = startIndex + PATIENTS_PER_PAGE;
    const patientsForPage = patientsArray.slice(startIndex, endIndex);
    setDisplayedPatients(patientsForPage);
  };

  // Initial fetch - only once
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchAllPatients();
    }
  }, []); // Empty dependency array - only run once on mount

  // Update displayed patients when currentPage or filteredPatients changes
  useEffect(() => {
    if (filteredPatients.length > 0) {
      updateDisplayedPatients(filteredPatients, currentPage);
    }
  }, [currentPage, filteredPatients]);

  // Handle search input change with client-side filtering
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer for debouncing
    debounceTimer.current = setTimeout(() => {
      if (value.trim() === '') {
        // If search is empty, show all patients
        setFilteredPatients(allPatients);
        setCurrentPage(1); // Reset to first page
      } else {
        // Client-side filtering
        const searchLower = value.toLowerCase();
        const filtered = allPatients.filter(patient => {
          const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
          const phone = patient.phone_number || patient.contact || '';
          const email = patient.email || '';
          
          return (
            fullName.includes(searchLower) ||
            (patient.first_name && patient.first_name.toLowerCase().includes(searchLower)) ||
            (patient.last_name && patient.last_name.toLowerCase().includes(searchLower)) ||
            phone.toLowerCase().includes(searchLower) ||
            email.toLowerCase().includes(searchLower)
          );
        });
        
        setFilteredPatients(filtered);
        setCurrentPage(1); // Reset to first page when searching
      }
    }, 300); // 300ms debounce
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > getTotalPages()) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle patient click
  const handlePatientClick = (patientId) => {
    navigate(`/patient_profile/${patientId}`);
  };

  // Generate page numbers
  const generatePageNumbers = () => {
    const totalPages = getTotalPages();
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Handle add new patient
  const handleAddPatient = () => {
    navigate('/add_patient');
  };

  // Format date if needed
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return dateString;
  };

  // Get total number of pages
  const getTotalPages = () => {
    return Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  };

  // Get total patients count
  const getTotalPatients = () => {
    return filteredPatients.length;
  };

  return (
    <div className="patient-list-page" style={{ display: 'block', width: '100%' }}>
      {/* Main Content */}
      <main className="main-content" style={{ display: 'block', width: '100%' }}>
        <h1 className="page-title">Patient List</h1>

        {/* Loading and Error States */}
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading patients...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-message">
            <p>{error}</p>
            <small>Showing sample data for demonstration</small>
          </div>
        )}

        {/* Search and Add Patient */}
        <div className="controls">
          <div className="search-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by First Name, Last Name, Phone, or Email"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              disabled={loading}
              autoFocus
            />
          </div>
          <button 
            className="add-patient-btn"
            onClick={handleAddPatient}
            disabled={loading}
          >
            Add New Patient
          </button>
        </div>

        {/* Patient Table - This section updates independently */}
        {!loading && displayedPatients.length > 0 && (
          <>
            <div className="table-container">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>DOB</th>
                    <th>CONTACT NUMBER</th>
                    <th>ALLERGIES</th>
                    <th>CHRONIC CONDITIONS</th>
                    <th>HEREDITARY CONDITIONS</th>
                    {/* <th>LAST VISIT</th> */}
                  </tr>
                </thead>
                <tbody>
                  {displayedPatients.map((patient) => (
                    <tr key={patient.id || patient.patient_id}>
                      <td>
                        <div 
                          className="patient-name clickable"
                          onClick={() => handlePatientClick(patient.id || patient.patient_id)}
                        >
                          <div className="patient-name-text">
                            <span className="patient-name-main">{patient.name || `${patient.first_name} ${patient.last_name}`}</span>
                            <span className="patient-id">ID: #{patient.id || patient.patient_id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(patient.date_of_birth || patient.dob)}</td>
                      <td>{patient.contact || patient.phone_number || 'N/A'}</td>
                      <td>{patient.allergies || 'None'}</td>
                      <td>{patient.chronique || patient.chronic_conditions || 'None'}</td>
                      <td>{patient.hereditaire || patient.hereditary_conditions || 'None'}</td>
                      {/* <td>{formatDate(patient.lastVisit)}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            <div className="pagination-info">
              Showing {(currentPage - 1) * PATIENTS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * PATIENTS_PER_PAGE, getTotalPatients())} of{' '}
              {getTotalPatients()} patients
            </div>

            {/* Pagination */}
            {getTotalPages() > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-arrow"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                {generatePageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className="pagination-dots">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button 
                  className="pagination-arrow"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === getTotalPages() || loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* No patients found */}
        {!loading && displayedPatients.length === 0 && (
          <div className="no-patients">
            <p>No patients found. Try a different search or add a new patient.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientList;