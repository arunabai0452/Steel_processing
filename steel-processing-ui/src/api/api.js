import axios from "axios";

const API_BASE_URL = " https://difficile-convalescently-edelmira.ngrok-free.dev";

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

export const processDB = (dbName, referenceDb, server, username, password) => {
    return api.post("/process-db", {
        db_name: dbName,
        reference_db: referenceDb,
        server,
        username,
        password,
    });
};

export const downloadFile = (fileName) => {
    const url = `${API_BASE_URL}/download/${fileName}`;
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