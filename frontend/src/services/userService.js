import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/users';

const getMerchandisers = async (token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get(`${API_URL}/merchandisers`, config);
    return response.data;
};

const createMerchandiser = async (token, userData) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.post(API_URL, userData, config);
    return response.data;
};

const updateMerchandiser = async (token, id, userData) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.put(`${API_URL}/${id}`, userData, config);
    return response.data;
};

const deleteMerchandiser = async (token, id) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const userService = {
    getMerchandisers,
    createMerchandiser,
    updateMerchandiser,
    deleteMerchandiser,
};

export default userService;
