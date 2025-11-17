import React, { useState } from 'react';
import '../styles/add_patient.css';
import { UserRound, CloudUpload, Bold, Plus, XCircle, File } from 'lucide-react';

export default function AddPatient() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    emailAddress: '',
    Address: '',
    currentMedications: ''
  });

  const [allergies, setAllergies] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [chronicConditions, setChronicConditions] = useState([]);
  const [newCondition, setNewCondition] = useState('');
  const [hereditary, setHereditary] = useState([]);
  const [newHereditary, setNewHereditary] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeAllergy = (index) => {
    setAllergies(prev => prev.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if(newAllergy.trim()) {
      setAllergies(prev => [...prev, newAllergy.trim()]);
      setNewAllergy(''); 
    }
  };

  const removeCondition = (index) => {
    setChronicConditions(prev => prev.filter((_, i) => i !== index));
  };

  const addCondition = () => {
    if(newCondition.trim()) {
      setChronicConditions(prev => [...prev, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeHereditary = (index) => {
    setHereditary(prev => prev.filter((_, i) => i !== index));
  };

  const addHereditary = () => {
    if(newHereditary.trim()) {
      setHereditary(prev => [...prev, newHereditary.trim()]);
      setNewHereditary('');
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});

  function verifyInfo() {
    const { firstName, lastName, dateOfBirth, gender, phoneNumber, emailAddress } = formData;
    let newErrors = {};

    if(!firstName.trim()) newErrors.firstName = "First name is required";
    if(!lastName.trim()) newErrors.lastName = "Last name is required";
    if(!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    else if(isNaN(new Date(dateOfBirth).getTime()) || (new Date(dateOfBirth).getTime()) > Date.now())
      newErrors.dateOfBirth = "Please enter a valid date";

    if(!gender) newErrors.gender = "Gender is required.";

    const phoneRegex = /^(?:\+213|0)(5|6|7)\d{8}$/;
    if(!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if(!phoneRegex.test(phoneNumber))
      newErrors.phoneNumber = "Invalid phone number format";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailAddress.trim()) newErrors.emailAddress = "Email is required";
    else if(!emailRegex.test(emailAddress))
      newErrors.emailAddress = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  const handleSubmit = () => {
    if(verifyInfo()) {
      console.log('Form submitted:', { ...formData, allergies, chronicConditions, hereditary });
      alert('Patient saved successfully!');
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="header-icon">
            <UserRound/>
        </div>
        <div>
          <h1>Add New Patient</h1>
          <p>Fill in the details to add a new patient record.</p>
        </div>
      </div>

      <div className="form-section">
        <h2>Personal Details</h2>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            {errors.firstName && <div className="error-msg">{errors.firstName}</div> }
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
            {errors.lastName && <div className="error-msg">{errors.lastName}</div> }
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
            {errors.dateOfBirth && <div className="error-msg">{errors.dateOfBirth}</div> }
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <div className="error-msg">{errors.gender}</div> }
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Contact Information</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
            {errors.phoneNumber && <div className="error-msg">{errors.phoneNumber}</div> }
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="emailAddress"
              placeholder="Enter email address"
              value={formData.emailAddress}
              onChange={handleInputChange}
            />
            {errors.emailAddress && <div className="error-msg">{errors.emailAddress}</div> }
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            name="Address"
            placeholder="Enter address"
            rows="3"
            value={formData.Address}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Medical History</h2>
        
        <div className="form-group">
          <label>Allergies</label>
          <div className="tags-container">
            {allergies.map((allergy, index) => (
              <span key={index} className="tag">
                {allergy}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeAllergy(index)}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add an allergy..."
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
              className="tag-input"
            />

            <div className="add-btn" onClick={addAllergy}>
              <Plus size={25} color='#2196f3' fontWeight={Bold} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Maladie Chronique</label>
          <div className="tags-container">
            {chronicConditions.map((condition, index) => (
              <span key={index} className="tag">
                {condition}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeCondition(index)}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add a condition..."
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
              className="tag-input"
            />

            <div className="add-btn" onClick={addCondition}>
              <Plus size={25} color='#2196f3' fontWeight={Bold} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Maladie Héréditaire</label>
          <div className="tags-container">
            {hereditary.map((disease, index) => (
              <span key={index} className="tag">
                {disease}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeHereditary(index)}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add a condition..."
              value={newHereditary}
              onChange={(e) => setNewHereditary(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHereditary())}
              className="tag-input"
            />

            <div className="add-btn" onClick={addHereditary}>
              <Plus size={25} color='#2196f3' fontWeight={Bold} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Current Medications</label>
          <textarea
            name="currentMedications"
            placeholder="List any current medications"
            rows="3"
            value={formData.currentMedications}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Upload documents</h2>

        <div className="document-container" onClick={() => document.getElementById("fileUpload").click()}>
            <div className="inside-upload">
                <CloudUpload size={40} color='rgb(176, 176, 176, 0.8)'></CloudUpload>
                <div className="title">Click to upload</div>
                <div className="subtitle">svg, X-rays, previous medical records.</div>
            </div>
        </div>

        <input
            type="file"
            id="fileUpload"
            style={{ display: 'none' }}
            multiple
            onChange={(e) => setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)])}
        />

        {uploadedFiles.length > 0 && (
          <ul className="file-list">
            {uploadedFiles.map((file, i) => (
              <li key={i}>
                <File/>
                <p>{file.name}</p>
                <button className='remove-file'
                  onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                >
                  <XCircle color='red'/>
                </button>
              </li>
            ))}
          </ul>
        )}

      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel">Cancel</button>
        <button type="button" className="btn-save" onClick={handleSubmit}>
          Save Patient
        </button>
      </div>

    </div>
  );
}