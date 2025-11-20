import { useState } from 'react';
import '../styles/add_new_lab.css';

export default function LabForm({onClose, onCreateLab}) {

    const [labDetails, setLabDetails] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        personalContact: ''
    });

    const manageInputChange = (e) => {
        const { name, value } = e.target;
        setLabDetails(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const [errorMessages, setErrorMessages] = useState({});

    function verifyLabDetails() {
        const { name, phone, email, address, personalContact} = labDetails;
        let newErrors = {};

        if(!name.trim()) newErrors.name = "Lab name required";
        if(!address.trim()) newErrors.address = "Lab address required";

        const phoneRegex = /^(?:\+213|0)(5|6|7)\d{8}$/;
        if(!phone.trim()) newErrors.phone = "Phone number required";
        else if(!phoneRegex.test(phone))
            newErrors.phone = "Invalid phone number";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if(!email.trim()) newErrors.email = "Email address required";
        else if(!emailRegex.test(email))
            newErrors.email = "Invalid email address";

        if(personalContact && !phoneRegex.test(personalContact))
            newErrors.personalContact = "Invalid phone number";

        setErrorMessages(newErrors);
        if(Object.keys(newErrors).length === 0) {
            onCreateLab(labDetails);
            onClose();
        }
    }

    return (
        <div className="blur-background">
            <div className="lab-form-section">
                <div className="lab-form-row">
                    <div className="lab-form-group">
                        <label>Lab name</label>
                        <input
                        type="text"
                        name="name"
                        placeholder="Enter lab name"
                        value={labDetails.name}
                        onChange={manageInputChange}
                        />
                        {errorMessages.name && <div className="error-msg">{errorMessages.name}</div> }
                    </div>

                    <div className="lab-form-group">
                        <label>Phone number</label>
                        <input
                        type="text"
                        name="phone"
                        placeholder="Enter phone number"
                        value={labDetails.phone}
                        onChange={manageInputChange}
                        />
                        {errorMessages.phone && <div className="error-msg">{errorMessages.phone}</div> }
                    </div>
                </div>

                <div className="lab-form-row">
                    <div className="lab-form-group">
                        <label>Email address</label>
                        <input
                        type="text"
                        name="email"
                        placeholder='Enter email address'
                        value={labDetails.email}
                        onChange={manageInputChange}
                        />
                        {errorMessages.email && <div className="error-msg">{errorMessages.email}</div> }
                    </div>

                    <div className="lab-form-group">
                        <label>Lab address</label>
                        <input
                        type="text"
                        name="address"
                        placeholder='Enter lab address'
                        value={labDetails.address}
                        onChange={manageInputChange}
                        />
                        {errorMessages.address && <div className="error-msg">{errorMessages.address}</div> }
                    </div>
                </div>


                <div className="lab-form-group personal-contact">
                    <label>Personal Contact</label>
                    <input
                    type="text"
                    name="personalContact"
                    placeholder='Enter personal phone number'
                    value={labDetails.personalContact}
                    onChange={manageInputChange}
                    />
                    {errorMessages.personalContact && <div className="error-msg">{errorMessages.personalContact}</div> }
                </div>

                <div className="lab-form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn-save" onClick={verifyLabDetails}>
                    Add Lab
                    </button>
                </div>
            </div>
        </div>
    );
}