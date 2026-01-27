import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Shirt, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [user.token]);

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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of sample movements and inventory.</p>
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
                                    {/* Mini sparkline or trend can go here */}
                                    <div className="h-1 w-full bg-gray-50 mt-0">
                                        <div className={clsx("h-full rounded-full w-2/3 opacity-50", stat.color.replace('text-', 'bg-'))}></div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Recent Activity or Charts Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 min-h-[400px]">
                    <CardHeader>
                        <CardTitle>Inventory Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Factory / Supplier Chart */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-4">Top Factories / Suppliers</h4>
                            <div className="h-64 w-full">
                                {stats?.factoryCounts?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.factoryCounts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis type="category" dataKey="_id" width={100} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                cursor={{ fill: '#f3f4f6' }}
                                            />
                                            <Bar dataKey="count" name="Quantity" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No factory data</div>
                                )}
                            </div>
                        </div>

                        {/* Customer / Buyer Chart */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-4">Top Customers</h4>
                            <div className="h-64 w-full">
                                {stats?.buyerCounts?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.buyerCounts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis type="category" dataKey="_id" width={100} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                cursor={{ fill: '#f3f4f6' }}
                                            />
                                            <Bar dataKey="count" name="Quantity" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No customer data</div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>By Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.statusCounts?.map((s, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">{s._id}</span>
                                    <div className="flex items-center">
                                        <div className="w-32 h-2 bg-gray-100 rounded-full mr-3 overflow-hidden">
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
