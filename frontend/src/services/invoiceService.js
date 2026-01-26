import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/invoices';

const getInvoices = async (token, page = 1) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}?pageNumber=${page}`, config);
    return response.data;
};

const getInvoiceById = async (token, id) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data;
};

const createInvoice = async (token, invoiceData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, invoiceData, config);
    return response.data;
};

const invoiceService = {
    getInvoices,
    getInvoiceById,
    createInvoice
};

export default invoiceService;
