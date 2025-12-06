import React, { useState } from 'react';
import '../styles/add_patient.css';
import { UserRound, CloudUpload, Bold, Plus, XCircle, File } from 'lucide-react';
import axios from 'axios';

export default function AddPatient() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    emailAddress: '',
    city: '',
    Address: '',
    emergencyCall: '',
    notes: '',
    currentMedications: ''
  });

  const cities = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna",
    "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
    "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou",
    "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda",
    "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine",
    "Médéa", "Mostaganem", "M’Sila", "Mascara", "Ouargla",
    "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès",
    "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
    "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma",
    "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar",
    "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt",
    "Djanet", "El M’Ghair", "El Meniaa", "Maghnia"
  ];

  const [allergies, setAllergies] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [chronicConditions, setChronicConditions] = useState([]);
  const [newCondition, setNewCondition] = useState('');
  const [hereditary, setHereditary] = useState([]);
  const [newHereditary, setNewHereditary] = useState('');

  const [showCityDropdown, setShowCityDropdown] = useState(false);

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

  const [errors, setErrors] = useState({});

  function verifyInfo() {
    const { firstName, lastName, dateOfBirth, gender, phoneNumber, emailAddress, emergencyCall } = formData;
    let newErrors = {};

    if(!firstName.trim()) newErrors.firstName = "First name is required";
    if(!lastName.trim()) newErrors.lastName = "Last name is required";
    if(!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    else if(isNaN(new Date(dateOfBirth).getTime()) || (new Date(dateOfBirth).getTime()) > Date.now())
      newErrors.dateOfBirth = "Please enter a valid date";

    if(!gender) newErrors.gender = "Gender is required";

    const phoneRegex = /^(?:\+213|0)(5|6|7)\d{8}$/;
    if(!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if(!phoneRegex.test(phoneNumber))
      newErrors.phoneNumber = "Invalid phone number format";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if(!emailAddress.trim()) newErrors.emailAddress = "Email is required";
    else if(!emailRegex.test(emailAddress))
      newErrors.emailAddress = "Invalid email format";

    if(emergencyCall && !phoneRegex.test(emergencyCall))
      newErrors.emergencyCall = "Invalid phone number"

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  const handleSubmit = async () => {
    if(verifyInfo()) {
      //console.log('Form submitted:', { ...formData, allergies, chronicConditions, hereditary });
      const patientData = { ...formData, allergies, chronicConditions, hereditary };
      try {
        const response = await axios.post('http://localhost:5000/api/patients', patientData);
        if(response.data.status) {
          console.log(response.data.patient_data);
        }
        alert('Patient saved successfully!');
      }
      catch(error) {
        console.log("From server: ", error);
      }
    }
  };

  return (
    <div className="form-container">
      <div className="form-container-header">
        <div className="header-icon">
            <UserRound/>
        </div>
        <div>
          <h1>Add New Patient</h1>
          <p>Fill in the details to add a new patient record.</p>
        </div>
      </div>

      <div className="form-container-section">
        <h2>Personal Details</h2>
        <div className="form-section-row">
          <div className="form-section-group">
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
          <div className="form-section-group">
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

        <div className="form-section-row">
          <div className="form-section-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
            {errors.dateOfBirth && <div className="error-msg">{errors.dateOfBirth}</div> }
          </div>
          <div className="form-section-group">
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

      <div className="form-container-section">
        <h2>Contact Information</h2>
        <div className="form-section-row">
          <div className="form-section-group">
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
          <div className="form-section-group">
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

        <div className="form-section-row">
          <div className="form-section-group">
          <label>City</label>

          <div className="city-autocomplete">
            <input
              type="text"
              name="city"
              placeholder="Type to search city..."
              value={formData.city}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, city: e.target.value }));
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              className="city-input"
            />
            
            {showCityDropdown && formData.city.length > 0 && (
              <div className="city-dropdown">
                {cities
                  .filter(city =>
                    city.toLowerCase().includes(formData.city.toLowerCase())
                  )
                  .slice(0, 7)
                  .map((city, index) => (
                    <div
                      key={index}
                      className="city-option"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, city }));
                        setShowCityDropdown(false);
                      }}
                    >
                      {city}
                    </div>
                  ))}

                {cities.filter(city =>
                  city.toLowerCase().includes(formData.city.toLowerCase())
                ).length === 0 && (
                  <div className="city-option no-match">No city found</div>
                )}
              </div>
            )}
          </div>
        </div>


          <div className="form-section-group">
            <label>Address</label>
            <input
              name="Address"
              placeholder="Enter address"
              value={formData.Address}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-section-group">
          <label>Emergency call</label>
          <input
            name="emergencyCall"
            placeholder="Enter emergency call"
            value={formData.emergencyCall}
            onChange={handleInputChange}
          />
          {errors.emergencyCall && <div className="error-msg">{errors.emergencyCall}</div>}
        </div>
      </div>
      
      <div className="form-container-section">
        <h2>Notes</h2>
        <div className="form-section-group">
          <textarea
            name="notes"
            placeholder="Write down some notes ..."
            rows="3"
            value={formData.notes}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-container-section">
        <h2>Medical History</h2>
        
        <div className="form-section-group">
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

        <div className="form-section-group">
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

        <div className="form-section-group">
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

        <div className="form-section-group">
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


      <div className="form-actions">
        <button type="button" className="cancel-btn">Cancel</button>
        <button type="button" className="save-btn" onClick={handleSubmit}>
          Save Patient
        </button>
      </div>

    </div>
  );
}