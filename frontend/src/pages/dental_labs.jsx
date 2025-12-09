import React, { useEffect, useState } from 'react';
import '../styles/dental_labs.css';
import { Search, Pencil, Trash2, Hospital, ClipboardList, Check } from 'lucide-react';
import LabForm from './add_new_lab';
import ServiceForm from './add_new_service';
import WorkForm from './add_newWork';
import axios from 'axios';

export default function DentalLabs() {

  const [labs, setLabs] = useState([]);
  const [labServices, setLabServices] = useState([]);
  const [labWorks, setLabWorks] = useState([]);

  const [showLabForm, setShowLabForm] = useState(false);
  const [showServiceForm, setShowService] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);

  const [currentLabId, setCurrentLabId] = useState(null);
  const [currentServiceId, setCurrentServiceId] = useState(null);

  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch labs from backend
    const fetchLabs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/labs');
        setLabs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    // Fetch lab-services
    const fetchLabServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/labService');
        setLabServices(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    // Fetch lab-works
    const fetchLabWorks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/lab_works');
        setLabWorks(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLabs();
    fetchLabServices();
    fetchLabWorks();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'done': return 'status-delivered';
      case 'in progress': return 'status-progress';
      case 'cancelled': return 'status-overdue';
      default: return '';
    }
  };



  // Labs
  const addNewLab = (newLab) => {
    setLabs(prev => [...prev, newLab]);
  };


  const removeLab = async (labId) => {
    try {
      await axios.delete(`http://localhost:5000/api/labs/${labId}`);
      setLabs(prev => prev.filter(lab => lab.lab_id !== labId));
      setLabServices(prev => prev.filter(ls => ls.lab_id !== labId));
      setLabWorks(prev => prev.filter(lw => lw.lab_id !== labId));
    } catch (err) {
      console.error(err);
    }
  };


  // service
  const handleServiceAdded = (newService) => {
    setLabServices(prev => [...prev, newService]);
  };

  const removeService = async (lab_service_id) => {
    try {
      // Get service info to know service_id and lab_id
      const service = labServices.find(s => s.lab_service_id === lab_service_id);
      if(service) {
        await axios.delete(`http://localhost:5000/api/lab_works/lab-work/${service.service_id}/${service.lab_id}`);
      }

      await axios.delete(`http://localhost:5000/api/labService/${lab_service_id}`);

      setLabServices(prev => prev.filter(ls => ls.lab_service_id !== lab_service_id));
      setLabWorks(prev => prev.filter(
        lw => !(lw.service_id === service.service_id && lw.lab_id === service.lab_id)
      ));
    } catch (err) {
      console.error(err);
    }
  };


  // Lab Works
  const addWork = (newWork) => {
    setLabWorks(prev => [
        ...prev,
        { ...newWork, lab_id: currentLabId, service_id: currentServiceId }
    ]);
  };


  const removeWork = async (lab_work_id) => {
    try {
      await axios.delete(`http://localhost:5000/api/lab_works/${lab_work_id}`);
      setLabWorks(prev => prev.filter(w => w.lab_work_id !== lab_work_id));
    } catch (err) {
      console.error(err);
    }
  };


  // toggle status
  const toggleStatus = async (lab_work) => {
    const newStatus = lab_work.status === 'done'
      ? 'in progress'
      : lab_work.status === 'in progress'
        ? 'cancelled'
        : 'done';
    try {
      const res = await axios.put(`http://localhost:5000/api/lab_works/${lab_work.lab_work_id}`, { status: newStatus });
      setLabWorks(prev =>
        prev.map(w => w.lab_work_id === lab_work.lab_work_id ? res.data : w)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (work) => {
    setEditingTask({ ...work });
  };

  const saveEdit = async () => {
    try {
      const { lab_work_id, description, delivery_date } = editingTask;
      const res = await axios.put(`http://localhost:5000/api/lab_works/${lab_work_id}`, {
        description,
        delivery_date
      });
      setLabWorks(prev =>
        prev.map(w => w.lab_work_id === lab_work_id ? res.data : w)
      );
      setEditingTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------- Filtering ----------------------
  const term = searchTerm.toLowerCase();
  const filteredLabs = labs.map(lab => {
    const servicesOfLab = labServices.filter(ls => ls.lab_id === lab.lab_id);
    const filteredServices = servicesOfLab.filter(ls =>
      (ls.patient_name?.toLowerCase().includes(term)) ||
      (ls.service_name?.toLowerCase().includes(term))
    );
    if (lab.name.toLowerCase().includes(term) || filteredServices.length > 0) {
      return { ...lab, services: filteredServices };
    }
    return null;
  }).filter(Boolean);

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
        <div key={lab.lab_id} className="lab-card">
          <div className="lab-header">
            <div>
              <h2>{lab.name}</h2>
              <p className="contact">Phone: {lab.phone_number}</p>
              <p className="contact">Email: {lab.email}</p>
              <p className="contact">Address: {lab.address}</p>
              <p className="contact">Personal contact: {lab.contact_person}</p>
            </div>
            <div className="btns-for-lab">
              <button className="btn-add-work"
                onClick={() => { setShowService(true); setCurrentLabId(lab.lab_id); }}>
                + Add New Service
              </button>
              <button className='btn-remove-lab' onClick={() => removeLab(lab.lab_id)}>Remove Lab</button>
            </div>
          </div>

          {lab.services && lab.services.length > 0 ? (
            lab.services.map(service => {
              const worksOfService = labWorks.filter(lw =>
                lw.lab_id === lab.lab_id && lw.service_id === service.service_id
              );

              return (
                <div key={service.lab_service_id} className="work-type-section">
                  <div className="work-type-header">
                    <div>
                      <h3>{service.service_name}</h3>
                      <p style={{ marginLeft: 10, marginTop: 5, color: "#718096", fontSize: 15 }}>
                        Patient: {service.patient_name}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-add-small"
                        onClick={() => {
                          setShowWorkForm(true);
                          setCurrentServiceId(service.service_id);
                          setCurrentLabId(lab.lab_id);
                        }}
                      >
                        + Add New Work
                      </button>
                      <button className="btn-remove-small" onClick={() => removeService(service.lab_service_id)}>
                        Remove Service
                      </button>
                    </div>
                  </div>

                  {worksOfService.length > 0 ? (
                    worksOfService.map(task => (
                      <table key={task.lab_work_id} className="work-table">
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
                              {editingTask?.lab_work_id === task.lab_work_id ? (
                                <input
                                  className='editing-input'
                                  type="text"
                                  value={editingTask.description}
                                  onChange={e => setEditingTask(prev => ({ ...prev, description: e.target.value }))}
                                />
                              ) : (
                                task.description
                              )}
                            </td>

                            <td>
                              {editingTask?.lab_work_id === task.lab_work_id ? (
                                <input
                                  className='editing-input'
                                  type="date"
                                  value={editingTask.delivery_date}
                                  onChange={e => setEditingTask(prev => ({ ...prev, delivery_date: e.target.value }))}
                                />
                              ) : (
                                task.delivery_date
                              )}
                            </td>

                            <td>
                              <span
                                className={`status-badge ${getStatusClass(task.status)}`}
                                onClick={() => toggleStatus(task)}
                                style={{ cursor: "pointer" }}
                              >
                                {task.status}
                              </span>
                            </td>

                            <td>
                              <div className="actions">
                                {editingTask?.lab_work_id === task.lab_work_id ? (
                                  <button className="icon-btn" onClick={saveEdit}>
                                    <Check size={20} color="green" />
                                  </button>
                                ) : (
                                  <button className="icon-btn" onClick={() => startEdit(task)}>
                                    <Pencil size={19} color="gray" />
                                  </button>
                                )}

                                <button className="icon-btn" onClick={() => removeWork(task.lab_work_id)}>
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
                      <p>No works created for this service yet.</p>
                      <p className="empty-hint">Click 'Add New Work' to get started.</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Hospital size={50} color='gray' />
              </div>
              <p>No services created for this lab yet.</p>
              <p className="empty-hint">Click 'Add New Service' to get started.</p>
            </div>
          )}
        </div>
      ))}

      {showLabForm && <LabForm onClose={() => setShowLabForm(false)} onCreateLab={addNewLab} />}
      {showServiceForm && <ServiceForm
        onClose={() => setShowService(false)}
        onCreateService={handleServiceAdded}
        labId={currentLabId}
      />}
      {showWorkForm && <WorkForm 
        onClose={() => setShowWorkForm(false)}
        onCreateWork={addWork} 
        labId={currentLabId}
        serviceId={currentServiceId}
      />}

    </div>
  );
}