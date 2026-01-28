import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import approvalService from '../services/approvalService';
import invoiceService from '../services/invoiceService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export function ApprovalDashboard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const data = await approvalService.getRequests(user.token);
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.role === 'admin') {
            fetchRequests();
        }
    }, [user]);

    const handleAction = async (id, status, type) => {
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;

        try {
            if (type === 'INVOICE_APPROVAL') {
                if (status === 'APPROVED') {
                    await invoiceService.approveInvoice(user.token, id);
                } else {
                    await invoiceService.rejectInvoice(user.token, id);
                }
            } else {
                // Default: SAMPLE_APPROVAL
                await approvalService.handleRequest(user.token, id, status, status === 'REJECTED' ? 'Rejected by Admin' : 'Approved');
            }
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing request');
        }
    };

    if (user.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>

            {loading ? (
                <p>Loading...</p>
            ) : requests.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-500">No pending requests</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <Card key={req._id} className="overflow-hidden">
                            <CardContent className="p-6">
                                {req.type === 'INVOICE_APPROVAL' ? (
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">
                                                    INVOICE
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(req.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                Invoice #{req.invoiceNo}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Requested by: <span className="font-medium text-indigo-600">{req.createdBy?.name}</span>
                                            </p>
                                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                <p><span className="font-semibold">Recipient:</span> {req.toLocation?.name || req.recipientName || 'Unknown'}</p>
                                                <p><span className="font-semibold">Type:</span> {req.invoiceType}</p>
                                                <p><span className="font-semibold">Total Items:</span> {req.totalQuantity}</p>
                                                {req.remarks && <p><span className="font-semibold">Remarks:</span> {req.remarks}</p>}
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col gap-2 justify-center">
                                            <Button
                                                onClick={() => handleAction(req._id, 'APPROVED', 'INVOICE_APPROVAL')}
                                                className="bg-green-600 hover:bg-green-700 w-full md:w-32"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(req._id, 'REJECTED', 'INVOICE_APPROVAL')}
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50 w-full md:w-32"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // SAMPLE APPROVAL
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.action === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {req.action}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(req.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                Sample: {req.sample?.name} ({req.sample?.sku})
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Requested by: <span className="font-medium text-indigo-600">{req.merchandiser?.name}</span>
                                            </p>

                                            {req.action === 'UPDATE' && (
                                                <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono text-gray-700 max-h-40 overflow-y-auto">
                                                    <pre>{JSON.stringify(req.data, null, 2)}</pre>
                                                </div>
                                            )}
                                            {req.action === 'DELETE' && (
                                                <p className="text-red-600 text-sm italic">Request to permanently delete this sample.</p>
                                            )}
                                        </div>

                                        <div className="flex md:flex-col gap-2 justify-center">
                                            <Button
                                                onClick={() => handleAction(req._id, 'APPROVED', 'SAMPLE_APPROVAL')}
                                                className="bg-green-600 hover:bg-green-700 w-full md:w-32"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(req._id, 'REJECTED', 'SAMPLE_APPROVAL')}
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50 w-full md:w-32"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
