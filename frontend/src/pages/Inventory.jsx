import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import inventoryService from '../services/inventoryService';
import { Card, CardContent } from '../components/ui/Card';
import { Package, MapPin, Layers } from 'lucide-react';

export function Inventory() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ inventory: [], statusCounts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await inventoryService.getInventorySummary(user.token);
                setStats(data);
            } catch (error) {
                console.error('Error fetching inventory stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user.token]);

    const totalQuantity = stats.inventory.reduce((sum, item) => sum + item.totalQuantity, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Overview</h1>
                <p className="text-sm text-gray-500">Real-time stock distribution across locations.</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-indigo-50 border-indigo-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <Package className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-indigo-600">Total Items</p>
                            <h2 className="text-3xl font-bold text-gray-900">{totalQuantity}</h2>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-violet-50 border-violet-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-violet-100 rounded-full">
                            <MapPin className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-violet-600">Locations</p>
                            <h2 className="text-3xl font-bold text-gray-900">{stats.inventory.length}</h2>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detail Table */}
                <Card>
                    <CardContent className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-gray-500" />
                                Stock by Location
                            </h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3 text-right">Items (Count)</th>
                                    <th className="px-6 py-3 text-right">Total Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading inventory...</td></tr>
                                ) : stats.inventory.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No stock found in locations.</td></tr>
                                ) : (
                                    stats.inventory.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.locationName}</td>
                                            <td className="px-6 py-4 text-gray-500 capitalize">{item.locationType}</td>
                                            <td className="px-6 py-4 text-right font-mono">{item.count}</td>
                                            <td className="px-6 py-4 text-right font-bold text-indigo-600">{item.totalQuantity}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Status Breakdown (Optional but useful) */}
                <Card>
                    <CardContent className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Sample Status Breakdown</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {loading ? (
                                <div className="p-6 text-center text-gray-400">Loading...</div>
                            ) : stats.statusCounts.length === 0 ? (
                                <div className="p-6 text-center text-gray-400">No status data.</div>
                            ) : (
                                stats.statusCounts.map((s, index) => (
                                    <div key={index} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50/50">
                                        <span className="font-medium text-gray-700">{s._id}</span>
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md text-xs">{s.count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
