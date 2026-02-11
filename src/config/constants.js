import {
    Coffee, ShoppingBag, Car, Zap, Home, Heart, Smartphone, Briefcase,
    Laptop, Gift, Star, PieChart, Coins, TrendingUp, ShieldCheck, Baby,
    Percent, Camera, WifiOff, RefreshCw, LayoutDashboard, FileText, Tag,
    Globe, Smile, CreditCard, Wallet, Settings, Bell, Search, Image as ImageIcon, Scan, Lock
} from 'lucide-react';

export const ICON_MAP = {
    Coffee, ShoppingBag, Car, Zap, Home, Heart, Smartphone, Briefcase,
    Laptop, Gift, Star, PieChart, Coins, TrendingUp, ShieldCheck, Baby,
    Percent, Camera, WifiOff, RefreshCw, LayoutDashboard, FileText, Tag,
    Globe, Smile, CreditCard, Wallet, Settings, Bell, Search, ImageIcon, Scan
};

export const DEFAULT_CATEGORIES = [
    { name: 'Food', icon_key: 'Coffee', type: 'expense', usage_count: 10 },
    { name: 'Shopping', icon_key: 'ShoppingBag', type: 'expense', usage_count: 8 },
    { name: 'Travel', icon_key: 'Car', type: 'expense', usage_count: 6 },
    { name: 'Bills', icon_key: 'Zap', type: 'expense', usage_count: 5 },
    { name: 'Rent', icon_key: 'Home', type: 'expense', usage_count: 4 },
    { name: 'Salary', icon_key: 'Briefcase', type: 'income', usage_count: 10 },
    { name: 'Freelance', icon_key: 'Laptop', type: 'income', usage_count: 5 },
    { name: 'PhonePe Refer', icon_key: 'Smartphone', type: 'income', usage_count: 3 },
    { name: 'Paytm Refer', icon_key: 'Wallet', type: 'income', usage_count: 3 },
    { name: 'GPay Refer', icon_key: 'CreditCard', type: 'income', usage_count: 3 },
];

export const TOOLS = [
    { id: 'sip', name: 'SIP', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'lumpsum', name: 'Lumpsum', icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 'fd', name: 'FD', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { id: 'ppf', name: 'PPF', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'interest', name: 'Interest', icon: Percent, color: 'text-orange-600', bg: 'bg-orange-100' },
];

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
