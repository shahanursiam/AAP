import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/locations';

const getLocations = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const createLocation = async (token, locationData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, locationData, config);
    return response.data;
};

const updateLocation = async (token, id, locationData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/${id}`, locationData, config);
    return response.data;
};

const deleteLocation = async (token, id) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const locationService = {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
};

export default locationService;
