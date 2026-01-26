import axios from 'axios';

const API_URL = 'http://localhost:5000/api/inventory';

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
