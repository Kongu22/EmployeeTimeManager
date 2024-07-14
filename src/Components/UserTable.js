import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Table, Row, Col } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import html2canvas from 'html2canvas';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserTable = ({ users, updateUser, deleteUser, selectedDate, setSelectedDate, hours, setHours }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [rate, setRate] = useState(0);
  const tableRef = useRef(null);

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleShowEditModal = (user) => {
    setSelectedUser(user);
    setRate(user.rate);
    setShowEditModal(true);
    const currentDay = selectedDate.toISOString().split('T')[0];
    const userHours = user.monthlyData?.[currentDay]?.hours || 0;
    setHours(userHours);
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleCloseResetModal = () => setShowResetModal(false);
  const handleShowResetModal = () => setShowResetModal(true);

  const handleCloseDetailsModal = () => setShowDetailsModal(false);
  const handleShowDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const currentDay = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const userHours = selectedUser.monthlyData?.[currentDay]?.hours || 0;
    setHours(userHours);
  };

  const handleEdit = () => {
    const currentDay = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const userMonthlyData = { ...selectedUser.monthlyData };

    if (!userMonthlyData[currentDay]) {
      userMonthlyData[currentDay] = { hours: 0 };
    }

    const newHours = parseFloat(hours).toFixed(2);
    userMonthlyData[currentDay].hours = newHours;

    updateUser(selectedUser.id, { monthlyData: userMonthlyData, rate: parseFloat(rate) });
    handleCloseEditModal();
  };

  const handleRemoveHours = () => {
    const currentDay = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const userMonthlyData = { ...selectedUser.monthlyData };

    if (userMonthlyData[currentDay]) {
      delete userMonthlyData[currentDay];
    }

    updateUser(selectedUser.id, { monthlyData: userMonthlyData });
    handleCloseEditModal();
  };

  const handleResetMonth = () => {
    const currentMonth = selectedDate.toISOString().slice(0, 7);
    const userMonthlyData = { ...selectedUser.monthlyData };

    Object.keys(userMonthlyData).forEach(key => {
      if (key.startsWith(currentMonth)) {
        delete userMonthlyData[key];
      }
    });

    updateUser(selectedUser.id, { monthlyData: userMonthlyData });
    handleCloseResetModal();
  };

  const handleDeleteUser = () => {
    deleteUser(userToDelete.id);
    handleCloseDeleteModal();
  };

  const totalHours = (monthlyData) => {
    return Object.values(monthlyData || {}).reduce((acc, val) => acc + parseFloat(val.hours || 0), 0).toFixed(2);
  };

  const totalDaysWorked = (monthlyData) => {
    const days = new Set(Object.keys(monthlyData || {}).map(key => key.split('T')[0]));
    return days.size;
  };

  const downloadScreenshot = () => {
    html2canvas(tableRef.current).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'employee_table.png';
      link.click();
    });
  };

  const renderDetailsModal = () => {
    if (!selectedUser) {
      return null;
    }

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const hoursPerMonth = months.map(month => {
      return Object.entries(selectedUser.monthlyData)
        .filter(([date]) => new Date(date).getMonth() + 1 === month)
        .reduce((acc, [date, data]) => acc + parseFloat(data.hours || 0), 0);
    });

    const daysWorkedPerMonth = months.map(month => {
      return Object.entries(selectedUser.monthlyData)
        .filter(([date]) => new Date(date).getMonth() + 1 === month)
        .reduce((acc, [date, data]) => acc + (parseFloat(data.hours) > 0 ? 1 : 0), 0);
    });

    const chartData = {
      labels: months.map(month => `Month ${month}`),
      datasets: [
        {
          label: 'Hours Worked',
          data: hoursPerMonth,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        }
      ],
    };

    const tableData = months.map(month => ({
      month: `Month ${month}`,
      hours: hoursPerMonth[month - 1],
      daysWorked: daysWorkedPerMonth[month - 1]
    }));

    return (
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser.name}'s Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h4>Hours Worked</h4>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Monthly Hours Worked'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Hours'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Month'
                      }
                    }
                  }
                }}
              />
            </Col>
            <Col md={6}>
              <h4>Days Worked</h4>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Hours</th>
                    <th>Days Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((data, index) => (
                    <tr key={index}>
                      <td>{data.month}</td>
                      <td>{data.hours.toFixed(2)}</td>
                      <td>{data.daysWorked}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div className="mt-4">
      <h2>User Table</h2>
      <div className="table-responsive">
        <div ref={tableRef}>
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Hours Worked</th>
                <th>Daily/Hourly Rate</th>
                <th>Total Salary</th>
                <th>Days Worked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{totalHours(user.monthlyData)}</td>
                  <td>{user.rate.toFixed(2)}</td>
                  <td>{(totalHours(user.monthlyData) * user.rate).toFixed(2)}</td>
                  <td>{totalDaysWorked(user.monthlyData)}</td>
                  <td>
                    <button onClick={() => handleShowEditModal(user)} className="btn btn-warning btn-sm me-2 action-buttons">
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button onClick={() => handleShowDeleteModal(user)} className="btn btn-danger btn-sm me-2 action-buttons">
                      <i className="fas fa-trash"></i> Delete
                    </button>
                    <button onClick={() => handleShowDetailsModal(user)} className="btn btn-info btn-sm action-buttons">
                      <i className="fas fa-chart-bar"></i> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Button variant="primary" onClick={downloadScreenshot}>
        Download Screenshot
      </Button>

      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
          />
          <Form>
            <Form.Group controlId="formHours">
              <Form.Label>Hours Worked on {new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0]}</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value).toFixed(2))}
              />
            </Form.Group>
            <Form.Group controlId="formRate">
              <Form.Label>Daily/Hourly Rate</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value).toFixed(2))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="danger" onClick={handleRemoveHours}>
            Remove Hours
          </Button>
          <Button variant="warning" onClick={handleShowResetModal}>
            Reset Month
          </Button>
          <Button variant="primary" onClick={handleEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this employee?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResetModal} onHide={handleCloseResetModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Reset Month</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to reset the month?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseResetModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleResetMonth}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      {renderDetailsModal()}
    </div>
  );
};

export default UserTable;
