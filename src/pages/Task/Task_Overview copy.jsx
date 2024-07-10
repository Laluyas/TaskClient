import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import axios from "axios";
import { Col, Container, Row } from "react-bootstrap";
import AddTaskModal from "./AddTaskModal";
import { Button } from "@mui/material";
import EditTaskModal from "./EditTaskModal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Task_Overview = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null); // State to hold selected Task object

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

  const CustomEditButtonComponent = ({ data }) => {
    const handleEdit = () => {
      setSelectedTask(data);
      handleEditOpenModal();
    };

    return (
      <Button variant="contained" color="success" onClick={handleEdit}>
        Edit
      </Button>
    );
  };

  const CustomDeleteButtonComponent = ({ data }) => {
    const handleDelete = () => {
      axios
        .delete(`https://taskserver-99hb.onrender.com/api/tasks/${data._id}`)
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
      <Button variant="contained" color="error" onClick={handleDelete}>
        Delete
      </Button>
    );
  };

  const dateFormatter = (params) => {
    const dateObj = new Date(params.value);
    return dateObj.toLocaleDateString();
  };

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

  const [colDefs, setColDefs] = useState([
    { field: "title", filter: true },
    { field: "description", filter: true },
    { field: "dueDate", filter: true, valueFormatter: dateFormatter },
    { field: "priority", filter: true, valueFormatter: priorityFormatter },
    { field: "status", filter: true },
    {
      headerName: "Assigned To",
      field: "users",
      filter: true,
      flex: 1,
      cellRendererFramework: ({ value }) => (
        <ul style={{ padding: 0, margin: 0 }}>
          {value.map((user) => (
            <li key={user._id}>{user.email}</li>
          ))}
        </ul>
      ),
    },
    { headerName: "Edit", cellRenderer: CustomEditButtonComponent },
    { headerName: "Delete", cellRenderer: CustomDeleteButtonComponent },
  ]);

  useEffect(() => {
    axios
      .get("https://taskserver-99hb.onrender.com/api/tasks/")
      .then((response) => {
        const formattedData = response.data.map((task) => ({
          ...task,
          users: task.users.map((user) => user.email),
        }));
        setRowData(formattedData);
        setOpenSnackbar(true);
        setSnackbarSeverity("success");
        setSnackbarMessage("Tasks loaded from Database successfully");
      })
      .catch((error) => {
        console.error("There was an error fetching the task data!", error);
        setOpenSnackbar(true);
        setSnackbarSeverity("error");
        setSnackbarMessage("There was an error fetching the task data from Database!");
      });
  }, []);

  const pagination = true;
  const paginationPageSize = 500;
  const paginationPageSizeSelector = [200, 500, 1000];

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
              className="ag-theme-quartz-dark"
              style={{ height: 600 }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
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
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      <AddTaskModal open={openAddModal} handleClose={handleAddCloseModal} setRowData={setRowData} />
      <EditTaskModal
        open={openEditModal}
        handleClose={handleEditCloseModal}
        selectedTask={selectedTask}
        setRowData={setRowData}
      />
    </>
  );
};

export default Task_Overview;
