import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PatientList.css';

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 5; // Number of patients per page

  const patients = [
    {
      id: 1,
      name: 'Laura Williams',
      avatar: 'https://i.pravatar.cc/150?img=1',
      dob: '15-08-1985',
      contact: '(123) 456-7890',
      allergies: 'Penicillin',
      chronique: 'None',
      hereditaire: 'None',
      lastVisit: '12-05-2023',
      status: 'active'
    },
    {
      id: 2,
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=2',
      dob: '22-03-1990',
      contact: '(234) 567-8901',
      allergies: 'None',
      chronique: 'Hypertension',
      hereditaire: 'Diabetes',
      lastVisit: '20-04-2023',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mary Jane',
      avatar: 'https://i.pravatar.cc/150?img=3',
      dob: '10-11-1982',
      contact: '(345) 678-9012',
      allergies: 'Aspirin',
      chronique: 'Asthma',
      hereditaire: 'None',
      lastVisit: '05-06-2023',
      status: 'active'
    },
    {
      id: 4,
      name: 'Peter Parker',
      avatar: 'https://i.pravatar.cc/150?img=4',
      dob: '01-06-1995',
      contact: '(456) 789-0123',
      allergies: 'None',
      chronique: 'None',
      hereditaire: 'None',
      lastVisit: '18-05-2023',
      status: 'active'
    },
    {
      id: 5,
      name: 'Bruce Wayne',
      avatar: 'https://i.pravatar.cc/150?img=5',
      dob: '19-02-1978',
      contact: '(567) 890-1234',
      allergies: 'Latex',
      chronique: 'None',
      hereditaire: 'Heart Disease',
      lastVisit: '22-06-2023',
      status: 'active'
    },
    {
      id: 6,
      name: 'Diana Prince',
      avatar: 'https://i.pravatar.cc/150?img=6',
      dob: '15-03-1988',
      contact: '(678) 901-2345',
      allergies: 'None',
      chronique: 'None',
      hereditaire: 'None',
      lastVisit: '10-07-2023',
      status: 'active'
    },
    {
      id: 7,
      name: 'Clark Kent',
      avatar: 'https://i.pravatar.cc/150?img=7',
      dob: '18-06-1980',
      contact: '(789) 012-3456',
      allergies: 'Kryptonite',
      chronique: 'None',
      hereditaire: 'None',
      lastVisit: '15-08-2023',
      status: 'active'
    },
    {
      id: 8,
      name: 'Barry Allen',
      avatar: 'https://i.pravatar.cc/150?img=8',
      dob: '20-09-1992',
      contact: '(890) 123-4567',
      allergies: 'None',
      chronique: 'None',
      hereditaire: 'None',
      lastVisit: '01-09-2023',
      status: 'active'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toString().includes(searchTerm);
    return matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle patient click
  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  // Generate page numbers
  const generatePageNumbers = () => {
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

  return (
    <div className="patient-list-page" style={{ display: 'block', width: '100%' }}>
      {/* Main Content */}
      <main className="main-content" style={{ display: 'block', width: '100%' }}>
        <h1 className="page-title">Patient List</h1>

        {/* Search and Add Patient */}
        <div className="controls">
          <div className="search-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by Name or ID"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="search-input"
            />
          </div>
          <button 
            className="add-patient-btn"
            onClick={() => navigate('/add_patient')}
          >
            Add New Patient
          </button>
        </div>

        {/* Patient Table */}
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
                <th>LAST VISIT</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div 
                      className="patient-name clickable"
                      onClick={() => handlePatientClick(patient.id)}
                    >
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        className="patient-avatar"
                      />
                      <span>{patient.name}</span>
                    </div>
                  </td>
                  <td>{patient.dob}</td>
                  <td>{patient.contact}</td>
                  <td>{patient.allergies}</td>
                  <td>{patient.chronique}</td>
                  <td>{patient.hereditaire}</td>
                  <td>{patient.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-arrow"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
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
                >
                  {page}
                </button>
              )
            ))}

            <button 
              className="pagination-arrow"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientList;