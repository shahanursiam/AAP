import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Printer, Download, Filter } from 'lucide-react';

export function Reports() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Stock');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        buyer: '',
        factory: '',
        location: ''
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params: {
                    pageNumber: 1,
                    pageSize: 1000,
                    ...filters
                }
            };

            let endpoint = '';
            if (activeTab === 'Stock') {
                endpoint = `${import.meta.env.VITE_API_URL}/api/samples`;
            } else {
                endpoint = `${import.meta.env.VITE_API_URL}/api/movements`;
            }

            console.log('Fetching Report with Params:', config.params); // Debug Log

            const res = await axios.get(endpoint, config);
            setData(activeTab === 'Stock' ? res.data.samples : res.data.logs);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [activeTab]); // Only auto-fetch on tab change. Filters manual refresh.

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-500 text-sm">Generate and print detailed reports.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-gray-50 border-gray-100">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        {activeTab === 'Stock' && (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Customer / Buyer</label>
                                    <input
                                        type="text"
                                        name="buyer"
                                        placeholder="Name..."
                                        value={filters.buyer}
                                        onChange={handleFilterChange}
                                        className="block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Factory</label>
                                    <input
                                        type="text"
                                        name="factory"
                                        placeholder="Name..."
                                        value={filters.factory}
                                        onChange={handleFilterChange}
                                        className="block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Location / Store</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Store Room..."
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        className="block w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <Button variant="primary" onClick={fetchReport} className="w-full">
                                <Filter className="w-4 h-4 mr-2" /> Apply Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('Stock')}
                    className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Stock' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Stock Inventory
                </button>
                <button
                    onClick={() => setActiveTab('Movements')}
                    className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Movements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Movement History
                </button>
            </div>

            {/* Content */}
            <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <CardTitle>{activeTab} Report</CardTitle>
                        <span className="text-sm text-gray-500">{data.length} Records found</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                                {activeTab === 'Stock' ? (
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">SKU</th>
                                        <th className="px-6 py-3">Style No</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Buyer</th>
                                        <th className="px-6 py-3">Factory/Supplier</th>
                                        <th className="px-6 py-3 text-right">Qty</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Sample</th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3">From</th>
                                        <th className="px-6 py-3">To</th>
                                        <th className="px-6 py-3 text-right">Qty</th>
                                        <th className="px-6 py-3">By</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <tr><td colSpan="8" className="p-8 text-center">Loading...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan="8" className="p-8 text-center text-gray-400">No records found</td></tr>
                                ) : (
                                    data.map((item, i) => (
                                        activeTab === 'Stock' ? (
                                            <tr key={item._id || i} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 whitespace-nowrap">{new Date(item.sampleDate || item.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-3 font-mono text-xs">{item.sku}</td>
                                                <td className="px-6 py-3">{item.styleNo}</td>
                                                <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-3">{item.buyer}</td>
                                                <td className="px-6 py-3 text-gray-600">{item.factory || item.supplier || '-'}</td>
                                                <td className="px-6 py-3 text-right font-bold text-indigo-600">{item.quantity}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                        item.status === 'In Transit' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={item._id || i} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 whitespace-nowrap">{new Date(item.createdAt).toLocaleString()}</td>
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-gray-900">{item.sample_id?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{item.sample_id?.sku}</div>
                                                </td>
                                                <td className="px-6 py-3 font-bold text-xs uppercase text-gray-600">{item.action}</td>
                                                <td className="px-6 py-3 text-gray-500">{item.fromLocation_id?.name || '-'}</td>
                                                <td className="px-6 py-3 font-medium text-gray-900">{item.toLocation_id?.name || '-'}</td>
                                                <td className="px-6 py-3 text-right font-bold text-indigo-600">{item.quantity || 1}</td>
                                                <td className="px-6 py-3 text-xs text-gray-500">{item.performedBy?.name}</td>
                                            </tr>
                                        )
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
