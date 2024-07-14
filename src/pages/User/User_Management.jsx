import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { Container, Row } from "react-bootstrap";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import AddUserModal from "../User/AddUserModal"; // Import your modal component
import { Button, useMediaQuery } from "@mui/material";
import EditUserModal from "../User/EditUserModal";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTasks } from "../../context/TaskProvider";
import { useUsers } from "../../context/UserProvider";

// User Management Component
const User_Management = () => {

  const {tasks, setTasks, fetchTasks} = useTasks()
  const {users, setUsers, fetchUsers, loading} = useUsers()

  const isSmallScreen = useMediaQuery("(max-width:800px)");

  const [rowData, setRowData] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [AddopenModal, setAddOpenModal] = useState(false); // State for modal open/close
  const [EditopenModal, setEditOpenModal] = useState(false); // State for modal open/close
  const [selectedUser, setSelectedUser] = useState(null); // State to hold selected user ID

  // Custom Delete Button Component
  const ActionButtons = (props) => {
    const handleEdit = async () => {
      setSelectedUser(props.data); // Set the selected user ID
      handleEditOpenModal(); // Open edit modal
    };
    const handleDelete = async () => {
      try {
        const response = await axios.delete(
          `https://taskserver-99hb.onrender.com/api/users/${props.data._id}`
        );
        console.log("User deleted:", response.data);
        setRowData((prevRowData) =>
          prevRowData.filter((user) => user._id !== props.data._id)
        );
        setOpenSnackbar(true);
        setSnackbarSeverity("success");
        setSnackbarMessage(response.data.mssg); // Set success message from response
      } catch (error) {
        console.error("Error deleting user:", error);
        setOpenSnackbar(true);
        setSnackbarSeverity("error");
        setSnackbarMessage(error.response.data.mssg); // Set error message from response
      }
    };

    return (
      <>
      <Button variant="contained" color="success" className="me-2" onClick={handleEdit}>
          <EditIcon/>
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete}>
          <DeleteIcon/>
        </Button>
      </>
    );
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleAddOpenModal = () => {
    setAddOpenModal(true);
  };

  const handleEditOpenModal = () => {
    setEditOpenModal(true);
  };

  const handleAddCloseModal = () => {
    setAddOpenModal(false);
  };

  const handleEditCloseModal = () => {
    setEditOpenModal(false);
  };

  useEffect(() => {
    if(!loading){      
        setRowData(users);
      }
    
  }, [loading]);

  const pagination = true;
  const paginationPageSize = 10;
  const paginationPageSizeSelector = [10, 20, 50];

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
      { field: "email", filter: true ,flex:1,},
      { field: "role", filter: true ,flex:1,},
      { field: "buttons", filter: true,flex:1, cellRenderer: ActionButtons },
    ]);
  
      const smallColDefs = colDefs.filter(
        (col) => col.field !== "role" 
      );
    
      const getColDefs = () => {
        if (isSmallScreen) return smallColDefs;      
        return colDefs;
      };

  return (
    <>
      <Container>
        <Row>
          <center>
              <h2 style={{ margin: "10px 0" }}>User Management</h2>
          </center>  
        </Row>
        <Row>
          <div className="d-flex justify-content-end">
            <Button
              variant="contained"
              color="primary"
              className="mx-5 my-2"
              onClick={handleAddOpenModal} // Open modal when button is clicked
            >
              New User
            </Button>
          </div>
        </Row>
        <Row>
          <div className="ag-theme-quartz-dark" style={{ height: 600 }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={getColDefs()}
              pagination={pagination}
              paginationPageSize={paginationPageSize}
              paginationPageSizeSelector={paginationPageSizeSelector}
            />
          </div>
        </Row>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity} // Severity can be success, error, warning, info
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
        <AddUserModal open={AddopenModal} handleClose={handleAddCloseModal} setRowData={setRowData}/>
        <EditUserModal
          open={EditopenModal}
          handleClose={handleEditCloseModal}
          selectedUser={selectedUser} // Pass selected user ID to EditUserModal
          setRowData={setRowData}
        />
        {/* Render modal component */}
      </Container>
    </>
  );
};

export default User_Management;
