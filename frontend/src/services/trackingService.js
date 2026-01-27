import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tracking';

const createContainer = async (token, type, containerId) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(`${API_URL}/containers`, { type, containerId }, config);
    return response.data;
};

const addItemToContainer = async (token, containerId, sampleSku, quantity, sourceSampleId = null) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(`${API_URL}/add-item`, { 
        containerId, 
        sampleSku, 
        quantity,
        sourceSampleId // Optional: ID for strict deduction
    }, config);
    return response.data;
};

const getContainerDetails = async (token, containerId) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/containers/${containerId}`, config);
    return response.data;
};

const trackingService = {
    createContainer,
    addItemToContainer,
    getContainerDetails
};

export default trackingService;
