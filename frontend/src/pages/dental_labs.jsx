import React, { useState } from 'react';
import '../styles/dental_labs.css';
import { Search, Pencil, Trash2, Hospital, ClipboardList, Check } from 'lucide-react';
import LabForm from './add_new_lab';
import ServiceForm from './add_new_service';
import WorkForm from './add_newWork';

export default function DentalLabs() {
  const [labs, setLabs] = useState([
    {
      id: 1,
      name: 'Precision Dental Labs',
      phone: '(555) 123-4567',
      email: 'precision@gmail.com',
      address: 'Algiers, Sidi Abdellah',
      personalContact: '0589632541',
      services: [
        {
          id: 1,
          type: 'Crown Fabrication',
          patient: 'Eleanor Vance',
          works: [
            {
              id: 1,
              description: 'Zirconia crown, shade A2',
              deliveryDate: '2024-07-22',
              status: 'Done'
            }
          ]
        },
        {
          id: 2,
          type: 'Implant Bridge',
          patient: 'Marcus Thorne',
          works: [
            {
              id: 1,
              description: '3 unit bridge, teeth #3-5',
              deliveryDate: '2024-08-05',
              status: 'In Progress'
            }
          ]
        },
        {
          id: 3,
          type: 'Denture Repair',
          patient: 'Clara Oswald',
          works: [
            {
              id: 1,
              description: 'Upper denture crack repair',
              deliveryDate: '2024-07-15',
              status: 'Cancelled'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Aesthetic Creations Inc.',
      phone: '(555) 987-6543',
      email: 'aestheticCreations@gmail.com',
      address: 'Algiers, Zeralda',
      personalContact: '0778965223',
      services: []
    }
  ]);

  const [showLabForm, setShowLabForm] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);

  const [editingTask, setEditingTask] = useState(null);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Done': return 'status-delivered';
      case 'In Progress': return 'status-progress';
      case 'Cancelled': return 'status-overdue';
      default: return '';
    }
  };

  function removeWork(labId, serviceId, taskId) {
    setLabs(prevLabs =>
      prevLabs.map(lab =>
        lab.id === labId
          ? {
              ...lab,
              services: lab.services.map(service =>
                service.id === serviceId
                  ? {
                      ...service,
                      works: service.works.filter(work => work.id !== taskId)
                    }
                  : service
              )
            }
          : lab
      )
    );
  }

  function removeService(labId, serviceId) {
    setLabs(prevLabs =>
      prevLabs.map(lab =>
        lab.id === labId
          ? { ...lab, services: lab.services.filter(wt => wt.id !== serviceId) }
          : lab
      )
    );
  }

  function removeLab(labId) {
    setLabs(prev => prev.filter(prevLab => prevLab.id !== labId));
  }

  function addNewLab(newLab) {
    setLabs(prev => [
      ...prev,
      {
        id: prev.length + 1,
        ...newLab,
        services: []
      }
    ]);
  }

  function addService(labId, newService) {
    setLabs(prevLabs =>
      prevLabs.map(lab =>
        lab.id === labId
          ? {
              ...lab,
              services: [
                ...lab.services,
                {
                  id: lab.services.length + 1,
                  type: newService.type,
                  patient: newService.patient,
                  works: []
                }
              ]
            }
          : lab
      )
    );
  }


  function toggleStatus(labId, serviceId, taskId) {
    setLabs(prev =>
      prev.map(lab =>
        lab.id === labId
          ? {
              ...lab,
              services: lab.services.map(service =>
                service.id === serviceId
                  ? {
                      ...service,
                      works: service.works.map(work =>
                        work.id === taskId
                          ? {
                              ...work,
                              status:
                                work.status === 'Done'
                                  ? 'In Progress'
                                  : work.status === 'In Progress'
                                  ? 'Cancelled'
                                  : 'Done'
                            }
                          : work
                      )
                    }
                  : service
              )
            }
          : lab
      )
    );
  }

  function startEdit(labId, serviceId, task) {
    setEditingTask({
      labId,
      serviceId,
      taskId: task.id,
      description: task.description,
      deliveryDate: task.deliveryDate
    });
  }

  function saveEdit() {
    const { labId, serviceId, taskId, description, deliveryDate } = editingTask;

    setLabs(prev =>
      prev.map(lab =>
        lab.id === labId
          ? {
              ...lab,
              services: lab.services.map(sv =>
                sv.id === serviceId
                  ? {
                      ...sv,
                      works: sv.works.map(work =>
                        work.id === taskId
                          ? { ...work, description, deliveryDate }
                          : work
                      )
                    }
                  : sv
              )
            }
          : lab
      )
    );

    setEditingTask(null);
  }


  function addWork(labId, serviceId, newWork) {
    setLabs(prevLabs =>
      prevLabs.map(lab =>
        lab.id === labId
          ? {
              ...lab,
              services: lab.services.map(service =>
                service.id === serviceId
                  ? {
                      ...service,
                      works: [
                        ...service.works,
                        {
                          id: service.works.length + 1,
                          description: newWork.description,
                          deliveryDate: newWork.deliveryDate,
                          status: "In Progress"
                        }
                      ]
                    }
                  : service
              )
            }
          : lab
      )
    );
  }


  const [showServiceForm, setShowService] = useState(false);
  const [currentLabId, setCurrentLabId] = useState(null);
  const [currentServiceId, setCurrentServiceId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const term = searchTerm.toLowerCase();
  const filteredLabs = labs
    .map(lab => {
      const matchesLab = lab.name.toLowerCase().includes(term);
      const filteredServices = lab.services.filter(service =>
        service.patient.toLowerCase().includes(term)
      );
      if (matchesLab) {
        return lab;
      }
      if (filteredServices.length > 0) {
        return {
          ...lab,
          services: filteredServices
        };
      }

      return null;
    })
    .filter(Boolean);



  return (
    <div className="dental-labs-container">
      <div className="labs-header">
        <div>
          <h1>Dental Labs Management</h1>
          <p className="subtitle">Manage and track all outsourced work with partnered dental labs.</p>
        </div>
        <div className="header-actions">
          <Search className="w-5 h-5" size={18} color='gray' />
          <input type="text" placeholder="Search labs, patients..." className="dentalLab-search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="dentalLab-btn-primary" onClick={() => setShowLabForm(true)}>+ Add New Lab</button>
        </div>
      </div>

      {filteredLabs.map(lab => (
        <div key={lab.id} className="lab-card">
          <div className="lab-header">
            <div>
              <h2>{lab.name}</h2>
              <p className="contact">Phone: {lab.phone}</p>
              <p className="contact">Email: {lab.email}</p>
              <p className="contact">Address: {lab.address}</p>
              <p className="contact">Personal contact: {lab.personalContact}</p>
            </div>
            <div className="btns-for-lab">
              <button className="btn-add-work" onClick={() => { setShowService(true); setCurrentLabId(lab.id); }}>
                + Add New Service
              </button>
              <button className='btn-remove-lab' onClick={() => removeLab(lab.id)}>Remove Lab</button>
            </div>
          </div>

          {lab.services.length > 0 ? (
            lab.services.map(service => (
              <div key={service.id} className="work-type-section">
                <div className="work-type-header">
                  <div>
                    <h3>{service.type}</h3>
                    <p style={{ marginLeft: 10, marginTop: 5, color: "#718096", fontSize: 15 }}>
                      Patient: {service.patient}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-add-small" 
                      onClick={() => {
                        setShowWorkForm(true);
                        setCurrentServiceId(service.id);
                        setCurrentLabId(lab.id);
                      }}
                    >
                        + Add New Work
                    </button>
                    <button className="btn-remove-small" onClick={() => removeService(lab.id, service.id)}>
                      Remove Work
                    </button>
                  </div>
                </div>

                {service.works.length > 0 ? (
                  service.works.map(task => (
                    <table key={task.id} className="work-table">
                      <thead>
                        <tr>
                          <th>DESCRIPTION</th>
                          <th>DELIVERY DATE</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            {editingTask &&
                            editingTask.labId === lab.id &&
                            editingTask.serviceId === service.id &&
                            editingTask.taskId === task.id ? (
                              <input
                                className='editing-input'
                                type="text"
                                value={editingTask.description}
                                onChange={(e) =>
                                  setEditingTask(prev => ({ ...prev, description: e.target.value }))
                                }
                              />
                            ) : (
                              task.description
                            )}
                          </td>

                          <td>
                            {editingTask &&
                            editingTask.labId === lab.id &&
                            editingTask.serviceId === service.id &&
                            editingTask.taskId === task.id ? (
                              <input
                                className='editing-input'
                                type="date"
                                value={editingTask.deliveryDate}
                                onChange={(e) =>
                                  setEditingTask(prev => ({ ...prev, deliveryDate: e.target.value }))
                                }
                              />
                            ) : (
                              task.deliveryDate
                            )}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${getStatusClass(task.status)}`}
                              onClick={() => toggleStatus(lab.id, service.id, task.id)}
                              style={{ cursor: "pointer" }}
                            >
                              {task.status}
                            </span>
                          </td>

                          <td>
                            <div className="actions">
                              {editingTask?.taskId === task.id ? (
                                <button className="icon-btn" onClick={saveEdit}>
                                  <Check size={20} color="green" />
                                </button>
                              ) : (
                                <button className="icon-btn" onClick={() => startEdit(lab.id, service.id, task)}>
                                  <Pencil size={19} color="gray" />
                                </button>
                              )}

                              <button
                                className="icon-btn"
                                onClick={() => removeWork(lab.id, service.id, task.id)}
                              >
                                <Trash2 size={19} color="red" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <ClipboardList size={44} color='gray' />
                    </div>
                    <p>No tasks created for this service yet.</p>
                    <p className="empty-hint">Click 'Add New Work' to get started.</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Hospital size={50} color='gray' />
              </div>
              <p>No services have been created for this lab yet.</p>
              <p className="empty-hint">Click 'Add New Service' to get started.</p>
            </div>
          )}
        </div>
      ))}

      {showLabForm && (
        <LabForm
          onClose={() => setShowLabForm(false)}
          onCreateLab={addNewLab}
        />
      )}

      {showServiceForm && (
        <ServiceForm
          onClose={() => setShowService(false)}
          onCreateService={(newService) => addService(currentLabId, newService)}
        />
      )}

      {showWorkForm && (
        <WorkForm
          onClose={() => setShowWorkForm(false)}
          onCreateWork={(newWork) => addWork(currentLabId, currentServiceId, newWork)}
        />
      )}
    </div>
  );
}