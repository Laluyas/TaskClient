import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { IoMenu } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useTasks } from '../context/TaskProvider';
import { useEffect } from 'react';
import { useUsers } from '../context/UserProvider';

export default function Sidebar() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { logout, User } = useAuth();

  const { tasks, fetchTasks, loading } = useTasks();
  const { user, users, fetchUsers } = useUsers();

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [])


  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleSignOut = () => {
    // 1. Clear stored data from localStorage or sessionStorage
    localStorage.removeItem('id');
    localStorage.removeItem('email');
    localStorage.removeItem('authToken');

    // 2. Call logout function from authentication context
    logout();

    // 3. Redirect to homepage or login page
    navigate('/');
  };

  const drawerItems = [
    { text: 'Home', icon: <HomeIcon /> },
    { text: 'Profile', icon: <AccountCircleIcon /> },
    { text: 'Signout', icon: <LogoutIcon />, onClick: handleSignOut } // Added onClick handler for signout
  ];

  if (User && User.role && User.role.includes('Manager')) {
    drawerItems.splice(1, 0, { text: 'Tasks', icon: <AssignmentIcon /> });
    drawerItems.splice(2, 0, { text: 'Users', icon: <PeopleAltIcon /> });
  }

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {drawerItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={item.onClick ? 'button' : Link}
              to={item.onClick ? undefined : `/${item.text.toLowerCase()}`}
              onClick={item.onClick}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <Button variant='primary' onClick={toggleDrawer(true)}>
        <IoMenu style={{ fontSize: "40px" }} />
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
