import axios from 'axios';

const API_URL = 'http://localhost:5000/api/movements';

const getMovements = async (token, page = 1) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}?pageNumber=${page}`, config);
    return response.data;
};

const movementService = {
    getMovements,
};

export default movementService;
