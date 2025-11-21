import { useState } from 'react';
import '../styles/add_new_service.css';

export default function ServiceForm({ onClose, onCreateService }) {

    const patients = [
        { patient_id: 1, name: "Eleanor Vance" },
        { patient_id: 2, name: "Marcus Thorne" },
        { patient_id: 3, name: "Clara Oswald" },
        { patient_id: 4, name: "Amina Bekhti" },
        { patient_id: 5, name: "Yacine Rahmani" },
    ];

    const services = [
        { service_id: 1, service_name: "Crown Fabrication" },
        { service_id: 2, service_name: "Implant Bridge" },
        { service_id: 3, service_name: "Denture Repair" },
        { service_id: 4, service_name: "Teeth Whitening" },
        { service_id: 5, service_name: "Root Canal Treatment" },
    ];

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [patientSearch, setPatientSearch] = useState("");
    const [serviceSearch, setServiceSearch] = useState("");
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [errorMessages, setErrorMessages] = useState({});

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

    function verifyServiceDetails() {
        let errors = {};
        if (!selectedPatient) errors.patient = "Please choose a patient";
        if (!selectedService) errors.service = "Please choose a service";
        setErrorMessages(errors);
        if (Object.keys(errors).length === 0) {
            onCreateService({
                patient: selectedPatient.name,
                type: selectedService.service_name
            });
            onClose();
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
                        placeholder={selectedPatient ? "Search service..." : "Select a patient first"}
                        value={serviceSearch}
                        onChange={handleServiceSearch}
                        disabled={!selectedPatient}
                    />
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