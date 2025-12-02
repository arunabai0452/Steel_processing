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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import {
    Download,
    CloudQueue,
    CheckCircle,
    Refresh,
    Delete,
    Warning,
    LocationOn,
} from "@mui/icons-material";
import { getVersions, processDB, downloadFile, deleteDatabase } from "../api/api";

const VersionSelector = ({ credentials }) => {
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("250");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fileName, setFileName] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [dbToDelete, setDbToDelete] = useState("");

    useEffect(() => {
        loadVersions();
    }, []);

    const loadVersions = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await getVersions(
                credentials.server,
                credentials.username,
                credentials.password
            );
            setVersions(res.data);
            if (res.data.length > 0 && !selectedVersion) {
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

        if (!selectedLocation) {
            setError("Please select a location");
            return;
        }

        setProcessing(true);
        setError("");
        setSuccess("");
        setDownloadUrl("");

        try {
            const response = await processDB(
                selectedVersion,
                "MasterDataDB",
                credentials.server,
                credentials.username,
                credentials.password,
                selectedLocation
            );
            setDownloadUrl(response.data.download_url);
            setFileName(response.data.file_name);
            setSuccess(`Successfully processed database for Location ${selectedLocation}`);
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

    const openDeleteDialog = (dbName) => {
        setDbToDelete(dbName);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDbToDelete("");
    };

    const handleDelete = async () => {
        if (!dbToDelete) return;

        setDeleting(true);
        setError("");
        setSuccess("");
        closeDeleteDialog();

        try {
            await deleteDatabase(
                dbToDelete,
                credentials.server,
                credentials.username,
                credentials.password
            );
            setSuccess(`Database "${dbToDelete}" deleted successfully`);
            
            // Refresh the versions list
            await loadVersions();
            
            // Clear selection if deleted database was selected
            if (selectedVersion === dbToDelete) {
                setSelectedVersion("");
                setDownloadUrl("");
            }
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                    "Failed to delete database"
            );
        } finally {
            setDeleting(false);
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
            <Container maxWidth="lg">
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
                        Steel Processing Manager
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        textAlign="center"
                        mb={4}
                    >
                        Select database and location to generate Excel report
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
                            {success}
                        </Alert>
                    )}

                    <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                        {/* Left side - Database Selection and Processing */}
                        <Box sx={{ flex: 1 }}>
                            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Process Database
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    mb={3}
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
                                        disabled={loading || deleting}
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
                                    <Alert severity="info" sx={{ mb: 3 }}>
                                        No database versions found. Please upload a database first.
                                    </Alert>
                                )}

                                {/* Location Selection */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                        Select Location
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={selectedLocation}
                                        exclusive
                                        onChange={(e, newLocation) => {
                                            if (newLocation !== null) {
                                                setSelectedLocation(newLocation);
                                            }
                                        }}
                                        fullWidth
                                        disabled={processing}
                                    >
                                        <ToggleButton value="250" sx={{ py: 1.5 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <LocationOn />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Location 250
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Frame Coil Processing
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </ToggleButton>
                                        <ToggleButton value="255" sx={{ py: 1.5 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <LocationOn />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Location 255
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Frame sheet Processing
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    startIcon={
                                        processing ? (
                                            <CircularProgress size={20} color="inherit" />
                                        ) : (
                                            <CloudQueue />
                                        )
                                    }
                                    onClick={handleProcess}
                                    disabled={!selectedVersion || processing || loading || deleting}
                                    sx={{
                                        py: 1.5,
                                        background:
                                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        fontWeight: "bold",
                                        fontSize: "1rem",
                                    }}
                                >
                                    {processing
                                        ? "Processing..."
                                        : `Generate Report - Location ${selectedLocation}`}
                                </Button>

                                {downloadUrl && (
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            p: 3,
                                            mt: 3,
                                            background:
                                                "linear-gradient(135deg, #e0f7fa 0%, #e1bee7 100%)",
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
                                                    Location {selectedLocation} Excel file ready
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
                                                background:
                                                    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Download Excel File
                                        </Button>
                                    </Paper>
                                )}
                            </Paper>
                        </Box>

                        {/* Right side - Database Management */}
                        <Box sx={{ flex: 1 }}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Database Management
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    {versions.length} database{versions.length !== 1 ? "s" : ""}{" "}
                                    available
                                </Typography>

                                {versions.length > 0 ? (
                                    <List sx={{ maxHeight: 400, overflow: "auto" }}>
                                        {versions.map((version, index) => (
                                            <React.Fragment key={version}>
                                                <ListItem
                                                    sx={{
                                                        borderRadius: 1,
                                                        mb: 1,
                                                        bgcolor:
                                                            selectedVersion === version
                                                                ? "action.selected"
                                                                : "transparent",
                                                        "&:hover": {
                                                            bgcolor: "action.hover",
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={version}
                                                        secondary={`Database ${index + 1}`}
                                                        primaryTypographyProps={{
                                                            fontWeight:
                                                                selectedVersion === version
                                                                    ? "bold"
                                                                    : "normal",
                                                        }}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => openDeleteDialog(version)}
                                                            disabled={deleting || processing}
                                                            color="error"
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                {index < versions.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                ) : (
                                    <Alert severity="info">
                                        No databases to manage. Upload a .bacpac file to get started.
                                    </Alert>
                                )}
                            </Paper>
                        </Box>
                    </Stack>
                </Paper>
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Warning color="warning" />
                        <span>Confirm Database Deletion</span>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the database{" "}
                        <strong>{dbToDelete}</strong>?
                    </DialogContentText>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        This action cannot be undone. All data in this database will be
                        permanently removed.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={closeDeleteDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                    >
                        Delete Database
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VersionSelector;