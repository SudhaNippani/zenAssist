import React, { useState, useEffect } from "react";
import { TextField, Divider, Button } from "@mui/material";

function CustomizeBot() {
  const [logo, setLogo] = useState(null);
  const [botName, setBotName] = useState("");
  const [brandColor, setBrandColor] = useState("");

  useEffect(() => {
    const savedLogo = localStorage.getItem("logo");
    const savedBotName = localStorage.getItem("botName");
    const savedBrandColor = localStorage.getItem("brandColor");
    
    if (savedLogo) setLogo(savedLogo);
    if (savedBotName) setBotName(savedBotName);
    if (savedBrandColor) setBrandColor(savedBrandColor);

    if (savedBotName) {
        document.title = savedBotName;
      }
  
      if (savedLogo) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/svg+xml';
        link.rel = 'icon';
        link.href = savedLogo;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
  }, []);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const logoData = reader.result;
      setLogo(logoData);
      localStorage.setItem("logo", logoData);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleBotNameChange = (event) => {
    const name = event.target.value;
    setBotName(name);
    localStorage.setItem("botName", name);
  };

  const handleBrandColorChange = (event) => {
    const color = event.target.value;
    setBrandColor(color);
    localStorage.setItem("brandColor", color);
  };

  const handleSubmit = () => {
    window.location.reload();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        borderRadius: "15px",
        border: "1px solid black",
      }}
    >
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        {logo && (
          <img
            src={logo}
            alt="Logo"
            style={{ width: "100px", height: "100px", marginBottom: "10px" }}
          />
        )}
        <Button variant="contained" component="label">
          Upload Logo
          <input type="file" hidden onChange={handleLogoUpload} />
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          padding: "20px",
          width: "100%",
        }}
      >
        <div style={{ flex: 1, paddingRight: "20px" }}>
          <TextField
            label="Bot Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={botName}
            onChange={handleBotNameChange}
          />
        </div>
        <Divider orientation="vertical" flexItem />
        <div style={{ flex: 1, paddingLeft: "20px" }}>
          <TextField
            label="Brand Color Hex Code"
            variant="outlined"
            fullWidth
            margin="normal"
            value={brandColor}
            onChange={handleBrandColorChange}
          />
        </div>
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        style={{ marginTop: "20px" }}
      >
        Submit
      </Button>
    </div>
  );
}

export default CustomizeBot;
