import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import movementService from '../services/movementService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, ArrowRight, User, Calendar, MapPin, Search } from 'lucide-react';

export function Movements() {
    const { user } = useAuth();
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const data = await movementService.getMovements(user.token, page);
            setMovements(data.logs);
            setPage(data.page);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error fetching movements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, [page, user.token]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Movement History</h1>
                    <p className="text-sm text-gray-500">Track all sample activities and location changes.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Action</th>
                                    <th className="px-6 py-3">Sample</th>
                                    <th className="px-6 py-3">Location Change</th>
                                    <th className="px-6 py-3">Performed By</th>
                                    <th className="px-6 py-3">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading history...</td></tr>
                                ) : movements.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No movements recorded.</td></tr>
                                ) : (
                                    movements.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${log.action === 'CREATED' ? 'bg-green-100 text-green-800' :
                                                        log.action === 'DISTRIBUTE' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-blue-50 text-blue-700'}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.sample_id ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900">{log.sample_id.name}</div>
                                                        <div className="text-xs text-indigo-600 font-mono">{log.sample_id.sku}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Deleted Sample</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <span className="text-gray-500">{log.fromLocation_id?.name || 'N/A'}</span>
                                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                                    <span className="font-medium text-gray-900">{log.toLocation_id?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    {log.performedBy?.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={log.comments}>
                                                {log.quantity && <span className="font-bold text-gray-700 mr-1">[Qty: {log.quantity}]</span>}
                                                {log.comments}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
                            <Button
                                variant="outline"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
