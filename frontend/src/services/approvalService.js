import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/approvals';

const getRequests = async (token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const handleRequest = async (token, id, status, adminResponse) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.put(`${API_URL}/${id}`, { status, adminResponse }, config);
    return response.data;
};

const approvalService = {
    getRequests,
    handleRequest,
};

export default approvalService;
