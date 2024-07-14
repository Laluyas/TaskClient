import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Button } from "@mui/material";
import axios from "axios";
import OpenTaskModal from "./OpenTaskModal";
import NoEditOpenTaskModal from "./NoEditOpenTaskModal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useAuth } from "../../context/AuthProvider";
import { useTasks } from "../../context/TaskProvider";
import { useUsers } from "../../context/UserProvider";

const Home = () => {
  const { email, getUserById } = useAuth();
  const { tasks, fetchTasks, loading } = useTasks();
  const { user, users, fetchUsers } = useUsers();

  // State for grid data
  const [assignedToMeRowData, setAssignedToMeRowData] = useState([]);
  const [unassignedRowData, setUnassignedRowData] = useState([]);
  const [completedRowData, setCompletedRowData] = useState([]);
  

  useEffect(() => {
    
    getUserById()

    const fetchData = async () => {
      // Map over response data and format 'users' field if needed
      const formattedTaskData = tasks.map((task) => ({
        ...task,
        users: task.users.map((user) => user.email),
      }));

      // Filter tasks assigned to the current user
      const assignedToMeTasks = formattedTaskData.filter(
        (task) =>
          task.users.some((userEmail) => userEmail === email) &&
          task.status !== "Completed"
      );

      const unassignedTasks = formattedTaskData.filter(
        (task) => task.users.length === 0
      );

      const completedTasks = formattedTaskData.filter(
        (task) => task.status === "Completed"
      );

      setAssignedToMeRowData(assignedToMeTasks);
      setUnassignedRowData(unassignedTasks);
      setCompletedRowData(completedTasks);

      
    };

    if (!loading && email) {
      fetchData();
    }
  }, [tasks]);

  const token = localStorage.getItem("authToken"); // Retrieve the token from localStorage

  const [value, setValue] = useState(0);

  const [openModal, setOpenModal] = useState(false); // State for modal open/close
  const [noEditOpenModal, setNoEditOpenModal] = useState(false); // State for modal open/close
  const [selectedTaskId, setselectedTaskId] = useState();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleNoEditOpenModal = () => {
    setNoEditOpenModal(true);
  };

  const handleNoEditCloseModal = () => {
    setNoEditOpenModal(false);
  };

  const handleAssignTask = async (taskData) => {
    taskData.users.push(user); // Assuming `user` holds the user object
    taskData.status = "In Progress";


    try {
      const response = await axios.patch(
        `http://localhost:4000/api/tasks/${taskData._id}`,
        taskData
      );
      taskData.users = taskData.users.map(user=>user.email)
      // Update state based on successful assignment
      setAssignedToMeRowData((prevRowData) => [...prevRowData, taskData]);
      setUnassignedRowData((prevRowData) =>
        prevRowData.filter((task) => task._id !== taskData._id)
      );

      // Show success message
      console.log("Task updated:", response.data);
      setOpenSnackbar(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Task assigned to you!");
    } catch (error) {
      // Handle errors
      console.error("Error updating task:", error);
      setOpenSnackbar(true);
      setSnackbarSeverity("error");
      setSnackbarMessage(error.response?.data?.mssg || "Failed to update task");
    }
  };

  const handleUnAssignTask = async (taskData) => {
    taskData.users = [];
    taskData.status = "Pending";

    try {
      const response = await axios.patch(
        `http://localhost:4000/api/tasks/${taskData._id}`,
        taskData
      );

      setAssignedToMeRowData((prevRowData) =>
        prevRowData.filter((task) => task._id !== taskData._id)
      );
      setUnassignedRowData((prevRowData) => [...prevRowData, taskData]);
      console.log("Task updated:", response.data);
      setOpenSnackbar(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Task unassigned"); // Set success message from response
    } catch (error) {
      console.error("Error updating task:", error);
      setOpenSnackbar(true);
      setSnackbarSeverity("error");
      setSnackbarMessage(error.response?.data?.mssg); // Set error message from response
    }
  };

  const CustomOpenButtonComponent = ({ data }) => {
    const handleEdit = () => {
      // Handle opening the task detail modal or navigation
      setselectedTaskId(data._id);
      handleOpenModal();
    };

    return (
      <Button variant="contained" color="primary" onClick={handleEdit}>
        Open
      </Button>
    );
  };

  const CustomNoEditOpenButtonComponent = ({ data }) => {
    const handleEdit = () => {
      // Handle opening the task detail modal or navigation
      setselectedTaskId(data._id);
      handleNoEditOpenModal();
    };

    return (
      <Button variant="contained" color="primary" onClick={handleEdit}>
        Open
      </Button>
    );
  };

  const CustomUnAssignButtonComponent = ({ data }) => {
    const handleEdit = () => {
      handleUnAssignTask(data);
    };

    return (
      <Button variant="contained" color="error" onClick={handleEdit}>
        UnAssign
      </Button>
    );
  };

  const CustomAssignButtonComponent = ({ data }) => {
    const handleEdit = () => {
      handleAssignTask(data);
    };

    return (
      <Button variant="contained" color="success" onClick={handleEdit}>
        Assign to me
      </Button>
    );
  };

  const dateFormatter = (params) => {
    const dateObj = new Date(params.value);
    return dateObj.toLocaleDateString();
  };

  // Column Definitions: Defines the columns to be displayed.
  const assignedToMeColDef = [
    { field: "title", filter: true },
    { field: "description", filter: true },
    { field: "dueDate", filter: true, valueFormatter: dateFormatter },
    // { field: "priority", filter: true, valueFormatter: priorityFormatter },
    // { field: "status", filter: true },
    // { field: "category", filter: true },
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
    { cellRenderer: CustomOpenButtonComponent },
    { cellRenderer: CustomUnAssignButtonComponent },
  ];

  // Column Definitions: Defines the columns to be displayed.
  const unAssignedColDef = [
    { field: "title", filter: true },
    { field: "description", filter: true },
    { field: "dueDate", filter: true, valueFormatter: dateFormatter },
    // { field: "priority", filter: true, valueFormatter: priorityFormatter },
    // { field: "status", filter: true },
    // { field: "category", filter: true },
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
    { cellRenderer: CustomNoEditOpenButtonComponent },
    { cellRenderer: CustomAssignButtonComponent },
  ];

  // Column Definitions: Defines the columns to be displayed.
  const completedColDef = [
    { field: "title", filter: true },
    { field: "description", filter: true },
    { field: "dueDate", filter: true, valueFormatter: dateFormatter },
    // { field: "priority", filter: true, valueFormatter: priorityFormatter },
    // { field: "status", filter: true },
    // { field: "category", filter: true },
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
    { cellRenderer: CustomNoEditOpenButtonComponent },
  ];

  const pagination = true;
  const paginationPageSize = 500;
  const paginationPageSizeSelector = [200, 500, 1000];

  // if (!loading) {
  //   return <div>Loading...</div>; // Optional: Show loading indicator
  // }

  return (
    <>
      <Container>
        <Row className="mt-2">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Assigned to me" />
              <Tab label="Unassigned" />
              <Tab label="Completed" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <Row>
              <Col>
                <div className="ag-theme-quartz-dark" style={{ height: 600 }}>
                  <AgGridReact
                    rowData={assignedToMeRowData}
                    columnDefs={assignedToMeColDef}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                  />
                </div>
              </Col>
            </Row>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Row>
              <Col>
                <div className="ag-theme-quartz-dark" style={{ height: 600 }}>
                  <AgGridReact
                    rowData={unassignedRowData}
                    columnDefs={unAssignedColDef}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                  />
                </div>
              </Col>
            </Row>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Row>
              <Col>
                <div className="ag-theme-quartz-dark" style={{ height: 600 }}>
                  <AgGridReact
                    rowData={completedRowData}
                    columnDefs={completedColDef}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                  />
                </div>
              </Col>
            </Row>
          </TabPanel>
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
          severity={snackbarSeverity} // Severity can be success, error, warning, info
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      <OpenTaskModal
        open={openModal}
        handleClose={handleCloseModal}
        taskId={selectedTaskId} // Pass selected user ID to EditUserModal
      />
      <NoEditOpenTaskModal
        open={noEditOpenModal}
        handleClose={handleNoEditCloseModal}
        taskId={selectedTaskId} // Pass selected user ID to EditUserModal
      />
    
    </>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default Home;
