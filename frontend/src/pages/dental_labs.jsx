import React, { useState } from 'react';
import '../styles/dental_labs.css';
import { Search, Building, Pencil, Trash2 } from 'lucide-react';
import LabWorkTypeForm from './add_labWorkType';

export default function DentalLabs() {
  const [labs, setLabs] = useState([
    {
      id: 1,
      name: 'Precision Dental Labs',
      contact: '(555) 123-4567',
      workTypes: [
        {
          id: 1,
          type: 'Crown Fabrication',
          patient: 'Eleanor Vance',
          description: 'Zirconia crown, shade A2',
          deliveryDate: '2024-07-22',
          status: 'Delivered'
        },
        {
          id: 2,
          type: 'Implant Bridge',
          patient: 'Marcus Thorne',
          description: '3 unit bridge, teeth #3-5',
          deliveryDate: '2024-08-05',
          status: 'In Progress'
        },
        {
          id: 3,
          type: 'Denture Repair',
          patient: 'Clara Oswald',
          description: 'Upper denture crack repair',
          deliveryDate: '2024-07-15',
          status: 'Overdue'
        }
      ]
    },
    {
      id: 2,
      name: 'Aesthetic Creations Inc.',
      contact: '(555) 987-6543',
      workTypes: []
    }
  ]);

  const [showAddWorkForm, setShowAddWorkForm] = useState(false);

  const getStatusClass = (status) => {
    switch(status) {
      case 'Delivered': return 'status-delivered';
      case 'In Progress': return 'status-progress';
      case 'Overdue': return 'status-overdue';
      default: return '';
    }
  };

  function removeWork(labId, workId) {
    setLabs(prevLabs =>
      prevLabs.map(lab =>
        lab.id === labId
        ? {
            ...lab,
            workTypes: lab.workTypes.filter(work => work.id !== workId)
          }
        : lab
      )
    );
  }

  function removeLab(labId) {
    setLabs(prev => prev.filter(prevLab => prevLab.id !== labId));
  }

  return (
    <div className="dental-labs-container">
      <div className="header">
        <div>
          <h1>Dental Labs Management</h1>
          <p className="subtitle">Manage and track all outsourced work with partnered dental labs.</p>
        </div>
        <div className="header-actions">
          <Search className="w-5 h-5" size={18} color='gray'></Search>
          <input
            type="text" 
            placeholder="Search labs, patients..." 
            className="search-input"
          />
          <button className="btn-primary">+ Add New Lab</button>
        </div>
      </div>

      {labs.map(lab => (
        <div key={lab.id} className="lab-card">
          <div className="lab-header">
            <div>
              <h2>{lab.name}</h2>
              <p className="contact">Contact: {lab.contact}</p>
            </div>
            <div className="btns-for-lab">
              <button className="btn-add-work" onClick={() => setShowAddWorkForm(true)}>+ Add New Work Type</button>
              <button className='btn-remove-lab' onClick={() => removeLab(lab.id)}>Remove Lab</button>
            </div> 
          </div>

          {lab.workTypes.length > 0 ? (
            lab.workTypes.map(workType => (
              <div key={workType.id} className="work-type-section">
                <div className="work-type-header">
                  <h3>{workType.type}</h3>
                  <button className="btn-add-small">+ Add New Work</button>
                </div>
                <table className="work-table">
                  <thead>
                    <tr>
                      <th>PATIENT NAME</th>
                      <th>DESCRIPTION</th>
                      <th>DELIVERY DATE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{workType.patient}</td>
                      <td>{workType.description}</td>
                      <td>{workType.deliveryDate}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(workType.status)}`}>
                          {workType.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="icon-btn">
                            <Pencil size={18} color='gray'></Pencil>
                          </button>
                          <button className="icon-btn" onClick={() => removeWork(lab.id, workType.id)}>
                            <Trash2 size={18} color='gray'></Trash2>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Building size={50} color='gray'></Building>
              </div>
              <p>No work types have been created for this lab yet.</p>
              <p className="empty-hint">Click 'Add New Work Type' to get started.</p>
            </div>
          )}
        </div>
      ))}

      { showAddWorkForm && <LabWorkTypeForm onClose={() => setShowAddWorkForm(false)}/> }
    </div>
  );
}