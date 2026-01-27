import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import trackingService from '../services/trackingService';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PrintLabel } from '../components/common/PrintLabel'; // Reuse or create new if needed
import { Barcode, Package, Shirt, Printer, Plus, AlertCircle, CheckCircle, MapPin, Box } from 'lucide-react';

export function TrackingManager() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Carton');
    const [containerId, setContainerId] = useState('');
    const [currentContainer, setCurrentContainer] = useState(null);
    const [sampleSku, setSampleSku] = useState('');
    const [quantity, setQuantity] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // New State for Selection Modal
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [candidateSources, setCandidateSources] = useState([]);

    const handleCreateOrLoad = async (e) => {
        e.preventDefault();
        if (!containerId) return;
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Try to get existing
            try {
                const data = await trackingService.getContainerDetails(user.token, containerId);

                // Enforce Type Check
                if (data.type !== activeTab) {
                    if (window.confirm(`Container ${containerId} is a ${data.type}. Switch to ${data.type} tab?`)) {
                        setActiveTab(data.type);
                        setCurrentContainer(data);
                        setMessage({ type: 'success', text: `Switched to ${data.type} view` });
                        return;
                    } else {
                        throw new Error(`Incorrect type. Found ${data.type}, expected ${activeTab}`);
                    }
                }

                setCurrentContainer(data);
                setMessage({ type: 'success', text: 'Container loaded successfully' });
            } catch (err) {
                // If not found, create new
                if (err.response && err.response.status === 404) {
                    if (window.confirm(`Container ${containerId} not found. Create new ${activeTab}?`)) {
                        const newContainer = await trackingService.createContainer(user.token, activeTab, containerId);
                        setCurrentContainer(newContainer);
                        setMessage({ type: 'success', text: `New ${activeTab} created` });
                    }
                } else if (err.message.includes('Incorrect type')) {
                    setMessage({ type: 'error', text: err.message });
                } else {
                    throw err;
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error processing container' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e, sourceId = null) => {
        if (e) e.preventDefault();

        // If triggered from form submit (e exists), start fresh
        // If triggered from modal selection (sourceId exists), use that.

        if ((!sampleSku && !sourceId) || !currentContainer) return;
        setLoading(true);
        setMessage({ type: '', text: '' }); // Clear prev messages

        try {
            const qtyToSend = quantity ? parseInt(quantity) : null;

            // Pass sourceSampleId if selecting from multiple
            const data = await trackingService.addItemToContainer(
                user.token,
                currentContainer.containerId,
                sampleSku,
                qtyToSend,
                sourceId
            );

            setCurrentContainer(data.container);
            const refreshed = await trackingService.getContainerDetails(user.token, currentContainer.containerId);
            setCurrentContainer(refreshed);

            setSampleSku('');
            setQuantity('');
            setShowSourceModal(false); // Close modal if open
            setCandidateSources([]);
            setMessage({ type: 'success', text: 'Item added successfully' });

        } catch (error) {
            // Handle Multiple Choices (300) logic from Axios error response?
            // Axios throws for 300 range usually unless configured otherwise, or if backend sends 409/300.
            // Backend sends 300. Check error.response
            if (error.response && error.response.status === 300) {
                setCandidateSources(error.response.data.sources);
                setShowSourceModal(true);
                setMessage({ type: 'info', text: 'Multiple sources found. Please select one.' });
            } else {
                setMessage({ type: 'error', text: error.response?.data?.message || 'Error adding item' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSource = (sourceId) => {
        // Retry adding with specific source
        handleAddItem(null, sourceId);
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setContainerId('');
        setCurrentContainer(null);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tracking Manager</h1>
                <p className="text-sm text-gray-500">Manage Warehouse Cartons and Display Hangers</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => switchTab('Carton')}
                    className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Carton' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Package className="w-4 h-4" /> Warehouse Cartons
                </button>
                <button
                    onClick={() => switchTab('Hanger')}
                    className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Hanger' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Shirt className="w-4 h-4" /> Display Hangers
                </button>
            </div>

            {/* Container Selection */}
            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleCreateOrLoad} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {activeTab} Barcode ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Barcode className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={containerId}
                                    onChange={(e) => setContainerId(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder={`Scan/Enter ${activeTab} ID`}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={!containerId || loading}>
                            {loading ? 'Processing...' : 'Load / Create'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Message Display */}
            {message.text && (
                <div className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700' :
                    message.type === 'info' ? 'bg-blue-50 text-blue-700' :
                        'bg-green-50 text-green-700'
                    }`}>
                    {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
                    {message.type === 'info' && <AlertCircle className="w-5 h-5" />}
                    {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Active Container View */}
            {currentContainer && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative"> {/* Added relative for modal positioning context if needed, though using fixed usually */}

                    {/* Source Selection Modal Overlay */}
                    {showSourceModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-gray-900">Select Source Item</h3>
                                    <button onClick={() => setShowSourceModal(false)} className="text-gray-400 hover:text-gray-500">&times;</button>
                                </div>
                                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Multiple items found for SKU: <span className="font-mono font-bold text-gray-800">{sampleSku}</span>.
                                        Please select which stock to deduct from:
                                    </p>
                                    {candidateSources.map(source => (
                                        <div key={source._id}
                                            onClick={() => handleSelectSource(source._id)}
                                            className="border border-gray-200 rounded-lg p-3 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors flex justify-between items-center group"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-800">{source.name}</span>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">{source.sku}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {source.location}</span>
                                                    <span className="flex items-center gap-1"><Box className="w-3 h-3" /> {source.container}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-lg font-bold text-indigo-600">{source.quantity}</span>
                                                <span className="text-[10px] uppercase text-gray-400 font-bold">Qty Avail</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50 text-right">
                                    <Button variant="secondary" onClick={() => setShowSourceModal(false)}>Cancel</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Packing List / Items - Same as before */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-0">
                                {/* ... Header ... */}
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-gray-900">
                                            {activeTab} Contents: <span className="text-indigo-600">{currentContainer.containerId}</span>
                                        </h3>
                                        <div className="mt-2">
                                            <img
                                                src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${currentContainer.containerId}&scale=2&height=8&includetext&textxalign=center`}
                                                alt="Barcode"
                                                style={{ height: '40px' }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">{currentContainer.items.length} Items</span>
                                </div>

                                {/* Add Item Form */}
                                <div className="p-4 border-b border-gray-100 bg-white">
                                    <form onSubmit={(e) => handleAddItem(e)} className="flex gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={sampleSku}
                                                onChange={(e) => setSampleSku(e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Scan Sample Barcode to Add"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <Button type="submit" variant="secondary" disabled={!sampleSku || loading}>
                                            <Plus className="w-4 h-4 mr-2" /> Add Item
                                        </Button>
                                    </form>
                                </div>

                                {/* List */}
                                <div className="max-h-[500px] overflow-y-auto">
                                    {currentContainer.items.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">Empty {activeTab}. Scan items to add.</div>
                                    ) : (
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2">SKU</th>
                                                    <th className="px-4 py-2">Name</th>
                                                    <th className="px-4 py-2">Color</th>
                                                    <th className="px-4 py-2">Qty</th>
                                                    <th className="px-4 py-2">Added By</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {currentContainer.items.map((item) => (
                                                    <tr key={item._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 font-mono">{item.sku}</td>
                                                        <td className="px-4 py-2">{item.name}</td>
                                                        <td className="px-4 py-2">{item.color}</td>
                                                        <td className="px-4 py-2 font-bold">{item.quantity || 1}</td>
                                                        <td className="px-4 py-2 text-gray-500 text-xs">{(item.createdBy && item.createdBy.name) || 'User'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions and Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</h4>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {currentContainer.status}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Created By</h4>
                                    <p className="text-sm font-medium">{currentContainer.createdBy?.name || 'System'}</p>
                                    <p className="text-xs text-gray-500">{new Date(currentContainer.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <Button className="w-full justify-center" onClick={() => window.print()}>
                                        <Printer className="w-4 h-4 mr-2" /> Print Packing List
                                    </Button>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Use browser print to print this page as a packing list.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
