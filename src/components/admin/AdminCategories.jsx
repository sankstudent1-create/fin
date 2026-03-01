import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Layers, Loader2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { ICON_MAP, CATEGORY_COLORS, AVAILABLE_ICONS } from '../../config/constants';

export const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingCatId, setEditingCatId] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'expense', icon_key: 'Tag' });

    useEffect(() => {
        loadGlobalCategories();
    }, []);

    const loadGlobalCategories = async () => {
        setLoading(true);
        const { data } = await supabase.from('categories').select('*').is('user_id', null).order('name', { ascending: true });
        setCategories(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (editingCatId) {
                await supabase.from('categories').update({
                    name: form.name.trim(),
                    type: form.type,
                    icon_key: form.icon_key
                }).eq('id', editingCatId);
            } else {
                await supabase.from('categories').insert({
                    name: form.name.trim(),
                    type: form.type,
                    icon_key: form.icon_key,
                    user_id: null, // Global category
                    usage_count: 0
                });
            }
            setForm({ name: '', type: 'expense', icon_key: 'Tag' });
            setEditingCatId(null);
            loadGlobalCategories();
        } catch (e) {
            console.error(e);
            alert('Failed to save category');
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this global category?")) return;
        await supabase.from('categories').delete().eq('id', id);
        loadGlobalCategories();
    };

    const getIconComponent = (iconKey) => {
        if (ICON_MAP[iconKey]) return ICON_MAP[iconKey];
        const match = AVAILABLE_ICONS.find(i => i.name === iconKey);
        if (match) return match.component;
        return ICON_MAP['Other'];
    };

    const getColor = (name) => {
        const colorMap = {
            'Shopping': 'rose', 'Food': 'orange', 'Transport': 'blue', 'Bills': 'amber',
            'Health': 'rose', 'Travel': 'indigo', 'Entertainment': 'purple', 'Salary': 'emerald',
            'Investment': 'teal', 'Other': 'slate',
        };
        const colorId = colorMap[name] || 'slate';
        return CATEGORY_COLORS.find(c => c.id === colorId) || CATEGORY_COLORS[9];
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Layers size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900">Global Category Management</h2>
                    <p className="text-sm font-medium text-slate-500">Manage categories available to all new users</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Area */}
                <div className="md:col-span-1 bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
                    <h3 className="text-sm font-black text-slate-900 mb-4">{editingCatId ? 'Edit Category' : 'Create Global Category'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">Type</label>
                            <div className="flex gap-2">
                                <button onClick={() => setForm({ ...form, type: 'expense' })} className={`flex-1 py-2 text-xs font-bold rounded-lg ${form.type === 'expense' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>Expense</button>
                                <button onClick={() => setForm({ ...form, type: 'income' })} className={`flex-1 py-2 text-xs font-bold rounded-lg ${form.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>Income</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">Select Icon</label>
                            <div className="h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl p-2 grid grid-cols-4 gap-2">
                                {window.AVAILABLE_ICONS || AVAILABLE_ICONS.map(ic => {
                                    const Ic = ic.component;
                                    return (
                                        <button
                                            key={ic.name}
                                            onClick={() => setForm({ ...form, icon_key: ic.name })}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${form.icon_key === ic.name ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500' : 'text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            <Ic size={16} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="pt-2 flex gap-2">
                            <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                            </button>
                            {editingCatId && (
                                <button onClick={() => { setEditingCatId(null); setForm({ name: '', type: 'expense', icon_key: 'Tag' }); }} className="px-3 py-2.5 bg-slate-200 rounded-xl text-slate-500 hover:bg-slate-300">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* List Area */}
                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categories.map(cat => {
                            const IconComp = getIconComponent(cat.icon_key || cat.name);
                            const catColor = getColor(cat.name);
                            return (
                                <div key={cat.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 transition-all group">
                                    <div className={`w-10 h-10 rounded-xl ${catColor.bg} ${catColor.text} flex items-center justify-center flex-shrink-0`}>
                                        {IconComp && <IconComp size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-bold text-slate-800 block truncate">{cat.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{cat.type}</span>
                                    </div>
                                    <button onClick={() => { setEditingCatId(cat.id); setForm({ name: cat.name, type: cat.type, icon_key: cat.icon_key || cat.name }); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                        {categories.length === 0 && (
                            <div className="col-span-2 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-sm font-bold text-slate-400">No global categories found.</p>
                                <p className="text-xs text-slate-400 mt-1">Users will see default constants instead.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
