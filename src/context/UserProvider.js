import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchUsers = async () => {
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('authToken');

    if (!id || !token) return;

    try {
      const response = await axios.get(`http://localhost:4000/api/users`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      setUsers(null); // Clear user data on error
    }finally {
        setLoading(false); // Set loading to false after fetching
      }

      try {
        const response = await axios.get(`http://localhost:4000/api/users/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        setUser(null); // Clear user data on error
      }finally {
          setLoading(false); // Set loading to false after fetching
        }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ user, users, setUsers,setUser, fetchUsers, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => useContext(UserContext);
