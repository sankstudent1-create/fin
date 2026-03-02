import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';

const geoUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

export const AdminMapAnimation = ({ sessions }) => {
    const [markers, setMarkers] = useState([]);
    const [hoveredLocation, setHoveredLocation] = useState(null);

    // Default static points if data isn't enough to make it look active (for aesthetics)
    // Only used to make the map look active if real data has no coordinates
    const fallbackLocations = [
        { loc: 'New York, USA', lat: 40.7128, lon: -74.0060 },
        { loc: 'London, UK', lat: 51.5074, lon: -0.1278 },
        { loc: 'Singapore', lat: 1.3521, lon: 103.8198 },
        { loc: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
        { loc: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 }
    ];

    useEffect(() => {
        let activeMarkers = [];

        sessions.forEach(session => {
            if (session.geo_location) {
                try {
                    // Try parsing JSON format we just introduced
                    if (session.geo_location.startsWith('{')) {
                        const parsed = JSON.parse(session.geo_location);
                        if (parsed.lat && parsed.lon) {
                            activeMarkers.push({
                                id: session.id,
                                loc: parsed.loc,
                                lat: parseFloat(parsed.lat),
                                lon: parseFloat(parsed.lon),
                                device: session.user_devices?.device_name || 'Unknown',
                                time: new Date(session.session_start).toLocaleTimeString()
                            });
                        }
                    } else if (session.geo_location.includes(',')) {
                        // String like "Mumbai, India", we could match it to a fallback or simulate
                        const match = fallbackLocations.find(f => f.loc.toLowerCase().includes(session.geo_location.split(',')[0].toLowerCase()));
                        if (match) {
                            activeMarkers.push({
                                id: session.id,
                                loc: session.geo_location,
                                lat: match.lat,
                                lon: match.lon,
                                device: session.user_devices?.device_name || 'Unknown',
                                time: new Date(session.session_start).toLocaleTimeString()
                            });
                        }
                    }
                } catch (e) {
                    console.log('Failed to parse geo locating for map', e);
                }
            }
        });

        // Add some random fallbacks to make the map look alive if we have fewer than 3 points
        if (activeMarkers.length < 3) {
            fallbackLocations.forEach((fb, index) => {
                if (!activeMarkers.find(m => m.loc === fb.loc)) {
                    activeMarkers.push({
                        id: `fallback-${index}`,
                        loc: fb.loc,
                        lat: fb.lat,
                        lon: fb.lon,
                        device: 'Simulated Device',
                        time: new Date().toLocaleTimeString(),
                        isSimulated: true
                    });
                }
            });
        }

        setMarkers(activeMarkers);
    }, [sessions]);

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <MapPin className="text-indigo-500" /> Active Users Map
                    </h2>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Live Geographic Distribution</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Users size={24} className="text-indigo-500" />
                </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[400px] bg-indigo-50/30 rounded-3xl overflow-hidden mt-6 border border-slate-100 flex items-center justify-center">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 130,
                        center: [0, 40] // Center higher up for better look
                    }}
                    width={800}
                    height={400}
                    style={{ width: "100%", height: "100%" }}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#E2E8F0" // slate-200
                                    stroke="#F8FAFC" // slate-50
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#CBD5E1", outline: "none" }, // slate-300
                                        pressed: { outline: "none" },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            coordinates={[marker.lon, marker.lat]}
                            onMouseEnter={() => setHoveredLocation(marker)}
                            onMouseLeave={() => setHoveredLocation(null)}
                        >
                            <motion.g
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <motion.circle
                                    r={6}
                                    fill="#6366f1" // indigo-500
                                    className="cursor-pointer"
                                    animate={{ r: [6, 12, 6] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                    style={{ opacity: 0.6 }}
                                />
                                <circle r={4} fill="#4f46e5" className="cursor-pointer" /> {/* indigo-600 */}
                            </motion.g>
                        </Marker>
                    ))}
                </ComposableMap>

                {/* Animated Pulsing overlays for aesthetics */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/20"></div>

                {/* Tooltip Overlay */}
                <AnimatePresence>
                    {hoveredLocation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white p-3 rounded-2xl shadow-xl flex items-center gap-4 z-10 min-w-[200px]"
                        >
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-black truncate max-w-[150px]">{hoveredLocation.loc}</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">{hoveredLocation.device}</p>
                                {hoveredLocation.isSimulated && (
                                    <p className="text-[9px] text-amber-500 font-bold mt-1">Simulated User</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
