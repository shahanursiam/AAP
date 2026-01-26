import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import locationService from '../services/locationService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, MapPin, Plus, Save, Trash2 } from 'lucide-react';

export function Settings() {
    const { user } = useAuth();
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    // New/Edit Location Form
    const [newLocation, setNewLocation] = useState({ name: '', type: 'warehouse', address: '' });
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState(null);

    const fetchLocations = async () => {
        setLoadingLocations(true);
        try {
            const data = await locationService.getLocations(user.token);
            setLocations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingLocations(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [user.token]);

    const handleAddLocation = async (e) => {
        e.preventDefault();
        try {
            if (isEditingLocation && selectedLocationId) {
                await locationService.updateLocation(user.token, selectedLocationId, newLocation);
                alert('Location updated successfully');
            } else {
                await locationService.createLocation(user.token, newLocation);
                alert('Location added successfully');
            }
            setNewLocation({ name: '', type: 'warehouse', address: '' });
            setIsAddingLocation(false);
            setIsEditingLocation(false);
            setSelectedLocationId(null);
            fetchLocations();
        } catch (error) {
            const message = error.response?.data?.message || 'Error saving location';
            alert(message);
        }
    };

    const handleEditClick = (loc) => {
        setNewLocation({ name: loc.name, type: loc.type, address: loc.address || '' });
        setSelectedLocationId(loc._id);
        setIsEditingLocation(true);
        setIsAddingLocation(true);
    };

    const handleCancel = () => {
        setIsAddingLocation(false);
        setIsEditingLocation(false);
        setSelectedLocationId(null);
        setNewLocation({ name: '', type: 'warehouse', address: '' });
    };

    const handleDeleteLocation = async (id) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                await locationService.deleteLocation(user.token, id);
                fetchLocations();
                alert('Location deleted successfully');
            } catch (error) {
                const message = error.response?.data?.message || 'Error deleting location';
                alert(message);
            }
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            {/* User Profile */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">User Profile</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Name</label>
                            <p className="mt-1 text-gray-900 font-medium">{user.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 text-gray-900 font-medium">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Role</label>
                            <p className="mt-1 text-gray-900 font-medium uppercase text-xs tracking-wide bg-gray-100 inline-block px-2 py-1 rounded">
                                {user.isAdmin ? 'Admin' : 'User'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Location Management */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-100 rounded-full">
                                <MapPin className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Locations</h2>
                                <p className="text-sm text-gray-500">Manage warehouses, showrooms, and offices.</p>
                            </div>
                        </div>
                        <Button onClick={() => { setIsAddingLocation(!isAddingLocation); setIsEditingLocation(false); setNewLocation({ name: '', type: 'warehouse', address: '' }); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            {isAddingLocation && isEditingLocation ? 'Cancel Edit' : 'Add Location'}
                        </Button>
                    </div>

                    {isAddingLocation && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-4">
                            <form onSubmit={handleAddLocation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                                    <Input
                                        required
                                        placeholder="e.g. Dhaka Central Warehouse"
                                        value={newLocation.name}
                                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={newLocation.type}
                                        onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                                    >
                                        <option value="warehouse">Warehouse</option>
                                        <option value="showroom">Showroom</option>
                                        <option value="office">Office</option>
                                        <option value="factory">Factory</option>
                                        <option value="vendor">Vendor</option>
                                        <option value="display">Display</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                                    <Input
                                        placeholder="City, Area"
                                        value={newLocation.address}
                                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                    <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
                                    <Button type="submit">
                                        <Save className="w-4 h-4 mr-2" />
                                        {isEditingLocation ? 'Update Location' : 'Save Location'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-hidden border border-gray-100 rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Address</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingLocations ? (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">Loading locations...</td></tr>
                                ) : locations.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">No locations found.</td></tr>
                                ) : (
                                    locations.map((loc) => (
                                        <tr key={loc._id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{loc.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${loc.type === 'warehouse' ? 'bg-orange-100 text-orange-800' :
                                                        loc.type === 'showroom' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-blue-100 text-blue-800'}`}>
                                                    {loc.type ? loc.type.charAt(0).toUpperCase() + loc.type.slice(1) : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{loc.address || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleEditClick(loc)}>Edit</Button>
                                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteLocation(loc._id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
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
