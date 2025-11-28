import React, { useState } from "react";
import {
    Button,
    Typography,
    Paper,
    Box,
    LinearProgress,
    Alert,
    Chip,
    Container,
} from "@mui/material";
import { CloudUpload, CheckCircle } from "@mui/icons-material";
import { restoreDB } from "../api/api";

const FileUpload = ({ credentials, onDBCreated }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith(".bacpac")) {
                setError("Please select a .bacpac file");
                return;
            }
            setFile(selectedFile);
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file");
            return;
        }

        setLoading(true);
        setError("");
        setProgress(0);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 500);

        try {
            const response = await restoreDB(
                credentials.server,
                credentials.username,
                credentials.password,
                file
            );
            setProgress(100);
            setTimeout(() => {
                onDBCreated(response.data.db_name);
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            setError(err.response?.data?.detail || "Failed to restore database");
            setProgress(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={24}
                    sx={{
                        p: 5,
                        borderRadius: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                    }}
                >
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        gutterBottom
                        textAlign="center"
                    >
                        Upload Database Backup
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        textAlign="center"
                        mb={4}
                    >
                        Select a .bacpac file to restore to the server
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        sx={{
                            border: "2px dashed #667eea",
                            borderRadius: 2,
                            p: 4,
                            textAlign: "center",
                            backgroundColor: file ? "#f0f4ff" : "#fafafa",
                            transition: "all 0.3s",
                            "&:hover": {
                                backgroundColor: "#f0f4ff",
                                borderColor: "#764ba2",
                            },
                        }}
                    >
                        <input
                            accept=".bacpac"
                            style={{ display: "none" }}
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        <label htmlFor="file-upload">
                            <Button
                                component="span"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                size="large"
                                disabled={loading}
                                sx={{ mb: 2 }}
                            >
                                Choose File
                            </Button>
                        </label>

                        {file && (
                            <Box mt={2}>
                                <Chip
                                    icon={<CheckCircle />}
                                    label={file.name}
                                    color="primary"
                                    sx={{ fontSize: "1rem", py: 2.5, px: 1 }}
                                />
                                <Typography variant="caption" display="block" mt={1}>
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {loading && (
                        <Box sx={{ mt: 3 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Restoring database... {progress}%
                            </Typography>
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleUpload}
                        disabled={!file || loading}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            fontWeight: "bold",
                            fontSize: "1rem",
                        }}
                    >
                        {loading ? "Restoring..." : "Restore Database"}
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default FileUpload;