import logo from "./logo.svg";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Task_Overview from "./pages/Task/Task_Overview";
import User_Management from "./pages/Task/User_Management";
import User_NewEdit from "./pages/Task/User_NewEdit";
import Home from "./pages/Task/Home";
import NoPage from "./pages/Task/NoPage";
import  { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router-dom'
import { Col, Container, Row } from "react-bootstrap";
import SignUp from "./pages/Task/SignUp";
import SignIn from "./pages/Task/SignIn";

function App() {

  const Layout = () => (
    <Container fluid>
        <Row>
          <Col xs="auto" style={{ width: '25px' }}>
            <Sidebar />
          </Col>
          <Col xs={11}>
            <Outlet />
          </Col>
        </Row>
      </Container>

  );
  return (
    <>
      <Routes>      
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/authenticated" element={<Layout />}>        
          <Route path="home" element={<Home />} />
          <Route path="tasks" element={<Task_Overview />} />
          <Route path="users" element={<User_Management />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
