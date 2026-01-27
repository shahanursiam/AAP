import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Shirt, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { MerchandiserList } from './MerchandiserList';

export function MerchandiserDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If admin, no need to fetch personalized stats here (or can fetch global stats)
        if (user.role === 'admin') return;

        const fetchStats = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports/stats`, config);
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user.token, user.role]);

    // Admin View: List of Merchandisers
    if (user.role === 'admin') {
        return <MerchandiserList />;
    }

    // Merchandiser View: Personal Dashboard
    const statCards = [
        { title: 'Total Samples', value: stats?.totalSamplesCount, icon: Shirt, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Total QTY', value: stats?.totalQuantity, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Merchandiser Dashboard</h1>
                <p className="text-lg text-indigo-600 font-medium mt-1">Welcome, {user.name}</p>
                <p className="text-gray-500 text-sm">Here is your overview of sample stocks and movements.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div key={index} variants={item}>
                                <Card className="hover:shadow-md transition-shadow border-gray-100/50">
                                    <CardContent className="p-6 flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value || 0}</h3>
                                        </div>
                                        <div className={clsx("p-3 rounded-xl", stat.bg)}>
                                            <Icon className={clsx("w-6 h-6", stat.color)} />
                                        </div>
                                    </CardContent>
                                    <div className="h-1 w-full bg-gray-50 mt-0">
                                        <div className={clsx("h-full rounded-full w-2/3 opacity-50", stat.color.replace('text-', 'bg-'))}></div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reusing the status chart from main dashboard */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Sample Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.statusCounts?.map((s, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">{s._id}</span>
                                    <div className="flex items-center">
                                        <div className="w-64 h-2 bg-gray-100 rounded-full mr-3 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${(s.count / stats.totalSamples) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{s.count}</span>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.statusCounts || stats.statusCounts.length === 0) && (
                                <p className="text-sm text-gray-400">No data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
