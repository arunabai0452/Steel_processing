import axios from "axios";

const API_BASE_URL = "http://0.0.0.0:8000/";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const restoreDB = async (server, username, password, file) => {
    const formData = new FormData();
    formData.append("server", server);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("bacpac", file);

    return api.post("/restore-db", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const getVersions = (server, username, password) => {
    return api.post("/versions", {
        server,
        username,
        password,
    });
};

export const processDB = (dbName, referenceDb, server, username, password, location = "250") => {
    return api.post("/process-db", {
        db_name: dbName,
        reference_db: referenceDb,
        server,
        username,
        password,
        location: location, // Add location parameter
    });
};

export const deleteDatabase = (dbName, server, username, password) => {
    return api.post("/delete-db", {
        db_name: dbName,
        server,
        username,
        password,
    });
};

export const downloadFile = (fileNameOrUrl) => {
    // Build the complete download URL
    // Handle cases: "file.xlsx", "/download/file.xlsx", or "download/file.xlsx"
    
    let downloadPath;
    
    if (fileNameOrUrl.includes('/download/')) {
        // Already has /download/ in it, extract just the path
        downloadPath = fileNameOrUrl.startsWith('/') ? fileNameOrUrl : `/${fileNameOrUrl}`;
    } else {
        // Just a filename, construct the full path
        downloadPath = `/download/${fileNameOrUrl}`;
    }
    
    // Construct final URL (ensure no double slashes)
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const url = `${baseUrl}${downloadPath}`;
    
    console.log('Download URL:', url); // Debug log
    window.open(url, '_blank');
};

export const healthCheck = (server, username, password) => {
    return api.post("/health", {
        server,
        username,
        password,
    });
};

export default api;