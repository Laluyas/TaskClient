import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import axios from "axios";
import { Col, Container, Row } from "react-bootstrap";
import AddTaskModal from "./AddTaskModal";
import { Button, useMediaQuery } from "@mui/material";
import EditTaskModal from "./EditTaskModal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTasks } from "../../context/TaskProvider";
import { useUsers } from "../../context/UserProvider";


const Task_Overview = () => {

  const isVerySmallScreen = useMediaQuery("(max-width:600px)");
  const isSmallScreen = useMediaQuery("(max-width:800px)");
  const isMediumScreen = useMediaQuery("(max-width:1200px)");

  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null); // State to hold selected Task ID
  const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

  const {tasks, setTasks, fetchTasks, loading} = useTasks()
  const {users, setUsers, fetchUsers} = useUsers()

  useEffect(() => {
    const fetchData = async () =>{
      await fetchTasks(); // Ensure tasks are fetched
    }
    if(!loading){
      fetchData()
    }
  }, [token])
  

  // Fetch task details with Axios
  useEffect(() => {
    const fetchData = async () =>{
      const formattedData = tasks.map((task) => ({
        ...task,
        usersEmail: task.users.map((user) => user.email),
      }));
      
      setRowData(formattedData);
    }
    if(!loading && tasks.length > 0){
      fetchData()
    }
    }, [tasks, loading, token]);

  

  const [openAddModal, setAddOpenModal] = useState(false);
  const [openEditModal, setEditOpenModal] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  

  const handleAddOpenModal = () => {
    setAddOpenModal(true);
  };

  const handleAddCloseModal = () => {
    setAddOpenModal(false);
  };

  const handleEditOpenModal = () => {
    setEditOpenModal(true);
  };

  const handleEditCloseModal = () => {
    setEditOpenModal(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const ActionButtons = ({ data }) => {
    const handleEdit = () => {
      setSelectedTask(data)
      handleEditOpenModal();
    };
    const handleDelete = () => {
      // Make sure to replace 'http://localhost:4000' with your actual backend URL
      axios
        .delete(`http://localhost:4000/api/tasks/${data._id}`)
        .then((response) => {
          setRowData((prevRowData) =>
            prevRowData.filter((task) => task._id !== data._id)
          );
          setOpenSnackbar(true);
          setSnackbarSeverity("success");
          setSnackbarMessage("Delete successful for task row with ID: " + data._id); // Set success message from response
        })
        .catch((error) => {
          console.error("Error deleting data:", error);
          setOpenSnackbar(true);
          setSnackbarSeverity("error");
          setSnackbarMessage("Delete failed for task row with ID: " + data._id); // Set success message from response
        });
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

  // Custom date formatter function
  const dateFormatter = (params) => {
    // Assuming params.value is in ISO format like "2024-06-15T12:00:00Z"
    const dateObj = new Date(params.value);
    return dateObj.toLocaleDateString(); // Customize the format using toLocaleDateString options
  };

  // Priority formatter function
  const priorityFormatter = (params) => {
    switch (params.value) {
      case 1:
        return "High";
      case 2:
        return "Medium";
      case 3:
        return "Low";
      default:
        return "";
    }
  };

  // Column Definitions: Defines the columns to be displayed.
  const [fullColDefs, setFullColDefs] = useState([
    { field: "title", filter: true ,flex:1,},
    { field: "description", filter: true ,flex:1,},
    { field: "dueDate", filter: true,flex:1, valueFormatter: dateFormatter },
    // { field: "priority", filter: true, valueFormatter: priorityFormatter },
    // { field: "status", filter: true },
    //{ field: "category", filter: true },
    {
      headerName: "Assigned To",
      field: "usersEmail",
      filter: true,flex:1,
      cellRendererFramework: ({ value }) => (
          <ul style={{ padding: 0, margin: 0 }}>
          {
          value.map((email, index) => (
            <li key={index}>{email}</li>
          ))}
        </ul>
        )
    },
    { headerName: "Buttons",flex:1, cellRenderer: ActionButtons },
  ]);

  const mediumColumnDefs = fullColDefs.filter(
    (col) => col.field !== "description"
  );

  const smallColumnDefs = mediumColumnDefs.filter(
    (col) => col.field !== "usersEmail" && col.field !== "description"
  );

  const verySmallColumnDefs = mediumColumnDefs.filter(
    (col) => col.field !== "usersEmail" && col.field !== "description" && col.field !=="dueDate"
  );

  const getColumnDefs = () => {
    if (isVerySmallScreen) return verySmallColumnDefs;
    if (isSmallScreen) return smallColumnDefs;
    if (isMediumScreen) return mediumColumnDefs;
    
    return fullColDefs;
  };

  // Pagination settings
  const pagination = true;
  const paginationPageSize = 10;
  const paginationPageSizeSelector = [10, 20, 50];

  // Function to update the row data after edit
  const updateRowData = (updatedTask) => {
    console.log("yi:",updatedTask)
    setRowData((prevData) =>
      prevData.map((task) =>
        task._id === updatedTask._id
          ? { ...updatedTask, usersEmail: updatedTask.users.map((user) => user.email) }
          : task
      )
    );
    setSelectedTask(null);
    handleEditCloseModal();
  };

    // Function to update the row data after edit
    const AddRowData = (updatedTask) => {
      setRowData((prevData) => [...prevData, updatedTask])
      setSelectedTask(null);
      handleEditCloseModal();
    };

  return (
    <>
      <Container>
        <Row>
          <center>
              <h2 style={{ margin: "10px 0" }}>Task Overview</h2>
          </center>  
        </Row>
        <Row>
          <div className="d-flex justify-content-end">
            <Button
              variant="contained"
              color="primary"
              className="mx-5 my-2"
              onClick={handleAddOpenModal}
            >
              New Task
            </Button>
          </div>
        </Row>
        <Row>
          <Col>
            <div
              className="ag-theme-quartz-dark" // applying the grid theme
              style={{ height: 600 }} // the grid will fill the size of the parent container
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={getColumnDefs()}
                pagination={pagination}
                paginationPageSize={paginationPageSize}
                paginationPageSizeSelector={paginationPageSizeSelector}
              />
            </div>
          </Col>
        </Row>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
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
      <AddTaskModal 
        open={openAddModal} 
        handleClose={handleAddCloseModal}
        AddRowData={AddRowData}
         />
      <EditTaskModal
        open={openEditModal}
        handleClose={handleEditCloseModal}
        selectedTask={selectedTask}
        updateRowData={updateRowData}
      />
      {/* Render other components related to task management */}
    </>
  );
};

export default Task_Overview;