import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UserContext } from './Contexts/UserContext';
import UserTable from './Components/UserTable';
import EmployeeDetailsWrapper from './Components/EmployeeDetailsWrapper';
import { Toast, ToastContainer } from 'react-bootstrap';
import './App.css';

const App = () => {
  const { users, setUsers } = useContext(UserContext);
  const [toast, setToast] = useState({ show: false, message: '', bg: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hours, setHours] = useState(0);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const addUser = (name, rate) => {
    const newUser = {
      id: Date.now(),
      name,
      rate: parseFloat(rate),
      monthlyData: {},
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    showToast('User added successfully!', 'success');
  };

  const updateUser = (userId, updatedData) => {
    setUsers(prevUsers =>
      prevUsers.map(user => (user.id === userId ? { ...user, ...updatedData } : user))
    );
    showToast('User updated successfully!', 'warning');
  };

  const deleteUser = (userId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    showToast('User deleted successfully!', 'danger');
  };

  const showToast = (message, bg) => {
    setToast({ show: true, message, bg });
    setTimeout(() => setToast({ show: false, message: '', bg: '' }), 3000);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const location = useLocation();

  return (
    <div className="container">
      {location.pathname === '/' && (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-4">Employee Management</h1>
            <button onClick={toggleDarkMode} className="btn btn-secondary btn-small">
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
          <div className="row">
            <div className="col-12">
              <UserTable
                users={users}
                updateUser={updateUser}
                deleteUser={deleteUser}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                hours={hours}
                setHours={setHours}
              />
              <AddUserForm addUser={addUser} />
            </div>
          </div>
        </>
      )}
      <Routes>
        <Route path="/employee-details/:id" element={<EmployeeDetailsWrapper />} />
      </Routes>
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setToast({ show: false, message: '', bg: '' })} show={toast.show} delay={3000} autohide bg={toast.bg}>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

const AddUserForm = ({ addUser }) => {
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(name, rate);
    setName('');
    setRate('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        className="form-control"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.01"
        className="form-control"
        placeholder="Rate"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary">
        <i className="fas fa-plus"></i> Add User
      </button>
    </form>
  );
};

export default App;
