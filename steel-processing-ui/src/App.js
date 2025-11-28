import React, { useState } from "react";
import Login from "./components/Login";
import FileUpload from "./components/FileUpload";
import VersionSelector from "./components/VersionSelector";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
    palette: {
        primary: {
            main: "#667eea",
        },
        secondary: {
            main: "#764ba2",
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

function App() {
    const [credentials, setCredentials] = useState(null);
    const [dbCreated, setDbCreated] = useState(null);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {!credentials && <Login onLogin={setCredentials} />}
            {credentials && !dbCreated && (
                <FileUpload credentials={credentials} onDBCreated={setDbCreated} />
            )}
            {credentials && dbCreated && (
                <VersionSelector credentials={credentials} />
            )}
        </ThemeProvider>
    );
}

export default App;