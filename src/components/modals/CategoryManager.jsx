import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, Trash2, Check, ChevronLeft, Loader2 } from 'lucide-react';
import { DEFAULT_CATEGORIES, ICON_MAP, AVAILABLE_ICONS, CATEGORY_COLORS } from '../../config/constants';
import { supabase } from '../../config/supabase';

/**
 * Default category objects (used when Supabase has no custom data yet)
 */
const DEFAULT_CAT_OBJECTS = DEFAULT_CATEGORIES.map(name => ({
    name,
    icon_key: name,          // key into ICON_MAP
    type: ['Salary', 'Investment'].includes(name) ? 'income' : 'expense',
    usage_count: 5,
    isEmoji: false,
}));

/**
 * Get the icon component for a category name from the global categories list
 */
export const getCategoryIcon = (name, categories = []) => {
    const match = categories.find(c => c.name === name);
    if (match) {
        if (match.isEmoji) return null; // emoji categories don't use icon components
        if (ICON_MAP[match.icon_key]) return ICON_MAP[match.icon_key];
    }
    if (ICON_MAP[name]) return ICON_MAP[name];
    return ICON_MAP['Other'];
};

/**
 * Get the color info for a category
 */
export const getCategoryColor = (name) => {
    const colorMap = {
        'Shopping': 'rose', 'Food': 'orange', 'Transport': 'blue', 'Bills': 'amber',
        'Health': 'rose', 'Travel': 'indigo', 'Entertainment': 'purple', 'Salary': 'emerald',
        'Investment': 'teal', 'Other': 'slate',
    };
    const colorId = colorMap[name] || 'slate';
    return CATEGORY_COLORS.find(c => c.id === colorId) || CATEGORY_COLORS[9];
};

/**
 * Fetch categories from Supabase, merging with defaults
 */
export const fetchCategories = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('usage_count', { ascending: false });

        if (!error && data && data.length > 0) {
            // Merge: defaults + custom (avoid name duplicates)
            const customNames = data.map(c => c.name);
            const missingDefaults = DEFAULT_CAT_OBJECTS.filter(d => !customNames.includes(d.name));
            const merged = [...data, ...missingDefaults];
            // Cache
            localStorage.setItem(`cached_cat_${userId}`, JSON.stringify(merged));
            return merged;
        }
    } catch (e) {
        console.error('Category fetch error:', e);
    }

    // Fallback: try cache, then defaults
    try {
        const cached = localStorage.getItem(`cached_cat_${userId}`);
        if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }

    return [...DEFAULT_CAT_OBJECTS];
};

/**
 * CategoryManager — full-screen modal for managing categories with Supabase
 */
