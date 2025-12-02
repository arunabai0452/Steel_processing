import React, { useState } from "react";
import Login from "./components/Login";
import FileUpload from "./components/FileUpload";
import VersionSelector from "./components/VersionSelector";

function App() {
    const [currentStep, setCurrentStep] = useState("login"); // login, upload, version-selector
    const [credentials, setCredentials] = useState(null);

    // Handle login - proceed to upload page
    const handleLogin = (creds) => {
        setCredentials(creds);
        setCurrentStep("upload");
    };

    // Handle skip to version selector - skip upload page
    const handleSkipToVersionSelector = (creds) => {
        setCredentials(creds);
        setCurrentStep("version-selector");
    };

    // Handle upload success - move to version selector
    const handleUploadSuccess = () => {
        setCurrentStep("version-selector");
    };

    // Handle logout / back to login
    const handleLogout = () => {
        setCredentials(null);
        setCurrentStep("login");
    };

    return (
        <div className="App">
            {currentStep === "login" && (
                <Login
                    onLogin={handleLogin}
                    onSkipToVersionSelector={handleSkipToVersionSelector}
                />
            )}

            {currentStep === "upload" && credentials && (
                <FileUpload
                    credentials={credentials}
                    onUploadSuccess={handleUploadSuccess}
                    onSkipToVersionSelector={() => handleSkipToVersionSelector(credentials)}
                />
            )}

            {currentStep === "version-selector" && credentials && (
                <VersionSelector
                    credentials={credentials}
                />
            )}
        </div>
    );
}

export default App;