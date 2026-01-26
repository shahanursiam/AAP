import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import invoiceService from '../services/invoiceService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, FileText, Calendar, ArrowRight, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function InvoiceList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const data = await invoiceService.getInvoices(user.token, page);
                setInvoices(data.invoices);
                setPage(data.page);
                setTotalPages(data.pages);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, [page, user.token]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices / Challans</h1>
                    <p className="text-sm text-gray-500">History of all bulk transfers and delivery notes.</p>
                </div>
                <Link to="/invoices/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Invoice
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-0 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Invoice No</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">To Location</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Created By</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading invoices...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No invoices found.</td></tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-bold text-indigo-600 font-mono">{inv.invoiceNo}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(inv.issueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{inv.toLocation?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold">
                                                {inv.totalQuantity} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{inv.createdBy?.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${inv._id}`)}>
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                            <span className="px-2 py-2 text-sm text-gray-500">Page {page} of {totalPages}</span>
                            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
