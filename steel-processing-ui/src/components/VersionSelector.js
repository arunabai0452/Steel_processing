import React, { useEffect, useState } from "react";
import {
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    Box,
    Container,
    CircularProgress,
    Alert,
    Chip,
    Stack,
} from "@mui/material";
import {
    Download,
    CloudQueue,
    CheckCircle,
    Refresh,
} from "@mui/icons-material";
import { getVersions, processDB, downloadFile } from "../api/api";

const VersionSelector = ({ credentials }) => {
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        loadVersions();
    }, []);

    const loadVersions = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getVersions(
                credentials.server,
                credentials.username,
                credentials.password
            );
            setVersions(res.data);
            if (res.data.length > 0) {
                setSelectedVersion(res.data[0]);
            }
        } catch (err) {
            setError("Failed to load database versions");
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async () => {
        if (!selectedVersion) {
            setError("Please select a database version");
            return;
        }

        setProcessing(true);
        setError("");
        setDownloadUrl("");

        try {
            const response = await processDB(
                selectedVersion,
                "MasterDataDB",
                credentials.server,
                credentials.username,
                credentials.password
            );
            setDownloadUrl(response.data.download_url);
            setFileName(response.data.file_name);
        } catch (err) {
            setError(
                err.response?.data?.detail?.message ||
                    err.response?.data?.detail ||
                    "Failed to process database"
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (fileName) {
            downloadFile(fileName);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                py: 4,
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
                        Process Database
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        textAlign="center"
                        mb={4}
                    >
                        Select a database version to generate Excel report
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            mb={2}
                        >
                            <FormControl fullWidth>
                                <InputLabel>Database Version</InputLabel>
                                <Select
                                    value={selectedVersion}
                                    onChange={(e) => setSelectedVersion(e.target.value)}
                                    label="Database Version"
                                    disabled={loading || processing}
                                >
                                    {versions.map((v) => (
                                        <MenuItem key={v} value={v}>
                                            {v}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                onClick={loadVersions}
                                disabled={loading}
                                sx={{ minWidth: "auto", px: 2 }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <Refresh />
                                )}
                            </Button>
                        </Stack>

                        {versions.length === 0 && !loading && (
                            <Alert severity="info">
                                No database versions found. Please upload a database first.
                            </Alert>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <CloudQueue />}
                        onClick={handleProcess}
                        disabled={!selectedVersion || processing || loading}
                        sx={{
                            py: 1.5,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            mb: 2,
                        }}
                    >
                        {processing ? "Processing..." : "Process Database"}
                    </Button>

                    {downloadUrl && (
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                mt: 3,
                                background: "linear-gradient(135deg, #e0f7fa 0%, #e1bee7 100%)",
                                borderRadius: 2,
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                                mb={2}
                            >
                                <CheckCircle color="success" fontSize="large" />
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Processing Complete!
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Your Excel file is ready to download
                                    </Typography>
                                </Box>
                            </Stack>

                            {fileName && (
                                <Chip
                                    label={fileName}
                                    color="primary"
                                    sx={{ mb: 2 }}
                                />
                            )}

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<Download />}
                                onClick={handleDownload}
                                sx={{
                                    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                                    fontWeight: "bold",
                                }}
                            >
                                Download Excel File
                            </Button>
                        </Paper>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default VersionSelector;