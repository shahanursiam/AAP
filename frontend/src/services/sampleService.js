import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/samples';

const getConfig = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const getSamples = async (token, page = 1, keyword = '', locationId = '') => {
    const config = getConfig(token);
    let url = `${API_URL}?pageNumber=${page}&keyword=${keyword}`;
    if (locationId) url += `&locationId=${locationId}`;
    const response = await axios.get(url, config);
    return response.data;
};

const createSample = async (token, sampleData) => {
    const config = getConfig(token);
    const response = await axios.post(API_URL, sampleData, config);
    return response.data;
};

const getSampleById = async (token, id) => {
    const config = getConfig(token);
    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data;
};

const getSampleByBarcode = async (token, barcode) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/lookup/${barcode}`, config);
    return response.data;
};

const updateSample = async (token, id, sampleData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/${id}`, sampleData, config);
    return response.data;
};

const deleteSample = async (token, id) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const getSampleHistory = async (token, id) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${id}/history`, config);
    return response.data;
};

const distributeSample = async (token, id, locationId, notes, quantity, hanger, carton) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/${id}/distribute`, { locationId, notes, quantity, hanger, carton }, config);
    return response.data;
};

const sampleService = {
    getSamples,
    createSample,
    getSampleById,
    getSampleByBarcode,
    updateSample,
    deleteSample,
    getSampleHistory,
    distributeSample
};

export default sampleService;
