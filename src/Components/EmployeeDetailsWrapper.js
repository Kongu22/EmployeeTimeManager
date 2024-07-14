import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../Contexts/UserContext';
import EmployeeDetails from './EmployeeDetails';

const EmployeeDetailsWrapper = () => {
  const { id } = useParams();
  const { users } = useContext(UserContext);

  if (!users || users.length === 0) {
    console.error("Users prop is undefined or empty in EmployeeDetailsWrapper.");
  }

  return <EmployeeDetails userId={id} users={users || []} />;
};

export default EmployeeDetailsWrapper;
