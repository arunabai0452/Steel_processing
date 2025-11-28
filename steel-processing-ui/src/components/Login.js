import React, { useState } from "react";
import {
    Button,
    TextField,
    Container,
    Typography,
    Paper,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, Storage } from "@mui/icons-material";
import { healthCheck } from "../api/api";

const Login = ({ onLogin }) => {
    const [server, setServer] = useState("localhost,1433");
    const [username, setUsername] = useState("sa");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!server || !username || !password) {
            setError("All fields are required");
            return;
        }

        setLoading(true);
        try {
            // Test connection with health check
            await healthCheck(server, username, password);
            // If successful, pass credentials to parent
            onLogin({ server, username, password });
        } catch (err) {
            console.error("Health check error:", err);
            const errorMsg = err.response?.data?.detail || 
                           "Failed to connect to server. Please check your credentials.";
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
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
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Storage sx={{ fontSize: 60, color: "#667eea", mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Steel Processing
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Database Management System
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Server"
                            margin="normal"
                            value={server}
                            onChange={(e) => setServer(e.target.value)}
                            placeholder="localhost,1433"
                            variant="outlined"
                            disabled={loading}
                            autoComplete="off"
                        />
                        <TextField
                            fullWidth
                            label="Username"
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="sa"
                            variant="outlined"
                            disabled={loading}
                            autoComplete="username"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            margin="normal"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                            disabled={loading}
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            disabled={loading}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                fontWeight: "bold",
                                fontSize: "1rem",
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Connect"}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;