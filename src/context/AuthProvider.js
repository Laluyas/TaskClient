// AuthContext.js
import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [Id, setId] = useState();
  const [email, setEmail] = useState();
  const [token, setToken] = useState();
  const [User, setUser] = useState();
  useEffect(() => {
    const id = localStorage.getItem("id");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");
    if (token) {
      setId(id);
      setEmail(email);
      setToken(token);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    
  }, []);

  const login = (id, email, token) => {
    setId(id);
    setEmail(email);
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const getUserById = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/users/${Id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data)
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getUserById, email, User, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
