import React, { useState } from "react";
import {
    Button,
    TextField,
    Typography,
    Box,
    Container,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    InputAdornment,
    Collapse,
    Stack,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    Info,
    CheckCircle,
    Storage,
} from "@mui/icons-material";
import { healthCheck, getVersions } from "../api/api";

const Login = ({ onLogin, onSkipToVersionSelector }) => {
    const [server, setServer] = useState("localhost,1433");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [existingDatabases, setExistingDatabases] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setExistingDatabases(null);

        try {
            // First, test the connection
            await healthCheck(server, username, password);

            // If connection is successful, check for existing databases
            const response = await getVersions(server, username, password);
            const databases = response.data || [];

            // Store credentials
            const credentials = { server, username, password };

            if (databases.length > 0) {
                // Databases exist - show option to skip or upload
                setExistingDatabases(databases);
                setLoading(false);
            } else {
                // No databases - proceed to upload
                onLogin(credentials);
            }
        } catch (err) {
            setLoading(false);
            setError(
                err.response?.data?.detail ||
                err.message ||
                "Failed to connect to server. Please check your credentials."
            );
        }
    };

    const handleTestConnection = async () => {
        if (!server || !username || !password) {
            setError("Please fill in all fields before testing connection");
            return;
        }

        setError("");
        setTestingConnection(true);

        try {
            await healthCheck(server, username, password);
            setError("");
            alert("✅ Connection successful!");
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                err.message ||
                "Connection failed. Please check your credentials."
            );
        } finally {
            setTestingConnection(false);
        }
    };

    const handleProceedToUpload = () => {
        const credentials = { server, username, password };
        onLogin(credentials);
    };

    const handleSkipToVersionSelector = () => {
        const credentials = { server, username, password };
        onSkipToVersionSelector(credentials);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={24}
                    sx={{
                        padding: 4,
                        borderRadius: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Storage
                            sx={{
                                fontSize: 60,
                                color: "#667eea",
                                mb: 2,
                            }}
                        />
                        <Typography
                            variant="h4"
                            gutterBottom
                            sx={{
                                fontWeight: 700,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Steel Processing System
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Connect to your SQL Server database
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert
                            severity="error"
                            onClose={() => setError("")}
                            sx={{ mb: 3 }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Database Found Section */}
                    {existingDatabases && existingDatabases.length > 0 && (
                        <Alert
                            severity="success"
                            icon={<CheckCircle />}
                            sx={{ mb: 3 }}
                        >
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Found {existingDatabases.length} existing database(s)
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                You can skip the upload step and work with existing databases,
                                or upload a new database.
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleSkipToVersionSelector}
                                    sx={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        textTransform: "none",
                                    }}
                                >
                                    Use Existing Databases
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleProceedToUpload}
                                    sx={{ textTransform: "none" }}
                                >
                                    Upload New Database
                                </Button>
                            </Stack>
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {/* Server Field */}
                            <TextField
                                fullWidth
                                label="Server Address"
                                value={server}
                                onChange={(e) => setServer(e.target.value)}
                                placeholder="localhost,1433"
                                required
                                disabled={loading || existingDatabases !== null}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowInfo(!showInfo)}
                                                edge="end"
                                            >
                                                <Info />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Username Field */}
                            <TextField
                                fullWidth
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="sa"
                                required
                                disabled={loading || existingDatabases !== null}
                            />

                            {/* Password Field */}
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading || existingDatabases !== null}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Info Panel */}
                            <Collapse in={showInfo}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: "#f5f5f5",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Connection Information
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Server:</strong> SQL Server address and port
                                        <br />
                                        Example: localhost,1433 or 192.168.1.100,1433
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Username:</strong> SQL Server login username
                                        <br />
                                        Typically: sa or your SQL Server user
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Password:</strong> Your SQL Server password
                                    </Typography>
                                </Paper>
                            </Collapse>

                            {/* Action Buttons */}
                            {!existingDatabases && (
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleTestConnection}
                                        disabled={loading || testingConnection}
                                        sx={{ textTransform: "none" }}
                                    >
                                        {testingConnection ? (
                                            <>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Testing...
                                            </>
                                        ) : (
                                            "Test Connection"
                                        )}
                                    </Button>

                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            textTransform: "none",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <CircularProgress
                                                    size={20}
                                                    sx={{ mr: 1, color: "white" }}
                                                />
                                                Connecting...
                                            </>
                                        ) : (
                                            "Connect"
                                        )}
                                    </Button>
                                </Stack>
                            )}

                            {/* Reset Button (when databases found) */}
                            {existingDatabases && (
                                <Button
                                    fullWidth
                                    variant="text"
                                    onClick={() => {
                                        setExistingDatabases(null);
                                        setServer("");
                                        setUsername("");
                                        setPassword("");
                                    }}
                                    sx={{ textTransform: "none" }}
                                >
                                    Use Different Credentials
                                </Button>
                            )}
                        </Stack>
                    </form>

                    {/* Footer Info */}
                    <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e0e0e0" }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            align="center"
                            display="block"
                        >
                            {existingDatabases && existingDatabases.length > 0 ? (
                                <>
                                    ✨ {existingDatabases.length} database(s) ready to use
                                </>
                            ) : (
                                <>
                                    🔒 Your credentials are used only for this session
                                </>
                            )}
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;