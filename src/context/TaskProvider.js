import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchTasks = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    if(token){
      try {
        const response = await axios.get('https://taskserver-99hb.onrender.com/api/tasks', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error.message);
      }finally {
          setLoading(false); // Set loading to false after fetching
        }
    }    
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, setTasks, fetchTasks, loading  }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext);
