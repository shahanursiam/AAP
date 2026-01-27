import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import invoiceService from '../services/invoiceService';
import { Button } from '../components/ui/Button';
import { Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';


// Mapping for SKU Prefixes to Buyer Names
const BUYER_PREFIX_MAP = {
    'SMP': 'AAP', // specific mapping for SMP prefix
    // Add other mappings here as needed
};

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

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!invoice) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
            <p className="text-lg">Invoice not found</p>
            <Link to="/invoices">
                <Button variant="ghost" className="mt-4">Go Back</Button>
            </Link>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 print:max-w-none print:w-full print:pb-0">
            {/* Action Bar - Hidden on Print */}
            <div className="print:hidden flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <Link to="/invoices">
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                    </Button>
                </Link>
                <div className="flex gap-3">
                    {invoice.status === 'Pending' && user.role === 'admin' && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all"
                            onClick={async () => {
                                if (window.confirm('Approve Invoice? This will deduct stock.')) {
                                    try {
                                        await invoiceService.approveInvoice(user.token, invoice._id);
                                        window.location.reload();
                                    } catch (e) { alert(e.response?.data?.message || 'Error approving'); }
                                }
                            }}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </Button>
                    )}
                    <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                        <Printer className="w-4 h-4 mr-2" /> Print Invoice
                    </Button>
                </div>
            </div>

            {/* Print Area */}
            <div className="bg-white print:shadow-none print:w-full">
                <div className="p-8 print:p-0">

                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-2 mb-2">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">AAP</h1>
                            </div>
                            <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">Sample Management System</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-indigo-900 uppercase tracking-widest mb-1">Delivery Challan</h2>
                            <p className="text-gray-400 text-sm">Original Copy</p>
                        </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-6 mb-4 p-6 bg-gray-50 rounded-xl print:bg-gray-50 print:border print:border-gray-100">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Invoice No</p>
                            <p className="text-lg font-mono font-bold text-gray-900">{invoice.invoiceNo}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date Issued</p>
                            <p className="text-base font-medium text-gray-900">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</p>
                            <p className="text-base font-medium text-gray-900 capitalize">{invoice.invoiceType || 'Standard'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
                                ${invoice.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-12">
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">From (Sender)</h3>
                            <p className="font-bold text-gray-900 text-lg">{invoice.sourceLocation?.name || 'Head Office'}</p>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{invoice.sourceLocation?.address || 'N/A'}</p>
                            <p className="text-sm text-indigo-600 mt-2">{invoice.sourceLocation?.type}</p>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">Customer Name</h3>
                            <p className="font-bold text-gray-900 text-lg">{invoice.recipientName || invoice.toLocation?.name}</p>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{invoice.toLocation?.address || 'External Address'}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="h-12 print:h-8 border-none" aria-hidden="true">
                                    <th colSpan="7" className="p-0 border-none"></th>
                                </tr>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider w-12">#</th>
                                    <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider">Item Details</th>
                                    <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider">SKU</th>
                                    <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider">Style No</th>
                                    <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider">Buyer</th>
                                    <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider text-right w-24">Qty</th>
                                    <th className="py-3 px-2 text-xs font-bold text-gray-900 uppercase tracking-wider pl-6 w-1/3">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {invoice.items.map((item, index) => (
                                    <tr key={index} className="group hover:bg-gray-50 print:hover:bg-transparent">
                                        <td className="py-2 px-2 text-gray-500 text-sm align-top">{index + 1}</td>
                                        <td className="py-2 px-2 align-top">
                                            <p className="text-xs font-bold text-gray-900">{item.sample.name}</p>
                                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Size: {item.sample.size || 'N/A'}</span>
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Color: {item.sample.color || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 align-top text-sm">
                                            <p className="font-mono text-gray-700">{item.sample.sku}</p>
                                        </td>
                                        <td className="py-2 px-2 align-top text-sm">
                                            <p className="text-gray-900">{item.sample.styleNo || '-'}</p>
                                        </td>
                                        <td className="py-2 px-2 align-top text-sm">
                                            <p className="text-gray-900">
                                                {item.sample.buyer || BUYER_PREFIX_MAP[item.sample.sku?.split('-')[0]] || item.sample.sku?.split('-')[0]}
                                            </p>
                                        </td>
                                        <td className="py-2 px-2 text-right font-bold text-gray-900 align-top">
                                            {item.quantity}
                                        </td>
                                        <td className="py-2 px-2 pl-6 text-gray-500 text-sm italic align-top">
                                            {item.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary & Remarks */}
                    <div className="flex flex-row justify-between items-start gap-8 border-t border-gray-200 pt-8">
                        <div className="w-full md:w-2/3">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Remarks / Instructions</h4>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 italic border border-gray-100 print:bg-white print:border-gray-200 print:p-2">
                                {invoice.remarks || 'No additional remarks provided for this shipment.'}
                            </div>
                        </div>
                        <div className="w-full md:w-1/3">
                            <div className="flex justify-around items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Total Items</span>
                                <span className="text-gray-900 font-bold">{invoice.items.length}</span>
                            </div>
                            <div className="flex justify-around items-center py-3">
                                <span className="text-indigo-900 font-bold text-lg">Total Quantity</span>
                                <span className="text-indigo-600 font-bold text-2xl">{invoice.totalQuantity}</span>
                            </div>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-20 mt-24">
                        <div className="text-center">
                            <div className="border-t-2 border-gray-300 w-3/4 mx-auto mb-3"></div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Authorized Signature</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{invoice.createdBy.name}</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-gray-300 w-3/4 mx-auto mb-3"></div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Received By</p>
                            <p className="text-sm text-gray-400 mt-1 italic">(Sign & Date)</p>
                        </div>
                    </div>

                    <div className="mt-16 text-center text-[10px] text-gray-400 uppercase tracking-widest">
                        Values are for internal tracking only • System Generated Document
                    </div>
                </div>
            </div>
        </div>
    );
}
