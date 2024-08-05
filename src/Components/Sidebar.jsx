import * as React from "react";
import { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  ListItemIcon,
} from "@mui/material";
import { Link } from "react-router-dom";
import defaultLogo from "./zenAssist.png";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ChatIcon from "@mui/icons-material/Chat";
import SettingsIcon from '@mui/icons-material/Settings';
const drawerWidth = 240;



function Sidebar() {
  const [userLogo, setUserLogo] = useState(null);
  const [botName, setBotName] = useState("");
  const [brandColor, setBrandColor] = useState("");
  useEffect(() => {
    const savedLogo = localStorage.getItem("logo");
    const savedBotName = localStorage.getItem("botName");
    const savedBrandColor = localStorage.getItem("brandColor");
    
    if (savedLogo) setUserLogo(savedLogo);
    if (savedBotName) setBotName(savedBotName);
    if (savedBrandColor) setBrandColor(savedBrandColor);
  }, []);

  return (
    <Box
      sx={{
        margin: "20px 0", // Apply margin to the top and bottom of the Box
      }}
    >
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#e9e8ec", // Same background color as the app
            // borderRadius: "15px",
            paddingTop: "20px", // Padding on top
            paddingBottom: "20px", // Padding on bottom
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <div
          style={{
            padding: "16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={userLogo ? userLogo : defaultLogo}
            alt="Logo"
            style={{ marginRight: "10px", width: "40px", height: "40px" }}
          />
          {botName && <span>{botName}</span>}
          {!botName && <span>ZenAssist</span>}
        </div>
        <List>
        <ListItem
            button
            component={Link}
            sx={{
              "&:hover .MuiListItemText-primary": {
                color: "black",
              },
            }}
            to="/customize"
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Customize Bot" />
          </ListItem>
          <ListItem
            button
            component={Link}
            sx={{
              "&:hover .MuiListItemText-primary": {
                color: "black",
              },
            }}
            to="/upload"
          >
            <ListItemIcon>
              <UploadFileIcon />
            </ListItemIcon>
            <ListItemText primary="Upload Document" />
          </ListItem>
          <ListItem
            button
            component={Link}
            sx={{
              "&:hover .MuiListItemText-primary": {
                color: "black",
              },
            }}
            to="/chat"
          >
            <ListItemIcon>
              <ChatIcon />
            </ListItemIcon>
            <ListItemText primary="Chat" />
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}

export default Sidebar;