export const CategoryManager = ({ isOpen, onClose, onCategoriesChange, userId }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [editingCat, setEditingCat] = useState(null); // category object being edited

    // Form state
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState('Tag');
    const [editType, setEditType] = useState('expense');
    const [editIsEmoji, setEditIsEmoji] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            fetchCategories(userId).then(cats => {
                setCategories(cats);
                setLoading(false);
            });
        }
    }, [isOpen, userId]);

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
    }, [categories]);

    const startAdd = () => {
        setEditName('');
        setEditIcon('Tag');
        setEditType('expense');
        setEditIsEmoji(false);
        setEditingCat(null);
        setShowAdd(true);
    };

    const startEdit = (cat) => {
        setEditName(cat.name);
        setEditIcon(cat.icon_key || cat.name);
        setEditType(cat.type || 'expense');
        setEditIsEmoji(cat.isEmoji || false);
        setEditingCat(cat);
        setShowAdd(true);
    };

    const confirmAddEdit = async () => {
        if (!editName.trim() || saving) return;
        setSaving(true);

        const catData = {
            name: editName.trim(),
            icon_key: editIcon,
            type: editType,
            isEmoji: editIsEmoji,
        };

        try {
            if (editingCat?.id) {
                // UPDATE existing in Supabase
                const { error } = await supabase
                    .from('categories')
                    .update(catData)
                    .eq('id', editingCat.id);

                if (!error) {
                    const updated = categories.map(c =>
                        c.id === editingCat.id ? { ...c, ...catData } : c
                    );
                    setCategories(updated);
                    onCategoriesChange?.(updated);
                }
            } else {
                // Check for duplicates
                if (categories.some(c => c.name.toLowerCase() === editName.trim().toLowerCase())) {
                    setSaving(false);
                    return;
                }

                // INSERT new into Supabase
                const { data, error } = await supabase
                    .from('categories')
                    .insert([{
                        user_id: userId,
                        ...catData,
                        usage_count: 0,
                    }])
                    .select();

                if (!error && data?.[0]) {
                    const updated = [...categories, data[0]];
                    setCategories(updated);
                    onCategoriesChange?.(updated);
                }
            }
        } catch (e) {
            console.error('Category save error:', e);
        }

        setSaving(false);
        setShowAdd(false);
        setEditingCat(null);
    };

    const handleDelete = async (cat) => {
        if (!cat.id) {
            // It's a default category (no Supabase id), just remove from state
            const updated = categories.filter(c => c.name !== cat.name);
            setCategories(updated);
            onCategoriesChange?.(updated);
            return;
        }

        try {
            const { error } = await supabase.from('categories').delete().eq('id', cat.id);
            if (!error) {
                const updated = categories.filter(c => c.id !== cat.id);
                setCategories(updated);
                onCategoriesChange?.(updated);
            }
        } catch (e) {
            console.error('Category delete error:', e);
        }
    };

    if (!isOpen) return null;

    const getIconComponent = (iconKey) => {
        if (ICON_MAP[iconKey]) return ICON_MAP[iconKey];
        const match = AVAILABLE_ICONS.find(i => i.name === iconKey);
        if (match) return match.component;
        return ICON_MAP['Other'];
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white w-full sm:max-w-md sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-2">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Manage Categories</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Add, edit, or remove transaction categories</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Category List */}
                <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-orange-500" size={28} />
                        </div>
                    ) : sortedCategories.map((cat, i) => {
                        const IconComp = cat.isEmoji ? null : getIconComponent(cat.icon_key || cat.name);
                        const catColor = getCategoryColor(cat.name);
                        return (
                            <motion.div
                                key={`${cat.name}-${cat.id || i}`}
                                layout
                                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 transition-all group"
                            >
                                <div className={`w-10 h-10 rounded-xl ${catColor.bg} ${catColor.text} flex items-center justify-center flex-shrink-0 text-lg`}>
                                    {cat.isEmoji ? cat.icon_key : (IconComp && <IconComp size={18} />)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-bold text-slate-800 truncate block">{cat.name}</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase">{cat.type} • {cat.usage_count || 0} uses</span>
                                </div>
                                <button
                                    onClick={() => startEdit(cat)}
                                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all opacity-60 group-hover:opacity-100"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat)}
                                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all opacity-60 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Add Button */}
                <div className="p-6 pt-2">
                    <button
                        onClick={startAdd}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 active:scale-[0.97] transition-all shadow-xl shadow-slate-900/10"
                    >
                        <Plus size={18} /> Add New Category
                    </button>
                </div>

                {/* Add/Edit Sheet */}
                <AnimatePresence>
                    {showAdd && (
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="absolute inset-0 bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] z-10 flex flex-col"
                        >
                            {/* Edit Header */}
                            <div className="flex items-center gap-3 p-6 pb-4">
                                <button onClick={() => { setShowAdd(false); }} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100">
                                    <ChevronLeft size={20} />
                                </button>
                                <h4 className="text-lg font-black text-slate-900">{editingCat ? 'Edit Category' : 'New Category'}</h4>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 space-y-5">
                                {/* Preview */}
                                <div className="flex items-center justify-center py-3">
                                    {(() => {
                                        const PreviewIcon = editIsEmoji ? null : getIconComponent(editIcon);
                                        const previewColor = getCategoryColor(editName);
                                        return (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-16 h-16 rounded-2xl ${previewColor.bg} ${previewColor.text} flex items-center justify-center shadow-lg text-2xl`}>
                                                    {editIsEmoji ? editIcon : (PreviewIcon && <PreviewIcon size={28} />)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{editName || 'Category Name'}</span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Name Input */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="e.g. Groceries"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-900 outline-none focus:border-orange-400 transition-all"
                                        autoFocus
                                    />
                                </div>

                                {/* Type Toggle */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category Type</label>
                                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                                        {['expense', 'income'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setEditType(type)}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${editType === type
                                                        ? (type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg')
                                                        : 'text-slate-400'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Icon Mode Toggle */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose Icon</label>
                                        <button
                                            onClick={() => setEditIsEmoji(!editIsEmoji)}
                                            className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg hover:bg-orange-100 transition-colors"
                                        >
                                            {editIsEmoji ? '← Use Icons' : 'Use Emoji →'}
                                        </button>
                                    </div>

                                    {editIsEmoji ? (
                                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                                            <input
                                                type="text"
                                                placeholder="Type an emoji 🎯"
                                                className="w-full bg-transparent outline-none text-center text-3xl"
                                                maxLength={2}
                                                value={editIcon}
                                                onChange={e => setEditIcon(e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-7 gap-2 max-h-40 overflow-y-auto">
                                            {AVAILABLE_ICONS.map(ic => {
                                                const Ic = ic.component;
                                                const isActive = editIcon === ic.name;
                                                return (
                                                    <button
                                                        key={ic.name}
                                                        onClick={() => setEditIcon(ic.name)}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive
                                                            ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-400 scale-110'
                                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        <Ic size={18} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Confirm */}
                            <div className="p-6 pt-2">
                                <button
                                    onClick={confirmAddEdit}
                                    disabled={!editName.trim() || saving}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.97] transition-all disabled:opacity-40"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    {editingCat ? 'Save Changes' : 'Add Category'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};
