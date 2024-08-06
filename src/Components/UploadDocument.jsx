import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";

const CenteredBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

function UploadDocument() {
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const response = await axios.get("${BASE_URL}/uploaded_files");
        if (response.status === 200) {
          setUploadedFiles(response.data.uploaded_files);
        }
      } catch (error) {
        console.error("Error fetching uploaded files", error);
      }
    };

    fetchUploadedFiles();
  }, []);
  const initialGreeting = "Hi, hope you’re having a good day, how can I assist you today?";

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    setUploading(true);
    setStatusMessage("Uploading document(s)...");

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const response = await axios.post(
        "${BASE_URL}/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setUploadedFiles((prevFiles) => [
          ...prevFiles,
          ...Array.from(files).map((file) => file.name),
        ]);
        setStatusMessage("Document(s) uploaded successfully!");
      } else {
        setStatusMessage("Error uploading document(s)");
      }
    } catch (error) {
      setStatusMessage("Error uploading document(s)");
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileName) => {
    try {
      const response = await axios.post("${BASE_URL}/delete", {
        fileName,
      });

      if (response.status === 200) {
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file !== fileName)
        );
        setStatusMessage("File deleted successfully!");
        // await axios.post("http://localhost:5000/train");
      } else {
        setStatusMessage("Error deleting document");
      }
    } catch (error) {
      setStatusMessage("Error deleting document");
    }
  };

  const handleTrainModel = async () => {
    setUploading(true);
    setStatusMessage("Training the model...");
    try {
      const response = await axios.post("${BASE_URL}/train");
      if (response.status === 200) {
        setStatusMessage("Model trained successfully!");
            // Reset chat messages in local storage
            localStorage.setItem('chatMessages', JSON.stringify([{ text: initialGreeting, isQuestion: false }]));
      } else {
        setStatusMessage("Error training the model");
      }
    } catch (error) {
      setStatusMessage("Error training the model");
    } finally {
      setUploading(false);
    }
  };

  return (
    <CenteredBox>
      <Typography variant="h4" gutterBottom>
        Upload FAQ Documents
      </Typography>
      <div style={{ display: 'flex' }}>
        <div style={{ padding: "4px" }}>
          <input
            accept=".doc,.docx,.pdf"
            style={{ display: "none" }}
            id="upload-button-file"
            type="file"
            multiple
            onChange={handleFileUpload}
          />

          <label htmlFor="upload-button-file">
            <Button
              variant="contained"
              component="span"
              style={{ backgroundColor: "#4FAF93" }}
              disabled={uploading}
            >
              Upload Documents
            </Button>
          </label>
        </div>
        <div style={{ padding: "4px" }}>
          <Button
            variant="contained"
            component="span"
            style={{ backgroundColor: "#4FAF93" }}
            onClick={handleTrainModel}
            disabled={uploading}
          >
            Train your bot
          </Button>
        </div>
      </div>
      {uploading && (
        <Box display="flex" alignItems="center" mt={2}>
          <CircularProgress size={24} />
          <Typography variant="body1" ml={2}>
            {statusMessage}
          </Typography>
        </Box>
      )}
      {!uploading && statusMessage && (
        <Typography variant="body1" mt={2}>
          {statusMessage}
        </Typography>
      )}
      <List>
        {uploadedFiles.map((file, index) => (
          <ListItem key={index}>
            <ListItemText primary={file} />
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleFileDelete(file)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </CenteredBox>
  );
}

export default UploadDocument;
