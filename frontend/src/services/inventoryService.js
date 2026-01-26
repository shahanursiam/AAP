import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/inventory';

const getInventorySummary = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/summary`, config);
    return response.data;
};

const inventoryService = {
    getInventorySummary,
};

export default inventoryService;
