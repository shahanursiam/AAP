import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import invoiceService from '../services/invoiceService';
import { Button } from '../components/ui/Button';
import { Printer, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export function InvoiceDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            setLoading(true);
            try {
                const data = await invoiceService.getInvoiceById(user.token, id);
                setInvoice(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id, user.token]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center">Loading Invoice...</div>;
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="print:hidden flex justify-between items-center">
                <Link to="/invoices">
                    <Button variant="ghost">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Invoices
                    </Button>
                </Link>
                <div className="flex gap-2">
                    {invoice.status === 'Pending' && user.role === 'admin' && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={async () => {
                            if (window.confirm('Approve Invoice? This will deduct stock.')) {
                                try {
                                    await invoiceService.approveInvoice(user.token, invoice._id);
                                    window.location.reload();
                                } catch (e) { alert(e.response?.data?.message || 'Error approving'); }
                            }
                        }}>
                            Approve & Deduct Stock
                        </Button>
                    )}
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Print Challan
                    </Button>
                </div>
            </div>

            {/* Print Area */}
            <Card className="print:shadow-none print:border-none">
                <CardContent className="p-8 md:p-12 print:p-0">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">AAP</h1>
                            <p className="text-gray-500 mt-1">Sample Management System</p>
                            <div className="mt-4 text-sm text-gray-600">
                                <p className="font-bold">From:</p>
                                <p>{invoice.sourceLocation?.name || 'Head Office'}</p>
                                <p>{invoice.sourceLocation?.address}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Delivery Challan</h2>
                            <p className="text-indigo-600 font-mono font-bold text-lg mt-2">{invoice.invoiceNo}</p>
                            <p className="text-gray-500 text-sm mt-1">Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
                            <p className="text-gray-500 text-sm mt-1 font-medium">Type: {invoice.invoiceType || 'Non-returnable'}</p>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 ${invoice.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                }`}>
                                {invoice.status}
                            </div>
                        </div>
                    </div>

                    {/* Recipient */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg print:bg-transparent print:p-0">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Ship To:</p>
                        <h3 className="text-xl font-bold text-gray-900">{invoice.recipientName || invoice.toLocation?.name || 'External'}</h3>
                        {invoice.toLocation && (
                            <p className="text-gray-600">{invoice.toLocation.address}</p>
                        )}
                        <p className="text-gray-400 text-sm mt-1">{invoice.toLocation?.type || 'Direct Delivery'}</p>
                    </div>

                    {/* Table */}
                    <table className="w-full text-sm text-left mb-8">
                        <thead className="text-xs text-gray-500 uppercase border-b-2 border-gray-200">
                            <tr>
                                <th className="py-3 font-bold">#</th>
                                <th className="py-3 font-bold">Item & Description</th>
                                <th className="py-3 font-bold">SKU / Style</th>
                                <th className="py-3 font-bold text-right">Qty</th>
                                <th className="py-3 font-bold pl-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-gray-500 w-10">{index + 1}</td>
                                    <td className="py-4">
                                        <p className="font-bold text-gray-900">{item.sample.name}</p>
                                        <p className="text-gray-500 text-xs">{item.sample.color} {item.sample.size && `- ${item.sample.size}`}</p>
                                    </td>
                                    <td className="py-4 font-mono text-gray-600">
                                        <p>{item.sample.sku}</p>
                                        <p className="text-xs">{item.sample.styleNo}</p>
                                    </td>
                                    <td className="py-4 text-right font-bold text-gray-900 w-24">
                                        {item.quantity}
                                    </td>
                                    <td className="py-4 pl-4 text-gray-500 text-xs italic w-48">
                                        {item.notes}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-200">
                            <tr>
                                <td colSpan="3" className="py-4 text-right font-bold text-gray-900 uppercase">Total Quantity</td>
                                <td className="py-4 text-right font-bold text-xl text-indigo-600">{invoice.totalQuantity}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer / Remarks */}
                    <div className="mb-12">
                        <p className="font-bold text-gray-900 text-sm">Remarks:</p>
                        <p className="text-gray-600 italic border px-3 py-2 rounded mt-1 bg-gray-50 print:bg-transparent print:border-none print:p-0">
                            {invoice.remarks || 'No additional remarks.'}
                        </p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 mt-20 pt-8 border-t border-gray-100 print:mt-32">
                        <div className="text-center">
                            <div className="border-t border-gray-300 w-32 mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500 uppercase">Authorized Signature</p>
                            <p className="text-sm font-bold mt-1">{invoice.createdBy.name}</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-gray-300 w-32 mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500 uppercase">Receiver Signature</p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-400 mt-12 print:fixed print:bottom-4 print:left-0 print:w-full">
                        Generated by AAP Sample System on {new Date().toLocaleString()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
