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
import { useUsers } from "../../context/UserProvider";
import { useTasks } from "../../context/TaskProvider";

const categories = ["Work", "Personal", "Study", "Others"];
const priorities = ["High", "Medium", "Low"];
const statuses = ["Pending", "In Progress", "Completed"];

const EditTaskModal = ({ open, handleClose, selectedTask, updateRowData }) => {
  const theme = useTheme();
  const [Id, setId] = useState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Pending");
  const [assignedTo, setAssignedTo] = useState([]);
  const [usersDropDown, setUsersDropDown] = useState([]);
  const { tasks, fetchTasks } = useTasks();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { users: UserList, fetchUsers, loading } = useUsers();

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    const SetTask = () => {
      
      if (selectedTask) {
        setId(selectedTask._id);
        setTitle(selectedTask.title);
        setDescription(selectedTask.description);
        setDueDate(new Date(selectedTask.dueDate).toISOString().substring(0, 10));
        setPriority(priorities[selectedTask.priority - 1]);
        setCategory(selectedTask.category);
        setStatus(selectedTask.status);
        setAssignedTo(selectedTask.users);
      }
    };

    if (!loading) {
      SetTask();
      setUsersDropDown(UserList);
    }
  }, [open, selectedTask, loading, UserList]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const selectedUserIDs = assignedTo.map((user) => user._id);

    const taskData = {
      _id: Id,
      title: title,
      description: description,
      dueDate: dueDate,
      priority: priorities.indexOf(priority) + 1,
      category: category,
      status: status,
      users: assignedTo,
      usersEmail: selectedUserIDs,
    };

    try {
      const response = await axios.patch(
        `https://taskserver-99hb.onrender.com/api/tasks/${selectedTask._id}`,
        taskData
      );
      updateRowData(taskData);
      setOpenSnackbar(true);
      setSnackbarSeverity("success");
      setSnackbarMessage(response.data.mssg);
      fetchTasks()     

      handleClose();
    } catch (error) {
      console.error("Error updating task:", error);
      setOpenSnackbar(true);
      setSnackbarSeverity("error");
      setSnackbarMessage(error.response.data.mssg);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="edit-task-modal-title"
        aria-describedby="edit-task-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90%",
              sm: "80%",
              md: "60%",
              lg: "50%",
              xl: 800,
            },
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2 id="edit-task-modal-title">Edit Task</h2>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="date"
                  variant="outlined"
                  fullWidth
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((categoryOption) => (
                      <MenuItem key={categoryOption} value={categoryOption}>
                        {categoryOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {statuses.map((statusOption) => (
                      <MenuItem key={statusOption} value={statusOption}>
                        {statusOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  id="assignedTo"
                  options={usersDropDown}
                  getOptionLabel={(option) => option.email}
                  value={assignedTo}
                  onChange={(event, newValue) => {
                    setAssignedTo(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Assigned To"
                      placeholder="Select Users"
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
        autoHideDuration={6000}
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
