import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const categories = ["Work", "Personal", "Study", "Others"];
const priorities = ["High", "Medium", "Low"];
const statuses = ["Pending", "In Progress", "Completed"];

const EditTaskModal = ({ open, handleClose, selectedTask, setRowData }) => {
  const theme = useTheme();
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Pending");
  const [assignedTo, setAssignedTo] = useState([]);
  const [users, setUsers] = useState([]);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://taskserver-99hb.onrender.com/api/users/"
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      setId(selectedTask._id);
      setTitle(selectedTask.title);
      setDescription(selectedTask.description);
      setDueDate(selectedTask.dueDate);
      setPriority(priorities[selectedTask.priority - 1]);
      setCategory(selectedTask.category);
      setStatus(selectedTask.status);
      setAssignedTo(selectedTask.users); // Populate assignedTo with emails
      
    }
  }, [selectedTask]);

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    
    const taskData = {
      title,
      description,
      dueDate,
      priority,
      category,
      status,
      users: assignedTo.map((email) =>
        users.find((user) => user.email === email)._id
      ),
    };

    try {
      const response = await axios.put(
        `https://taskserver-99hb.onrender.com/api/tasks/${id}`,
        taskData
      );
      const updatedTask = response.data;
      setRowData((prevRowData) =>
        prevRowData.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      setOpenSnackbar(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Task edited successfully!");
      handleClose();
    } catch (error) {
      console.error("Error editing task:", error);
      setOpenSnackbar(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to edit task.");
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            ...theme.typography.body1,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <form onSubmit={handleEditSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {priorities.map((priorityOption) => (
                      <MenuItem key={priorityOption} value={priorityOption}>
                        {priorityOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    label="Status"
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  options={users.map((user) => user.email)}
                  value={assignedTo}
                  onChange={(event, newValue) => {
                    setAssignedTo(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assigned To"
                      placeholder="Select users"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Save
                </Button>
                <Button
                  onClick={handleClose}
                  variant="contained"
                  color="warning"
                  sx={{ ml: 2 }}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
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
    </>
  );
};

export default EditTaskModal;
