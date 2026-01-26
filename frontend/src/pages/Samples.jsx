import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import sampleService from '../services/sampleService';
import locationService from '../services/locationService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Search, FileText, QrCode, Scan, X, Edit, Printer, Trash2, Copy, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarcodeScanner } from '../components/common/BarcodeScanner';
import { PrintLabel } from '../components/common/PrintLabel';

export function Samples() {
    const { user } = useAuth();
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSampleId, setSelectedSampleId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', styleNo: '', size: '', color: '', buyer: '',
        season: '', vendor: '', sampleType: 'proto', quantity: 1,
        poNumber: '', itemNumber: '', supplier: '', sampleDate: '', fabricDetails: '', remarks: '', currentLocation_id: ''
    });

    // Distribute State
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
    const [selectedSampleForDistribute, setSelectedSampleForDistribute] = useState(null);

    const fetchSamples = async () => {
        setLoading(true);
        try {
            const data = await sampleService.getSamples(user.token, page, keyword);
            setSamples(data.samples);
            setPage(data.page);
            setTotalPages(data.pages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchSamples();
        }, 500);
        return () => clearTimeout(debounce);
    }, [page, keyword]);



    const handleOpenCreateModal = async () => {
        setIsEditMode(false);
        setSelectedSampleId(null);
        setFormData({
            name: '', styleNo: '', size: '', color: '', buyer: '',
            season: '', vendor: '', sampleType: 'proto', quantity: 1,
            poNumber: '', itemNumber: '', supplier: '', sampleDate: '', fabricDetails: '', remarks: '', currentLocation_id: ''
        });
        setIsCreateModalOpen(true);
        // Fetch locations for dropdown
        try {
            const locs = await locationService.getLocations(user.token);
            setLocations(locs);
        } catch (error) {
            console.error('Error fetching locations', error);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode && selectedSampleId) {
                await sampleService.updateSample(user.token, selectedSampleId, formData);
            } else {
                await sampleService.createSample(user.token, formData);
            }
            setIsCreateModalOpen(false);
            setFormData({
                name: '', styleNo: '', size: '', color: '', buyer: '',
                season: '', vendor: '', sampleType: 'proto', quantity: 1,
                poNumber: '', itemNumber: '', supplier: '', sampleDate: '', fabricDetails: '', remarks: '', currentLocation_id: ''
            });
            setIsEditMode(false);
            setSelectedSampleId(null);
            fetchSamples(); // Refresh list
        } catch (error) {
            const message = error.response?.data?.message || 'Error saving sample';
            alert(message);
        }
    };

    const handleScanSuccess = (decodedText) => {
        setFormData(prev => ({ ...prev, itemNumber: decodedText }));
        setIsScannerOpen(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = async (sample) => {
        // Fetch locations for dropdown
        try {
            const locs = await locationService.getLocations(user.token);
            setLocations(locs);
        } catch (error) {
            console.error('Error fetching locations', error);
        }

        setFormData({
            name: sample.name,
            styleNo: sample.styleNo || '',
            size: sample.size || '',
            color: sample.color || '',
            buyer: sample.buyer || '',
            season: sample.season || '',
            vendor: sample.vendor || '',
            sampleType: sample.sampleType || 'proto',
            quantity: sample.quantity || 1,
            poNumber: sample.poNumber || '',
            itemNumber: sample.itemNumber || '',
            supplier: sample.supplier || '',
            sampleDate: sample.sampleDate ? sample.sampleDate.split('T')[0] : '',
            fabricDetails: sample.fabricDetails || '',
            remarks: sample.remarks || '',
            currentLocation_id: sample.currentLocation_id?._id || sample.currentLocation_id || ''
        });
        setIsEditMode(true);
        setSelectedSampleId(sample._id);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sample?')) {
            try {
                await sampleService.deleteSample(user.token, id);
                fetchSamples();
            } catch (error) {
                const message = error.response?.data?.message || 'Error deleting sample';
                alert(message);
            }
        }
    };

    const handleDuplicate = (sample) => {
        setFormData({
            name: sample.name,
            styleNo: sample.styleNo || '',
            size: sample.size || '',
            color: sample.color || '',
            buyer: sample.buyer || '',
            season: sample.season || '',
            vendor: sample.vendor || '',
            sampleType: sample.sampleType || 'proto',
            quantity: sample.quantity || 1,
            poNumber: sample.poNumber || '',
            itemNumber: '',
            supplier: sample.supplier || '',
            sampleDate: sample.sampleDate ? sample.sampleDate.split('T')[0] : '',
            fabricDetails: sample.fabricDetails || '',
            remarks: sample.remarks || ''
        });
        setIsEditMode(false);
        setSelectedSampleId(null);
        setIsCreateModalOpen(true);
    };

    const handleDistribute = async (sample) => {
        setSelectedSampleForDistribute(sample);
        setDistributionData({
            locationId: '',
            notes: '',
            quantity: sample.quantity || 1
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
                selectedSampleForDistribute._id,
                distributionData.locationId,
                distributionData.notes,
                distributionData.quantity,
                distributionData.hanger,
                distributionData.carton
            );
            alert('Sample distributed successfully');
            setIsDistributeModalOpen(false);
            setSelectedSampleForDistribute(null);
            fetchSamples(); // Refresh list to show new location if applicable
        } catch (error) {
            const message = error.response?.data?.message || 'Error distributing sample';
            alert(message);
        } finally {
            setDistributeLoading(false);
        }
    };

    const [printSample, setPrintSample] = useState(null);

    const handlePrint = (sample) => {
        setPrintSample(sample);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sample Management</h1>
                    <p className="text-sm text-gray-500">Track and manage all garment samples.</p>
                </div>
                {(user.role === 'admin' || user.role === 'merchandiser') && (
                    <Button onClick={handleOpenCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Sample
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by Style, Buyer, or SKU..."
                            className="pl-10"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">SKU / Style</th>
                                <th className="px-6 py-3">Details</th>
                                <th className="px-6 py-3">Buyer</th>
                                {user.role === 'admin' && <th className="px-6 py-3">Created By</th>}
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading samples...</td></tr>
                            ) : samples.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No samples found.</td></tr>
                            ) : (
                                samples.map((sample) => (
                                    <tr key={sample._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex flex-col">
                                                <span>{sample.sku}</span>
                                                <span className="text-xs text-indigo-600 font-mono">{sample.styleNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-gray-600">
                                                <span className="font-medium text-gray-800">{sample.name}</span>
                                                <span className="text-xs">{sample.color} - {sample.size} ({sample.sampleType})</span>
                                                {sample.currentLocation_id && <span className="text-xs text-green-600 mt-1">Loc: {sample.currentLocation_id.name}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{sample.buyer}</td>
                                        {user.role === 'admin' && (
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                <span className="bg-gray-100 px-2 py-1 rounded-md">
                                                    {sample.createdBy?.name || 'Unknown'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {sample.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {(user.role === 'admin' || user.role === 'merchandiser') && (
                                                    <Button variant="ghost" size="icon" title="Distribute" onClick={() => handleDistribute(sample)}>
                                                        <Share2 className="w-4 h-4 text-indigo-600" />
                                                    </Button>
                                                )}
                                                {(user.role === 'admin' || user.role === 'merchandiser') && (
                                                    <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEditClick(sample)}>
                                                        <Edit className="w-4 h-4 text-gray-500" />
                                                    </Button>
                                                )}
                                                {(user.role === 'admin' || user.role === 'merchandiser') && (
                                                    <Button variant="ghost" size="icon" title="Duplicate" onClick={() => handleDuplicate(sample)}>
                                                        <Copy className="w-4 h-4 text-gray-500" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" title="Print Barcode" onClick={() => handlePrint(sample)}>
                                                    <Printer className="w-4 h-4 text-gray-500" />
                                                </Button>
                                                {(user.role === 'admin' || user.role === 'merchandiser') && (
                                                    <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(sample._id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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

            {/* Create Modal */}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Item No (Barcode) *</label>
                                        <div className="flex gap-2">
                                            <Input name="itemNumber" value={formData.itemNumber} onChange={handleChange} required />
                                            <Button type="button" variant="outline" size="icon" onClick={() => setIsScannerOpen(true)} title="Scan Barcode">
                                                <Scan className="w-4 h-4" />
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

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Location</label>
                                        <select
                                            name="currentLocation_id"
                                            value={formData.currentLocation_id}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select Location...</option>
                                            {locations.map(loc => (
                                                <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                                            ))}
                                        </select>
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
                                        {locations.map(loc => (
                                            <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                                        ))}
                                    </select>
                                    {locations.length === 0 && <p className="text-xs text-red-500 mt-1">No locations found. Contact Admin.</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={selectedSampleForDistribute?.quantity || 1000}
                                        value={distributionData.quantity}
                                        onChange={(e) => setDistributionData({ ...distributionData, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hanger No.</label>
                                        <Input
                                            placeholder="e.g. H-101"
                                            value={distributionData.hanger}
                                            onChange={(e) => setDistributionData({ ...distributionData, hanger: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Carton No.</label>
                                        <Input
                                            placeholder="e.g. C-202"
                                            value={distributionData.carton}
                                            onChange={(e) => setDistributionData({ ...distributionData, carton: e.target.value })}
                                        />
                                    </div>
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
