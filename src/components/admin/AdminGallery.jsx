import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Image as ImageIcon, Loader2, Trash2, ExternalLink } from 'lucide-react';

export const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadImages = async () => {
        setLoading(true);
        // Assuming we are fetching from 'campaigns' and 'avatars' buckets here. But mostly campaigns.
        const { data, error } = await supabase.storage.from('campaigns').list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
        });

        if (error) {
            console.error(error);
        } else {
            // Get public URLs for each image
            const imageObjects = data
                .filter(file => file.name !== '.emptyFolderPlaceholder')
                .map(file => {
                    const { data: { publicUrl } } = supabase.storage.from('campaigns').getPublicUrl(file.name);
                    return { ...file, publicUrl };
                });
            setImages(imageObjects);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadImages();
    }, []);

    const handleDelete = async (fileName) => {
        if (!window.confirm(`Delete ${fileName} permanently?`)) return;

        const { error } = await supabase.storage.from('campaigns').remove([fileName]);
        if (!error) {
            setImages(prev => prev.filter(img => img.name !== fileName));
        } else {
            alert('Failed to delete image');
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-xl flex items-center justify-center">
                    <ImageIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900">Media Gallery</h2>
                    <p className="text-sm font-medium text-slate-500">Manage all uploaded campaign images from your storage buckets</p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center text-pink-500"><Loader2 className="animate-spin" size={32} /></div>
            ) : images.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No images found in the campaigns bucket.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img) => (
                        <div key={img.id} className="group relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden aspect-square flex flex-col justify-between">
                            <div className="flex-1 w-full h-full relative">
                                <img src={img.publicUrl} alt={img.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                    <p className="text-[10px] font-bold text-white truncate w-full mb-1" title={img.name}>{img.name}</p>
                                    <p className="text-[10px] text-slate-300 font-medium tracking-wider mb-2">{(img.metadata?.size / 1024).toFixed(1)} KB</p>
                                    <div className="flex gap-2">
                                        <a href={img.publicUrl} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-colors">
                                            <ExternalLink size={14} />
                                        </a>
                                        <button onClick={() => handleDelete(img.name)} className="flex-1 py-1.5 bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
