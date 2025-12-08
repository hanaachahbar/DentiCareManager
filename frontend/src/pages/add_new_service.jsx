import { useEffect, useState } from 'react';
import '../styles/add_new_service.css';
import axios from 'axios';

export default function ServiceForm({ onClose, onCreateService, labId }) {

    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [patientSearch, setPatientSearch] = useState("");
    const [serviceSearch, setServiceSearch] = useState("");
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [errorMessages, setErrorMessages] = useState({});

    // Mock patient-service relationships based on your seed data
    // Patient 1 (John Doe): services 1, 2, 3
    // Patient 2 (Sarah Smith): services 4, 5  
    // Patient 3 (Mohamed Ali): service 6
    const patientServicesMap = {
        1: [1, 2, 3],  // John Doe's services
        2: [4, 5],     // Sarah Smith's services
        3: [6]         // Mohamed Ali's services
    };

    // Available services data
    const allServices = [
        { service_id: 1, service_name: "Annual Physical Exam" },
        { service_id: 2, service_name: "Blood Test" },
        { service_id: 3, service_name: "X-Ray Consultation" },
        { service_id: 4, service_name: "Pregnancy Checkup" },
        { service_id: 5, service_name: "Ultrasound Scan" },
        { service_id: 6, service_name: "Diabetes Management" }
    ];

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/patients');
                
                const formattedPatients = response.data.map(patient => ({
                    patient_id: patient.patient_id,
                    name: `${patient.first_name} ${patient.last_name}`
                }));
                
                setPatients(formattedPatients);
            } 
            catch(error) {
                console.error('Error fetching patients:', error);
            }
        };

        fetchPatients();
    }, []);

    // Filter services based on selected patient
    const filterServicesByPatient = (patientId) => {
        if (!patientId) return [];
        
        const serviceIds = patientServicesMap[patientId] || [];
        return allServices.filter(service => 
            serviceIds.includes(service.service_id)
        );
    };

    function handlePatientSearch(e) {
        const value = e.target.value;
        setPatientSearch(value);
        const results = patients.filter(p =>
            p.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredPatients(results);
    }

    function choosePatient(patient) {
        setSelectedPatient(patient);
        setPatientSearch(patient.name);
        setFilteredPatients([]);
        
        // Filter services for this patient
        const patientServices = filterServicesByPatient(patient.patient_id);
        setServices(patientServices);
        
        // Reset service selection
        setSelectedService(null);
        setServiceSearch("");
        setFilteredServices([]);
    }

    function handleServiceSearch(e) {
        const value = e.target.value;
        setServiceSearch(value);
        const results = services.filter(s =>
            s.service_name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredServices(results);
    }

    function chooseService(service) {
        setSelectedService(service);
        setServiceSearch(service.service_name);
        setFilteredServices([]);
    }

    async function verifyServiceDetails() {
        let errors = {};
        if (!selectedPatient) errors.patient = "Please choose a patient";
        if (!selectedService) errors.service = "Please choose a service";
        setErrorMessages(errors);

        if (Object.keys(errors).length === 0) {
            try {
                const response = await axios.post('http://localhost:5000/api/labService', {
                    lab_id: labId,
                    service_id: selectedService.service_id
                });

                onCreateService({
                    lab_service_id: response.data.lab_service_id,
                    lab_id: labId,
                    service_id: selectedService.service_id,
                    service_name: selectedService.service_name,
                    patient_name: selectedPatient.name,
                    patient_id: selectedPatient.patient_id
                });

                onClose();
                alert("Service assigned to lab successfully!");
            } catch (err) {
                console.error("Error assigning service to lab:", err);
                alert("Failed to assign service. Maybe it already exists.");
            }
        }
    }


    return (
        <div className="blur-background">
            <div className="new-work-form-section">
                <div className="new-work-form-group">
                    <label>Patient</label>
                    <input
                        type="text"
                        placeholder="Search patient..."
                        value={patientSearch}
                        onChange={handlePatientSearch}
                    />
                    {filteredPatients.length > 0 && (
                        <ul className="dropdown-list">
                            {filteredPatients.map((p) => (
                                <li
                                    className='dropdown-item'
                                    key={p.patient_id}
                                    onClick={() => choosePatient(p)}
                                >
                                    {p.name}
                                </li>
                            ))}
                        </ul>
                    )}
                    {errorMessages.patient && (
                        <div className="error-msg">{errorMessages.patient}</div>
                    )}
                </div>

                <div className="new-work-form-group">
                    <label>Service</label>
                    <input
                        type="text"
                        placeholder={selectedPatient ? `Search service for ${selectedPatient.name}...` : "Select a patient first"}
                        value={serviceSearch}
                        onChange={handleServiceSearch}
                        disabled={!selectedPatient}
                    />
                    
                    {selectedPatient && services.length === 0 && (
                        <div className="info-msg" style={{color: '#666', fontSize: '14px'}}>
                            No services found for {selectedPatient.name}
                        </div>
                    )}
                    
                    {filteredServices.length > 0 && selectedPatient && (
                        <ul className="dropdown-list">
                            {filteredServices.map((s) => (
                                <li
                                    className='dropdown-item'
                                    key={s.service_id}
                                    onClick={() => chooseService(s)}
                                >
                                    {s.service_name}
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    {selectedPatient && serviceSearch === "" && services.length > 0 && (
                        <ul className="dropdown-list">
                            {services.map((s) => (
                                <li
                                    className='dropdown-item'
                                    key={s.service_id}
                                    onClick={() => chooseService(s)}
                                >
                                    {s.service_name}
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    {errorMessages.service && (
                        <div className="error-msg">{errorMessages.service}</div>
                    )}
                </div>

                <div className="new-work-form-actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="save-btn" onClick={verifyServiceDetails}>
                        Add Service
                    </button>
                </div>
            </div>
        </div>
    );
}