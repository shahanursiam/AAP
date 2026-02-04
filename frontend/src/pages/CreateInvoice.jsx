import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import locationService from '../services/locationService';
import sampleService from '../services/sampleService';
import invoiceService from '../services/invoiceService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Plus, Trash2, ArrowRight, Save, Scan, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarcodeScanner } from '../components/common/BarcodeScanner';
import { AnimatePresence } from 'framer-motion';

export function CreateInvoice() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Setup
    const [locations, setLocations] = useState([]);
    const [toLocation, setToLocation] = useState('');
    const [sourceLocation, setSourceLocation] = useState(''); 
    const [recipientName, setRecipientName] = useState(''); 
    const [invoiceType, setInvoiceType] = useState('Non-returnable');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    // Items
    const [items, setItems] = useState([]); 

    // Search / Scan State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        const fetchLocations = async () => {
            const locs = await locationService.getLocations(user.token);
            setLocations(locs);
        };
        fetchLocations();
    }, [user.token]);

    // Search Samples
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.length > 2 && sourceLocation) {
                setIsSearching(true);
                try {
                    // Pass sourceLocation to filter
                    const data = await sampleService.getSamples(user.token, 1, searchTerm, sourceLocation);
                    setSearchResults(data.samples);
                } catch (e) { console.error(e); }
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, sourceLocation, user.token]);

    const handleAddItem = (sample) => {
        // Check if already added
        if (items.find(i => i.sampleId === sample._id)) {
            alert('Item already in list');
            return;
        }

        setItems([...items, {
            sampleId: sample._id,
            name: sample.name,
            sku: sample.sku,
            styleNo: sample.styleNo,
            quantity: 1,
            maxQty: sample.quantity,
            notes: ''
        }]);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleScanSuccess = async (decodedText) => {
        setIsScannerOpen(false);
        try {
            const sample = await sampleService.getSampleByBarcode(user.token, decodedText);
            if (items.find(i => i.sampleId === sample._id)) {
                // Determine increment logic? For now just alert
                alert('Item already in list: ' + sample.name);
            } else {
                setItems([...items, {
                    sampleId: sample._id,
                    name: sample.name,
                    sku: sample.sku,
                    styleNo: sample.styleNo,
                    quantity: 1,
                    maxQty: sample.quantity,
                    notes: ''
                }]);
            }
        } catch (error) {
            alert('Sample not found for barcode: ' + decodedText);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!recipientName) return alert('Enter a destination');
        if (!sourceLocation) return alert('Select Source Location');
        if (items.length === 0) return alert('Add at least one item');

        setLoading(true);
        try {
            const invoice = await invoiceService.createInvoice(user.token, {
                recipientName,
                sourceLocationId: sourceLocation,
                remarks,
                invoiceType,
                items: items.map(i => ({
                    sampleId: i.sampleId,
                    quantity: i.quantity,
                    notes: i.notes
                }))
            });
            alert('Invoice Request Created! Pending Approval.');
            navigate(`/invoices/${invoice._id}`); // Go to details view
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Setup & Search */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h2 className="font-bold text-gray-900">1. Details</h2>

                            {/* Source Location */}
                            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                <label className="block text-sm font-bold text-yellow-800 mb-1">From (Source) Location</label>
                                <select
                                    className="w-full border-yellow-300 rounded-md shadow-sm p-2 bg-white text-sm"
                                    value={sourceLocation}
                                    onChange={(e) => {
                                        setSourceLocation(e.target.value);
                                        setItems([]); // Clear items if source changes
                                    }}
                                >
                                    <option value="">Select Source...</option>
                                    {locations.map(loc => (
                                        <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-yellow-700 mt-1">This will filter samples available in this location.</p>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                <Input
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    placeholder="Enter Client Name or Destination Address"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={invoiceType}
                                    onChange={(e) => setInvoiceType(e.target.value)}
                                >
                                    <option value="Non-returnable">Non-returnable Sample</option>
                                    <option value="Returnable">Returnable Sample</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Weekly Restock" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-gray-900">2. Add Items</h2>
                                <Button size="sm" variant="outline" onClick={() => setIsScannerOpen(true)} disabled={!sourceLocation}>
                                    <Scan className="w-4 h-4 mr-1" /> Scan
                                </Button>
                            </div>

                            {!sourceLocation ? (
                                <div className="text-center p-4 bg-gray-50 text-gray-400 text-sm rounded-md">
                                    Select Source Location First
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by Name or SKU..."
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    {/* Search Results */}
                                    {searchTerm.length > 2 && (
                                        <div className="border rounded-md divide-y max-h-60 overflow-y-auto bg-gray-50">
                                            {isSearching && <div className="p-2 text-center text-xs text-gray-500">Searching...</div>}
                                            {!isSearching && searchResults.length === 0 && <div className="p-2 text-center text-xs text-gray-500">No results found in this location</div>}
                                            {searchResults.map(sample => (
                                                <div
                                                    key={sample._id}
                                                    className="p-2 hover:bg-indigo-50 cursor-pointer flex justify-between items-center"
                                                    onClick={() => handleAddItem(sample)}
                                                >
                                                    <div className="text-sm">
                                                        <div className="font-medium">{sample.name}</div>
                                                        <div className="text-xs text-gray-500">{sample.sku} | Qty: {sample.quantity}</div>
                                                    </div>
                                                    <Plus className="w-4 h-4 text-indigo-600" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Invoice Items */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardContent className="p-0 flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="font-bold text-gray-900">3. Invoice Items ({items.length})</h2>
                                <Button onClick={handleSubmit} disabled={loading || items.length === 0 || !recipientName}>
                                    {loading ? 'Processing...' : 'Generate Invoice'} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-auto p-0">
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <FileText className="w-12 h-12 mb-2 opacity-20" />
                                        <p>No items added yet</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-2">Item</th>
                                                <th className="px-4 py-2 w-24">Qty</th>
                                                <th className="px-4 py-2">Notes</th>
                                                <th className="px-4 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((item, idx) => (
                                                <tr key={item.sampleId}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-xs text-gray-500">{item.sku}</div>
                                                        <div className="text-xs text-orange-600">Stock: {item.maxQty}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="number" min="1" max={item.maxQty}
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                                                            className="w-20"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            placeholder="Note..."
                                                            value={item.notes}
                                                            onChange={(e) => updateItem(idx, 'notes', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                                <span className="font-bold text-gray-700 mr-2">Total Quantity:</span>
                                <span className="font-mono text-xl text-indigo-600 font-bold">
                                    {items.reduce((acc, curr) => acc + (curr.quantity || 0), 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Scanner Modal */}
            <AnimatePresence>
                {isScannerOpen && (
                    <BarcodeScanner
                        onScanSuccess={handleScanSuccess}
                        onClose={() => setIsScannerOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
