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
    Stack,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from "@mui/material";
import { 
    CloudUpload, 
    CheckCircle, 
    InsertDriveFile,
    Info,
    Timer,
    Storage as StorageIcon,
} from "@mui/icons-material";
import { restoreDB } from "../api/api";

const FileUpload = ({ credentials, onUploadSuccess, onSkipToVersionSelector }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (selectedFile) => {
        if (selectedFile) {
            if (!selectedFile.name.endsWith(".bacpac")) {
                setError("Please select a .bacpac file");
                return;
            }
            
            // Check file size (warn if > 500MB)
            const maxSize = 500 * 1024 * 1024; // 500MB
            if (selectedFile.size > maxSize) {
                setError(`File size exceeds 500MB. Large files may take longer to upload.`);
            }
            
            setFile(selectedFile);
            setError("");
        }
    };

    const handleInputChange = (e) => {
        const selectedFile = e.target.files[0];
        handleFileChange(selectedFile);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
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
                onUploadSuccess();
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            setError(err.response?.data?.detail || "Failed to restore database");
            setProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        sx={{
                            border: dragActive ? "3px solid #667eea" : "2px dashed #667eea",
                            borderRadius: 2,
                            p: 4,
                            textAlign: "center",
                            backgroundColor: file ? "#f0f4ff" : dragActive ? "#e8f0ff" : "#fafafa",
                            transition: "all 0.3s",
                            cursor: loading ? "not-allowed" : "pointer",
                            "&:hover": {
                                backgroundColor: loading ? "#fafafa" : "#f0f4ff",
                                borderColor: "#764ba2",
                            },
                        }}
                    >
                        <input
                            accept=".bacpac"
                            style={{ display: "none" }}
                            id="file-upload"
                            type="file"
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        
                        {!file ? (
                            <>
                                <CloudUpload sx={{ fontSize: 60, color: "#667eea", mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Drag & Drop your .bacpac file here
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    or
                                </Typography>
                                <label htmlFor="file-upload">
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        startIcon={<InsertDriveFile />}
                                        size="large"
                                        disabled={loading}
                                    >
                                        Browse Files
                                    </Button>
                                </label>
                            </>
                        ) : (
                            <Box>
                                <CheckCircle sx={{ fontSize: 60, color: "#4caf50", mb: 2 }} />
                                <Chip
                                    icon={<InsertDriveFile />}
                                    label={file.name}
                                    color="primary"
                                    sx={{ fontSize: "1rem", py: 2.5, px: 1, mb: 2 }}
                                />
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Size: {formatFileSize(file.size)}
                                </Typography>
                                <label htmlFor="file-upload">
                                    <Button
                                        component="span"
                                        variant="text"
                                        size="small"
                                        disabled={loading}
                                    >
                                        Change File
                                    </Button>
                                </label>
                            </Box>
                        )}
                    </Box>

                    {/* Upload Information */}
                    <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: "#f5f5f5" }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <Info color="primary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">
                                What happens during upload:
                            </Typography>
                        </Stack>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <StorageIcon fontSize="small" color="action" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Database will be automatically named with timestamp"
                                    secondary="Format: SteelProcessing_YYYYMMDD_HHMMSS"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Timer fontSize="small" color="action" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Restore process may take several minutes"
                                    secondary="Larger files require more time"
                                />
                            </ListItem>
                        </List>
                    </Paper>

                    {loading && (
                        <Box sx={{ mt: 3 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ 
                                    height: 10, 
                                    borderRadius: 5,
                                    bgcolor: "#e0e0e0",
                                    "& .MuiLinearProgress-bar": {
                                        background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                                    }
                                }}
                            />
                            <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                textAlign="center"
                                mt={1}
                            >
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
                        startIcon={loading ? null : <CloudUpload />}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            "&:hover": {
                                background: "linear-gradient(135deg, #5568d3 0%, #653a8b 100%)",
                            },
                        }}
                    >
                        {loading ? `Restoring... ${progress}%` : "Restore Database"}
                    </Button>

                    {/* Skip button - only show if callback is provided */}
                    {onSkipToVersionSelector && (
                        <Button
                            variant="text"
                            fullWidth
                            size="large"
                            onClick={onSkipToVersionSelector}
                            disabled={loading}
                            sx={{
                                mt: 2,
                                textTransform: "none",
                                color: "#667eea",
                            }}
                        >
                            Skip and use existing databases
                        </Button>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default FileUpload;