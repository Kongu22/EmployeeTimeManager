import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Button, Container, Row, Col, Table } from 'react-bootstrap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EmployeeDetails = ({ userId, users }) => {
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState({});
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("EmployeeDetails users:", users);
    console.log("EmployeeDetails userId:", userId);

    if (!users || users.length === 0) {
      console.error("Users array is undefined or empty in EmployeeDetails.");
      return;
    }

    const selectedUser = users.find(user => user.id.toString() === userId);

    if (!selectedUser) {
      console.error(`User with id ${userId} not found.`);
      return;
    }

    setUser(selectedUser);

    console.log("Selected User:", selectedUser);

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const hoursPerMonth = months.map(month => {
      const monthHours = Object.entries(selectedUser.monthlyData)
        .filter(([date]) => {
          const parsedDate = new Date(date);
          return parsedDate.getMonth() + 1 === month;
        })
        .reduce((acc, [date, data]) => acc + parseFloat(data.hours || 0), 0);
      console.log(`Month ${month} hours:`, monthHours);
      return monthHours;
    });

    const daysWorkedPerMonth = months.map(month => {
      const monthDays = Object.entries(selectedUser.monthlyData)
        .filter(([date]) => {
          const parsedDate = new Date(date);
          return parsedDate.getMonth() + 1 === month;
        })
        .reduce((acc, [date, data]) => acc + (parseFloat(data.hours) > 0 ? 1 : 0), 0);
      console.log(`Month ${month} days worked:`, monthDays);
      return monthDays;
    });

    setChartData({
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
    });

    const tableData = months.map(month => ({
      month: `Month ${month}`,
      hours: hoursPerMonth[month - 1],
      daysWorked: daysWorkedPerMonth[month - 1]
    }));

    setTableData(tableData);
  }, [userId, users]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h2>{user.name}'s Details</h2>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back
          </Button>
        </Col>
      </Row>
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
    </Container>
  );
};

export default EmployeeDetails;
