import { useState } from 'react';
import '../styles/add_labWorkType.css';

export default function LabWorkTypeForm({onClose}) {

    const [workDetails, setWorkDetails] = useState({
        type: '',
        patient: '',
        deliveryDate: '',
        status: '',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWorkDetails(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const [errorMsgs, setErrorMsgs] = useState({});

    function verifyDetails() {
        const { type, patient, deliveryDate, status} = workDetails;
        let newErrors = {};

        if(!type.trim()) newErrors.type = "Work type required";
        if(!patient.trim()) newErrors.patient = "Patient name required";
        if(!status.trim()) newErrors.status = "status required";
        if(!deliveryDate.trim()) newErrors.deliveryDate = "Delivery date required";
        else if(isNaN(new Date(deliveryDate).getTime()) || (new Date(deliveryDate).getTime()) > Date.now())
            newErrors.deliveryDate = "Invalid delivery date";

        setErrorMsgs(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    return (
        <div className="blur-background">
            <div className="form-section">
                <div className="form-row">
                    <div className="form-group">
                        <label>Type</label>
                        <input
                        type="text"
                        name="firstName"
                        placeholder="Enter work type"
                        value={workDetails.type}
                        onChange={handleInputChange}
                        />
                        {errorMsgs.type && <div className="error-msg">{errorMsgs.type}</div> }
                    </div>
                    <div className="form-group">
                        <label>Patient</label>
                        <input
                        type="text"
                        name="patient"
                        placeholder="Enter patient name"
                        value={workDetails.patient}
                        onChange={handleInputChange}
                        />
                        {errorMsgs.patient && <div className="error-msg">{errorMsgs.patient}</div> }
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Delivery date</label>
                        <input
                        type="date"
                        name="deliveryDate"
                        value={workDetails.deliveryDate}
                        onChange={handleInputChange}
                        />
                        {errorMsgs.deliveryDate && <div className="error-msg">{errorMsgs.deliveryDate}</div> }
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select
                        name="status"
                        value={workDetails.status}
                        onChange={handleInputChange}
                        >
                        <option value="">Select status</option>
                        <option value="delivered">Delivered</option>
                        <option value="in progress">In progress</option>
                        <option value="overdue">Overdue</option>
                        </select>
                        {errorMsgs.status && <div className="error-msg">{errorMsgs.status}</div> }
                    </div>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="Description"
                        placeholder="write a short description..."
                        rows="2"
                        value={workDetails.description}
                        onChange={handleInputChange}
                    />
                    {errorMsgs.description && <div className="error-msg">{errorMsgs.description}</div> }
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn-save" onClick={verifyDetails}>
                    Save Work
                    </button>
                </div>
            </div>
        </div>
    );
}