import { useState } from 'react';
import '../styles/add_newWork.css';

export default function WorkForm({ onClose, onCreateWork }) {

    const [workDetails, setWorkDetails] = useState({
        description: '',
        deliveryDate: '',
        status: 'In Progress'
    });

    const manageInputChange = (e) => {
        const { name, value } = e.target;
        setWorkDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [errorMessages, setErrorMessages] = useState({});

    function verifyWorkDetails() {
        const { deliveryDate } = workDetails;
        let newErrors = {};

        if(!deliveryDate.trim()) newErrors.deliveryDate = "Delivery date is required";
        else if(isNaN(new Date(deliveryDate).getTime()) || (new Date(deliveryDate).getTime()) > Date.now())
            newErrors.deliveryDate = "Please enter a valid date";

        setErrorMessages(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onCreateWork(workDetails);
            onClose();
        }
    }

    return (
        <div className="blur-background">
            <div className="new-work-form-section">

                <div className="new-work-form-group">
                    <label>Delivery date</label>
                    <input
                        type="date"
                        name="deliveryDate"
                        placeholder="Enter delivery date"
                        value={workDetails.deliveryDate}
                        onChange={manageInputChange}
                    />
                    {errorMessages.deliveryDate && (
                        <div className="error-msg">{errorMessages.deliveryDate}</div>
                    )}
                </div>

                <div className="new-work-form-group">
                    <label>Description</label>
                    <textarea
                        type="text"
                        name="description"
                        rows={2}
                        placeholder="Write a small description..."
                        value={workDetails.description}
                        onChange={manageInputChange}
                    />
                </div>

                <div className="new-work-form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="btn-save" onClick={verifyWorkDetails}>
                        Add Work
                    </button>
                </div>

            </div>
        </div>
    );
}