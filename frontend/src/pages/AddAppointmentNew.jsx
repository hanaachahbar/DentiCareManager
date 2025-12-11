import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, X } from "lucide-react";
import "../styles/AddAppointement.css";

const AddAppointmentNew = () => {
  const navigate = useNavigate();
  
  // State management
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientServices, setPatientServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showCreateService, setShowCreateService] = useState(false);
  const [newServiceData, setNewServiceData] = useState({
    service_name: "",
    total_cost: ""
  });
  
  // Appointment form state
  const [appointmentData, setAppointmentData] = useState({
    appointment_date: "",
    appointment_time: "",
    status: "pending",
    description: ""
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/patients");
        if (!response.ok) throw new Error("Failed to fetch patients");
        
        const data = await response.json();
        let patientsList = [];
        
        // Handle different response formats
        if (Array.isArray(data)) {
          patientsList = data;
        } else if (data.patients && Array.isArray(data.patients)) {
          patientsList = data.patients;
        } else if (data.value && Array.isArray(data.value)) {
          patientsList = data.value;
        }
        
        setPatients(patientsList);
        setError(null);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patients. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Fetch services for selected patient
  const handlePatientSelect = async (patientId) => {
    try {
      setSelectedPatient(patientId);
      setSelectedService(null);
      setPatientServices([]);
      setShowCreateService(false);
      
      const response = await fetch(`http://localhost:5000/api/services`);
      if (!response.ok) throw new Error("Failed to fetch services");
      
      const data = await response.json();
      let servicesList = [];
      
      // Handle different response formats
      if (Array.isArray(data)) {
        servicesList = data;
      } else if (data.services && Array.isArray(data.services)) {
        servicesList = data.services;
      }
      
      // Filter services for this patient
      const filteredServices = servicesList.filter(s => s.patient_id === patientId);
      setPatientServices(filteredServices);
      setError(null);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services. Please try again.");
    }
  };

  // Create new service
  const handleCreateService = async () => {
    if (!newServiceData.service_name || !newServiceData.total_cost) {
      setError("Please fill in all service fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient,
          service_name: newServiceData.service_name,
          total_cost: parseFloat(newServiceData.total_cost),
          status: "active",
          payment_description: `Payment for ${newServiceData.service_name}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create service");
      }

      const result = await response.json();
      
      // Add the new service to the list
      const newService = {
        service_id: result.service_data.service_id,
        service_name: result.service_data.service_name,
        patient_id: result.service_data.patient_id,
        total_cost: result.service_data.total_cost,
        status: "active"
      };
      
      setPatientServices([...patientServices, newService]);
      setSelectedService(newService.service_id);
      setNewServiceData({ service_name: "", total_cost: "" });
      setShowCreateService(false);
      setSuccessMessage("Service created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error creating service:", err);
      setError(err.message || "Failed to create service");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle appointment form submission
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();

    if (!selectedService || !appointmentData.appointment_date) {
      setError("Please select a service and appointment date");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time || null,
          status: appointmentData.status,
          description: appointmentData.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      const result = await response.json();
      setSuccessMessage("Appointment created successfully!");
      
      // Reset form
      setTimeout(() => {
        navigate("/appointments");
      }, 2000);
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(err.message || "Failed to create appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.patient_id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown";
  };

  const getServiceName = (serviceId) => {
    const service = patientServices.find(s => s.service_id === serviceId);
    return service ? service.service_name : "Unknown";
  };

  if (loading) {
    return <div className="loading-container">Loading patients...</div>;
  }

  return (
    <div className="add-appointment-container">
      <div className="appointment-header">
        <h1>Add New Appointment</h1>
        <p>Create a new appointment by selecting a patient and service</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="appointment-form-wrapper">
        {/* Step 1: Select Patient */}
        <div className="form-section">
          <h2>Step 1: Select Patient</h2>
          <div className="select-group">
            <select
              value={selectedPatient || ""}
              onChange={(e) => handlePatientSelect(Number(e.target.value))}
              className="select-input"
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-icon" />
          </div>
        </div>

        {/* Step 2: Select or Create Service */}
        {selectedPatient && (
          <div className="form-section">
            <h2>Step 2: Select or Create Service</h2>
            
            {patientServices.length > 0 && (
              <div className="select-group">
                <select
                  value={selectedService || ""}
                  onChange={(e) => setSelectedService(Number(e.target.value))}
                  className="select-input"
                >
                  <option value="">Choose a service...</option>
                  {patientServices.map((service) => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-icon" />
              </div>
            )}

            {patientServices.length === 0 && !showCreateService && (
              <p className="info-text">No services found for this patient</p>
            )}

            <button
              type="button"
              onClick={() => setShowCreateService(!showCreateService)}
              className="btn-secondary"
            >
              <Plus size={18} />
              {showCreateService ? "Cancel" : "Create New Service"}
            </button>

            {/* Create New Service Form */}
            {showCreateService && (
              <div className="create-service-form">
                <h3>Create New Service for {getPatientName(selectedPatient)}</h3>
                
                <div className="form-group">
                  <label htmlFor="service_name">Service Name *</label>
                  <input
                    id="service_name"
                    type="text"
                    placeholder="e.g., Root Canal Treatment"
                    value={newServiceData.service_name}
                    onChange={(e) =>
                      setNewServiceData({
                        ...newServiceData,
                        service_name: e.target.value
                      })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="total_cost">Total Cost *</label>
                  <input
                    id="total_cost"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={newServiceData.total_cost}
                    onChange={(e) =>
                      setNewServiceData({
                        ...newServiceData,
                        total_cost: e.target.value
                      })
                    }
                    className="form-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateService}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? "Creating..." : "Create Service"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Appointment Details */}
        {selectedService && (
          <div className="form-section">
            <h2>Step 3: Appointment Details</h2>
            <p className="info-text">
              Patient: <strong>{getPatientName(selectedPatient)}</strong> | Service: <strong>{getServiceName(selectedService)}</strong>
            </p>

            <form onSubmit={handleSubmitAppointment} className="appointment-details-form">
              <div className="form-group">
                <label htmlFor="appointment_date">Appointment Date *</label>
                <input
                  id="appointment_date"
                  type="date"
                  value={appointmentData.appointment_date}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      appointment_date: e.target.value
                    })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointment_time">Appointment Time</label>
                <input
                  id="appointment_time"
                  type="time"
                  value={appointmentData.appointment_time}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      appointment_time: e.target.value
                    })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  value={appointmentData.status}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      status: e.target.value
                    })
                  }
                  className="select-input"
                >
                  <option value="pending">Pending</option>
                  <option value="checked-in">Checked In</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Add any notes about this appointment..."
                  value={appointmentData.description}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      description: e.target.value
                    })
                  }
                  className="form-input"
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? "Creating..." : "Create Appointment"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/appointments")}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAppointmentNew;
