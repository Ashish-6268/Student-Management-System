import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Save, X, BookOpen, Layout, Grid, Layers, Network } from 'lucide-react';
import { 
  getClasses, addClass, updateClass, 
  getBoards, addBoard, updateBoard, 
  getModes, addMode, updateMode, 
  getSubjects, addSubject, updateSubject, 
  getClassSubjects, updateClassSubjects 
} from '../../api/settings';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('classes');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        subtitle="Manage application master data"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Sidebar */}
        <Card className="w-full lg:w-64 shrink-0 overflow-hidden self-start">
          <nav className="flex flex-col">
            <TabButton active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} icon={<Layers size={18} />} label="Classes" />
            <TabButton active={activeTab === 'boards'} onClick={() => setActiveTab('boards')} icon={<Grid size={18} />} label="Boards" />
            <TabButton active={activeTab === 'modes'} onClick={() => setActiveTab('modes')} icon={<Layout size={18} />} label="Modes" />
            <TabButton active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon={<BookOpen size={18} />} label="Subjects" />
            <TabButton active={activeTab === 'mapping'} onClick={() => setActiveTab('mapping')} icon={<Network size={18} />} label="Class-Subject Mapping" />
          </nav>
        </Card>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'classes' && <CrudSection title="Classes" getApi={getClasses} addApi={addClass} updateApi={updateClass} hasDisplayOrder />}
          {activeTab === 'boards' && <CrudSection title="Boards" getApi={getBoards} addApi={addBoard} updateApi={updateBoard} />}
          {activeTab === 'modes' && <CrudSection title="Modes" getApi={getModes} addApi={addMode} updateApi={updateMode} />}
          {activeTab === 'subjects' && <CrudSection title="Subjects" getApi={getSubjects} addApi={addSubject} updateApi={updateSubject} />}
          {activeTab === 'mapping' && <ClassSubjectMapping />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
        active 
          ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-r-4 border-transparent'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function CrudSection({ title, getApi, addApi, updateApi, hasDisplayOrder = false }) {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', display_order: 0, is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getApi();
      if (res.success) setItems(res.data);
    } catch (error) {
      showToast(`Error loading ${title.toLowerCase()}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [title]);

  const handleAddNew = () => {
    setFormData({ name: '', display_order: items.length + 1, is_active: true });
    setEditItem(null);
    setIsEditing(true);
  };

  const handleEdit = (item) => {
    setFormData({ 
      name: item.name, 
      display_order: item.display_order || 0,
      is_active: item.is_active 
    });
    setEditItem(item);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return showToast('Name is required', 'error');

    setSaving(true);
    try {
      let res;
      if (editItem) {
        res = await updateApi(editItem.id, formData);
      } else {
        res = await addApi(formData);
      }

      if (res.success) {
        showToast(`${title.slice(0, -1)} saved successfully`, 'success');
        setIsEditing(false);
        fetchItems();
      } else {
        showToast(res.message || 'Error saving', 'error');
      }
    } catch (error) {
      showToast('Error saving item', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800">{title} Management</h3>
        {!isEditing && (
          <Button variant="primary" size="sm" onClick={handleAddNew} className="flex items-center gap-1.5">
            <Plus size={16} /> Add New
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="p-5 bg-white">
          <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <Input
              label="Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              autoFocus
              required
            />
            
            {hasDisplayOrder && (
              <Input
                label="Display Order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
              />
            )}

            {editItem && (
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <span className="text-sm font-medium text-gray-700">Active Status</span>
              </label>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="primary" isLoading={saving}>
                <Save size={16} className="mr-2 inline" /> Save
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <div className="p-10 flex justify-center"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Name</th>
                {hasDisplayOrder && <th className="px-6 py-3">Order</th>}
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No {title.toLowerCase()} found.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500">#{item.id}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                    {hasDisplayOrder && <td className="px-6 py-3 text-gray-500">{item.display_order}</td>}
                    <td className="px-6 py-3">
                      <Badge variant={item.is_active ? 'success' : 'secondary'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors inline-flex"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function ClassSubjectMapping() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [mappedSubjects, setMappedSubjects] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMapping, setLoadingMapping] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getClasses(), getSubjects()])
      .then(([resClasses, resSubjects]) => {
        if (resClasses.success) setClasses(resClasses.data.filter(c => c.is_active));
        if (resSubjects.success) setSubjects(resSubjects.data.filter(s => s.is_active));
      })
      .catch(() => showToast('Error loading initial data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoadingMapping(true);
      getClassSubjects(selectedClass)
        .then(res => {
          if (res.success) {
            setMappedSubjects(res.data.map(s => s.id));
          }
        })
        .catch(() => showToast('Error loading mapping', 'error'))
        .finally(() => setLoadingMapping(false));
    } else {
      setMappedSubjects([]);
    }
  }, [selectedClass]);

  const toggleSubject = (subjectId) => {
    if (mappedSubjects.includes(subjectId)) {
      setMappedSubjects(mappedSubjects.filter(id => id !== subjectId));
    } else {
      setMappedSubjects([...mappedSubjects, subjectId]);
    }
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const res = await updateClassSubjects(selectedClass, mappedSubjects);
      if (res.success) {
        showToast('Subjects mapped successfully', 'success');
      } else {
        showToast('Error mapping subjects', 'error');
      }
    } catch (error) {
      showToast('Error saving changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card className="p-10 flex justify-center"><Spinner /></Card>;

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800">Class - Subject Mapping</h3>
        <p className="text-sm text-gray-500 mt-1">Select a class to assign subjects</p>
      </div>
      
      <div className="p-6">
        <div className="max-w-xs mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Choose a Class --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-800">Available Subjects</h4>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {mappedSubjects.length} selected
              </span>
            </div>
            
            {loadingMapping ? (
              <div className="py-8 flex justify-center"><Spinner /></div>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No active subjects available in the system.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map(subject => {
                    const isChecked = mappedSubjects.includes(subject.id);
                    return (
                      <div 
                        key={subject.id} 
                        onClick={() => toggleSubject(subject.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isChecked ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={isChecked}
                          onChange={() => {}} // handled by div click
                        />
                        <span className="text-sm font-medium select-none">{subject.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 flex justify-end">
                  <Button variant="primary" onClick={handleSave} isLoading={saving} className="min-w-[120px]">
                    <Save size={16} className="mr-2 inline" /> Save Mapping
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
