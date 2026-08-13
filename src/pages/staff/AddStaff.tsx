// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createStaff } from '../../services/staff.service';
import './Staff.css';

const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { gym } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    setIsSubmitting(true);
    
    const { data, error } = await createStaff(gym.id, {
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      email: formData.email,
      permissions: ['view_members'] // Default permission
    });
    
    setIsSubmitting(false);
    
    if (!error) {
      navigate('/app/staff');
    } else {
      alert('Error creating staff: ' + (error as any).message);
    }
  };

  return (
    <div className="staff-page-container">
      <div className="staff-header" style={{ justifyContent: 'center' }}>
        <h1>Add New Staff</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="form-control" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="form-control" 
              required
            >
              <option value="">Select a role...</option>
              <option value="Trainer">Trainer</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Manager">Manager</option>
              <option value="Cleaning Staff">Cleaning Staff</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>



          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Staff Member'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaff;

