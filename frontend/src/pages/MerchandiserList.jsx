import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, User, Briefcase, Mail, Hash, Phone, Trash2, Edit, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MerchandiserList() {
    const { user } = useAuth();
    const [merchandisers, setMerchandisers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const fetchMerchandisers = async () => {
        setLoading(true);
        try {
            const data = await userService.getMerchandisers(user.token);
            setMerchandisers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchandisers();
    }, [user.token]);

    const handleOpenModal = () => {
        setEditingId(null);
        setFormData({ name: '', email: '', password: '' });
        setIsModalOpen(true);
    };

    const handleEditClick = (merc) => {
        setEditingId(merc._id);
        setFormData({ name: merc.name, email: merc.email, password: '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this merchandiser?')) {
            try {
                await userService.deleteMerchandiser(user.token, id);
                fetchMerchandisers();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting user');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await userService.updateMerchandiser(user.token, editingId, formData);
            } else {
                await userService.createMerchandiser(user.token, formData);
            }
            setIsModalOpen(false);
            fetchMerchandisers();
            alert(editingId ? 'Merchandiser updated' : 'Merchandiser added');
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving user');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Merchandiser Management</h1>
                    <p className="text-sm text-gray-500">Manage merchandisers and view their performance.</p>
                </div>
                <Button onClick={handleOpenModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Merchandiser
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : merchandisers.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                    No merchandisers found. Add one to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchandisers.map((merc) => (
                        <Card key={merc._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditClick(merc)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(merc._id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{merc.name}</h3>
                                <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> {merc.email}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <div className="text-sm text-gray-500">Total Samples</div>
                                    <div className="text-lg font-bold text-indigo-600">{merc.sampleCount || 0}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md z-10 overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                                <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Merchandiser' : 'Add New Merchandiser'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <Input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                                    </label>
                                    <Input
                                        type="password"
                                        required={!editingId}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="******"
                                        minLength={6}
                                    />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit">
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingId ? 'Update User' : 'Create User'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
