import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";

// Copyright component
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Task Manager
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// Create a default theme
const defaultTheme = createTheme();

// SignIn component
export default function SignIn() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

  const { login } = useAuth();

  const navigate = useNavigate();

  //Test if DB connection is working fine
  useEffect(() => {
    if (authToken) {
      navigate('/home')
    } 
  }, []);

    // Function to verify the token
    // const verifyToken = async () => {
    //   try {
    //     const response = await axios.get("https://taskserver-99hb.onrender.com/api/users/verify-token", {
    //       headers: {
    //         authorization: `Bearer ${authToken}`,
    //       },
    //     });
  
    //     if (response.status === 200) {
    //       navigate('/home');
    //     }
    //   } catch (error) {
    //     console.error("Token verification failed", error);
    //     localStorage.removeItem('authToken');
    //     setAuthToken(null);
    //   }
    // };
  
    // // Test if DB connection is working fine
    // useEffect(() => {
    //   if (authToken) {
    //     verifyToken();
    //   } 
    // }, [authToken]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Front-end validation
    let valid = true;

    if (!email) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (!password) {
      setPasswordError(true);
      valid = false;
    } else {
      setPasswordError(false);
    }

    if (!valid) {
      setOpenSnackbar(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("Please fill in all required fields");
      return;
    }
    if(valid){
      const formData = {
        email: email,
        password: password,
      };
  

  
      try {
        const response = await axios.post(
          "https://taskserver-99hb.onrender.com/api/users/login",
          formData
        );
        
        // Store email in local storage
        localStorage.setItem("id", response.data.id);

        localStorage.setItem("email", response.data.email);

        localStorage.setItem("authToken", response.data.token);

        login(response.data.id, response.data.email, response.data.token)


        if (response) {
          setOpenSnackbar(true);
          setSnackbarSeverity("success");
          setSnackbarMessage(response.data.mssg); // Set success message from response
          setTimeout(() => {
            navigate("/home");
          }, 1500); // Navigate after 1.5 seconds
        }
      } catch (error) {
        console.error("There was an error!", error);
        setOpenSnackbar(true);
        setSnackbarSeverity("error");
        setSnackbarMessage(error.response.data.mssg); // Set error message from response
      }
    };
    }   

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onClick={()=>setEmailError(false)}
              error={emailError}
              helperText={emailError ? "Email is required" : ""}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onClick={()=>setPasswordError(false)}
              error={passwordError}
              helperText={passwordError ? "Password is required" : ""}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
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
    </ThemeProvider>
  );
}
