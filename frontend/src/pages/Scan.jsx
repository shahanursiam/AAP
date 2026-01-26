import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import sampleService from '../services/sampleService';
import locationService from '../services/locationService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Scan as ScanIcon, Search, Package, Calendar, User, AlertCircle, Edit, Copy, Printer, Trash2, History, X, Clock, Share2 } from 'lucide-react';
import { BarcodeScanner } from '../components/common/BarcodeScanner';
import { PrintLabel } from '../components/common/PrintLabel';
import { motion, AnimatePresence } from 'framer-motion';

export function Scan() {
    const { user } = useAuth();
    const [barcode, setBarcode] = useState('');
    const [scannedSample, setScannedSample] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const inputRef = useRef(null);

    // Actions State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSampleId, setSelectedSampleId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', styleNo: '', size: '', color: '', buyer: '',
        season: '', vendor: '', sampleType: 'proto', quantity: 1,
        poNumber: '', itemNumber: '', supplier: '', sampleDate: '', fabricDetails: '', remarks: ''
    });
    const [isModalScannerOpen, setIsModalScannerOpen] = useState(false);
    const [printSample, setPrintSample] = useState(null);

    // History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Distribute State
    const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [distributionData, setDistributionData] = useState({
        locationId: '',
        notes: '',
        quantity: 1,
        hanger: '',
        carton: ''
    });
    const [distributeLoading, setDistributeLoading] = useState(false);


    // Auto-focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreateModalOpen, isHistoryOpen, isDistributeModalOpen]);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!barcode.trim()) return;

        setLoading(true);
        setError(null);
        setScannedSample(null);

        try {
            const data = await sampleService.getSampleByBarcode(user.token, barcode);
            setScannedSample(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Sample not found');
        } finally {
            setLoading(false);
        }
    };

    const handleScanSuccess = (decodedText) => {
        setBarcode(decodedText);
        setIsCameraOpen(false);
        searchByCode(decodedText);
    };

    const searchByCode = async (code) => {
        setLoading(true);
        setError(null);
        setScannedSample(null);
        try {
            const data = await sampleService.getSampleByBarcode(user.token, code);
            setScannedSample(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Sample not found');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setBarcode('');
        setScannedSample(null);
        setError(null);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // --- Actions Handlers ---

    const handleEdit = () => {
        if (!scannedSample) return;
        setFormData({
            name: scannedSample.name,
            styleNo: scannedSample.styleNo || '',
            size: scannedSample.size || '',
            color: scannedSample.color || '',
            buyer: scannedSample.buyer || '',
            season: scannedSample.season || '',
            vendor: scannedSample.vendor || '',
            sampleType: scannedSample.sampleType || 'proto',
            quantity: scannedSample.quantity || 1,
            poNumber: scannedSample.poNumber || '',
            itemNumber: scannedSample.itemNumber || '',
            supplier: scannedSample.supplier || '',
            sampleDate: scannedSample.sampleDate ? scannedSample.sampleDate.split('T')[0] : '',
            fabricDetails: scannedSample.fabricDetails || '',
            remarks: scannedSample.remarks || ''
        });
        setIsEditMode(true);
        setSelectedSampleId(scannedSample._id);
        setIsCreateModalOpen(true);
    };

    const handleDuplicate = () => {
        if (!scannedSample) return;
        setFormData({
            name: scannedSample.name,
            styleNo: scannedSample.styleNo || '',
            size: scannedSample.size || '',
            color: scannedSample.color || '',
            buyer: scannedSample.buyer || '',
            season: scannedSample.season || '',
            vendor: scannedSample.vendor || '',
            sampleType: scannedSample.sampleType || 'proto',
            quantity: scannedSample.quantity || 1,
            poNumber: scannedSample.poNumber || '',
            itemNumber: '', // Clear for new
            supplier: scannedSample.supplier || '',
            sampleDate: scannedSample.sampleDate ? scannedSample.sampleDate.split('T')[0] : '',
            fabricDetails: scannedSample.fabricDetails || '',
            remarks: scannedSample.remarks || ''
        });
        setIsEditMode(false);
        setSelectedSampleId(null);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async () => {
        if (!scannedSample) return;
        if (window.confirm('Are you sure you want to delete this sample?')) {
            try {
                await sampleService.deleteSample(user.token, scannedSample._id);
                handleClear();
                alert('Sample deleted successfully');
            } catch (error) {
                const message = error.response?.data?.message || 'Error deleting sample';
                alert(message);
            }
        }
    };

    const handlePrint = () => {
        if (!scannedSample) return;
        setPrintSample(scannedSample);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const handleHistory = async () => {
        if (!scannedSample) return;
        setHistoryLoading(true);
        setIsHistoryOpen(true);
        try {
            const logs = await sampleService.getSampleHistory(user.token, scannedSample._id);
            setHistoryLogs(logs);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleDistribute = async () => {
        if (!scannedSample) return;
        setDistributionData({
            locationId: '',
            notes: '',
            quantity: scannedSample.quantity || 1
        });
        setIsDistributeModalOpen(true);
        try {
            const locs = await locationService.getLocations(user.token);
            setLocations(locs);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDistributeSubmit = async (e) => {
        e.preventDefault();
        setDistributeLoading(true);
        try {
            await sampleService.distributeSample(
                user.token,
                scannedSample._id,
                distributionData.locationId,
                distributionData.notes,
                distributionData.quantity,
                distributionData.hanger,
                distributionData.carton
            );
            alert('Sample distributed successfully');
            setIsDistributeModalOpen(false);
            // Refresh scanned data logic...
            const updated = await sampleService.getSampleById(user.token, scannedSample._id);
            setScannedSample(updated);
        } catch (error) {
            const message = error.response?.data?.message || 'Error distributing sample';
            alert(message);
        } finally {
            setDistributeLoading(false);
        }
    };


    // --- Modal Handlers ---

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleModalScanSuccess = (decodedText) => {
        setFormData(prev => ({ ...prev, itemNumber: decodedText }));
        setIsModalScannerOpen(false);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode && selectedSampleId) {
                await sampleService.updateSample(user.token, selectedSampleId, formData);
                // Refresh scanned data
                const updated = await sampleService.getSampleById(user.token, selectedSampleId);
                setScannedSample(updated);
            } else {
                await sampleService.createSample(user.token, formData);
                alert('Sample created successfully');
            }
            setIsCreateModalOpen(false);
        } catch (error) {
            const message = error.response?.data?.message || 'Error saving sample';
            alert(message);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-full">
                    <ScanIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Scan Item</h1>
                    <p className="text-sm text-gray-500">Scan barcode or enter item number to lookup details.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            ref={inputRef}
                            placeholder="Scan or enter barcode..."
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            className="text-lg py-6"
                        />
                        <Button type="button" variant="outline" className="h-auto" onClick={() => setIsCameraOpen(true)}>
                            <ScanIcon className="w-5 h-5" />
                        </Button>
                        <Button type="submit" className="h-auto px-6" disabled={loading}>
                            {loading ? 'Searching...' : <Search className="w-5 h-5" />}
                        </Button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
                        >
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {scannedSample && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border rounded-xl overflow-hidden shadow-sm"
                            >
                                <div className="p-4 bg-gray-50 border-b flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{scannedSample.name}</h3>
                                        <p className="text-sm text-gray-500 font-mono">{scannedSample.sku}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                                        {scannedSample.status}
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                                            <Package className="w-3 h-3" /> Style
                                        </label>
                                        <p className="font-medium">{scannedSample.styleNo}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                                            <User className="w-3 h-3" /> Buyer
                                        </label>
                                        <p className="font-medium">{scannedSample.buyer}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 uppercase font-bold">Details</label>
                                        <p>{scannedSample.color} - {scannedSample.size} (Qty: {scannedSample.quantity})</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Date
                                        </label>
                                        <p>{scannedSample.sampleDate ? scannedSample.sampleDate.split('T')[0] : 'N/A'}</p>
                                    </div>
                                    {scannedSample.currentLocation_id && (
                                        <div className="col-span-2 space-y-1 pt-2 border-t mt-2">
                                            <label className="text-xs text-gray-400 uppercase font-bold">Location</label>
                                            <p className="font-medium text-indigo-600">{scannedSample.currentLocation_id.name}</p>
                                        </div>
                                    )}

                                    {/* Stock Breakdown */}
                                    {scannedSample.stockBreakdown && scannedSample.stockBreakdown.length > 0 && (
                                        <div className="col-span-2 mt-4 pt-4 border-t border-dashed">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-gray-700 text-sm">Global Stock: {scannedSample.totalGlobalStock}</h4>
                                            </div>
                                            <div className="bg-gray-50 rounded-md p-2 space-y-1">
                                                {scannedSample.stockBreakdown.map(stock => (
                                                    <div key={stock._id} className="flex justify-between text-xs items-center p-1 border-b border-gray-100 last:border-0">
                                                        <span className="font-medium text-gray-600">{stock.locationName}</span>
                                                        <span className="font-bold bg-white px-2 py-0.5 rounded border shadow-sm">{stock.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50 border-t flex flex-wrap justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleDistribute} title="Distribute" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                        <Share2 className="w-4 h-4 mr-1" /> Distribute
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleDuplicate} title="Duplicate">
                                        <Copy className="w-4 h-4 mr-1" /> Duplicate
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleEdit} title="Edit">
                                        <Edit className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleHistory} title="History">
                                        <History className="w-4 h-4 mr-1" /> History
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handlePrint} title="Print">
                                        <Printer className="w-4 h-4 mr-1" /> Print
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </Button>
                                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                    <Button variant="outline" onClick={handleClear}>Scan Next</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <AnimatePresence>
                {isCameraOpen && (
                    <BarcodeScanner
                        onScanSuccess={handleScanSuccess}
                        onClose={() => setIsCameraOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setIsCreateModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Sample' : 'Create New Sample'}</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                                {/* Form fields same as before... omit for brevity if unchanged, but I'll write full to be safe */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Item No (Barcode) *</label>
                                        <div className="flex gap-2">
                                            <Input name="itemNumber" value={formData.itemNumber} onChange={handleChange} required />
                                            <Button type="button" variant="outline" size="icon" onClick={() => setIsModalScannerOpen(true)} title="Scan Barcode">
                                                <ScanIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sample Description *</label>
                                        <Input name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Style No *</label>
                                        <Input name="styleNo" value={formData.styleNo} onChange={handleChange} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                                        <Input name="poNumber" value={formData.poNumber} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Buyer (Customer)</label>
                                        <Input name="buyer" value={formData.buyer} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                                        <Input name="season" value={formData.season} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                        <Input name="supplier" value={formData.supplier} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                                        <Input name="vendor" value={formData.vendor} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Details</label>
                                        <Input name="fabricDetails" value={formData.fabricDetails} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sample Date</label>
                                        <Input name="sampleDate" type="date" value={formData.sampleDate} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                        <Input name="size" value={formData.size} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                        <Input name="color" value={formData.color} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            name="sampleType"
                                            value={formData.sampleType}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="proto">Proto</option>
                                            <option value="fit">Fit</option>
                                            <option value="pp">Pre-Production (PP)</option>
                                            <option value="production">Production</option>
                                            <option value="shipment">Shipment</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                        <Input name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                        <Input name="remarks" value={formData.remarks} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-100">
                                    <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                    <Button type="submit">{isEditMode ? 'Update Sample' : 'Create Sample'}</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Scanner */}
            <AnimatePresence>
                {isModalScannerOpen && (
                    <BarcodeScanner
                        onScanSuccess={handleModalScanSuccess}
                        onClose={() => setIsModalScannerOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setIsHistoryOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md z-10 overflow-hidden max-h-[80vh] flex flex-col"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                                <h2 className="text-lg font-bold text-gray-900">History Log</h2>
                                <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="p-0 overflow-y-auto flex-1">
                                {historyLoading ? (
                                    <div className="p-8 text-center text-gray-500">Loading history...</div>
                                ) : historyLogs.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No history found.</div>
                                ) : (
                                    <ol className="relative border-l border-gray-200 m-6">
                                        {historyLogs.map((log) => (
                                            <li key={log._id} className="mb-6 ml-4">
                                                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                                <time className="mb-1 text-sm font-normal leading-none text-gray-400">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </time>
                                                <h3 className="text-sm font-semibold text-gray-900 mt-1">{log.action} {log.quantity && `(Qty: ${log.quantity})`}</h3>
                                                <p className="mb-1 text-sm font-normal text-gray-500">{log.comments}</p>
                                                <p className="text-xs text-gray-400">by {log.performedBy?.name || 'Unknown'}</p>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                            <div className="p-4 border-t bg-gray-50 flex justify-end">
                                <Button variant="secondary" onClick={() => setIsHistoryOpen(false)}>Close</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Distribute Modal */}
            <AnimatePresence>
                {isDistributeModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setIsDistributeModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md z-10 overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                                <h2 className="text-lg font-bold text-gray-900">Distribute Sample</h2>
                                <button onClick={() => setIsDistributeModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <form onSubmit={handleDistributeSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                        value={distributionData.locationId}
                                        onChange={(e) => setDistributionData({ ...distributionData, locationId: e.target.value })}
                                    >
                                        <option value="">Select Location...</option>
                                        {locations
                                            .filter(loc => {
                                                const name = loc.name.toLowerCase();
                                                return name.includes('front desk') ||
                                                    name.includes('store room') ||
                                                    name.includes('display room') ||
                                                    name.includes('general room');
                                            })
                                            .map(loc => (
                                                <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                                            ))}
                                    </select>
                                    {locations.length === 0 && <p className="text-xs text-red-500 mt-1">No locations found. Contact Admin.</p>}
                                </div>

                                {/* Dynamic Fields */}
                                {(() => {
                                    const selectedLoc = locations.find(l => l._id === distributionData.locationId);
                                    if (!selectedLoc) return null;
                                    const name = selectedLoc.name.toLowerCase();

                                    if (name.includes('store room')) {
                                        return (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Carton No. *</label>
                                                <Input
                                                    required
                                                    placeholder="e.g. C-202"
                                                    value={distributionData.carton}
                                                    onChange={(e) => setDistributionData({ ...distributionData, carton: e.target.value })}
                                                />
                                            </div>
                                        );
                                    }
                                    if (name.includes('display room') || name.includes('general room')) {
                                        return (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Hanger No. *</label>
                                                <Input
                                                    required
                                                    placeholder="e.g. H-101"
                                                    value={distributionData.hanger}
                                                    onChange={(e) => setDistributionData({ ...distributionData, hanger: e.target.value })}
                                                />
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={scannedSample?.quantity || 1000}
                                        value={distributionData.quantity}
                                        onChange={(e) => setDistributionData({ ...distributionData, quantity: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <Input
                                        value={distributionData.notes}
                                        onChange={(e) => setDistributionData({ ...distributionData, notes: e.target.value })}
                                        placeholder="Reason for distribution/transfer..."
                                    />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-100">
                                    <Button type="button" variant="secondary" onClick={() => setIsDistributeModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={distributeLoading}>
                                        {distributeLoading ? 'Distributing...' : 'Confirm Distribution'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Print Area */}
            <div id="print-area" className="hidden">
                {printSample && <PrintLabel sample={printSample} />}
            </div>
        </div>
    );
}
