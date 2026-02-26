
import { ShoppingBag, Coffee, Car, Zap, Heart, Smartphone, Home, Plane, Gift, Dumbbell, Briefcase, BookOpen, Music, Film, User, Shield, CreditCard, DollarSign, Percent, Utensils, Wifi, Fuel, Banknote, GraduationCap, Baby, PawPrint, Flower2, Gamepad2, Pizza, ShoppingCart, Bus, Stethoscope, Landmark, Scissors, Sparkles, Tag, Calendar } from 'lucide-react';

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const TOOLS = [
    { id: 'sip', name: 'SIP', icon: DollarSign, bg: 'bg-blue-100', color: 'text-blue-600' },
    { id: 'lumpsum', name: 'Lumpsum', icon: CreditCard, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    { id: 'fd', name: 'Fixed Deposit', icon: Shield, bg: 'bg-amber-100', color: 'text-amber-600' },
    { id: 'ppf', name: 'PPF', icon: Briefcase, bg: 'bg-indigo-100', color: 'text-indigo-600' },
    { id: 'interest', name: 'Interest', icon: Percent, bg: 'bg-slate-100', color: 'text-slate-600' },
    { id: 'age', name: 'Age Calc', icon: Calendar, bg: 'bg-pink-100', color: 'text-pink-600' },
];

export const DEFAULT_CATEGORIES = [
    'Shopping', 'Food', 'Transport', 'Bills', 'Health', 'Travel', 'Entertainment', 'Salary', 'Investment', 'Other'
];

// Full icon map — used for category display AND for the category editor icon picker
export const ICON_MAP = {
    'Shopping': ShoppingBag,
    'Food': Coffee,
    'Transport': Car,
    'Bills': Zap,
    'Health': Heart,
    'Tech': Smartphone,
    'Home': Home,
    'Travel': Plane,
    'Gifts': Gift,
    'Fitness': Dumbbell,
    'Work': Briefcase,
    'Education': BookOpen,
    'Music': Music,
    'Movies': Film,
    'Personal': User,
    'Insurance': Shield,
    'Salary': DollarSign,
    'Investment': DollarSign,
    'Entertainment': Gamepad2,
    'Groceries': ShoppingCart,
    'Dining': Utensils,
    'Internet': Wifi,
    'Fuel': Fuel,
    'EMI': Banknote,
    'Tuition': GraduationCap,
    'Kids': Baby,
    'Pets': PawPrint,
    'Beauty': Flower2,
    'Pizza': Pizza,
    'Bus': Bus,
    'Medical': Stethoscope,
    'Bank': Landmark,
    'Salon': Scissors,
    'Subscriptions': Sparkles,
    'Other': Tag,
};

// Available icons for the category editor
export const AVAILABLE_ICONS = [
    { name: 'ShoppingBag', component: ShoppingBag },
    { name: 'Coffee', component: Coffee },
    { name: 'Car', component: Car },
    { name: 'Zap', component: Zap },
    { name: 'Heart', component: Heart },
    { name: 'Smartphone', component: Smartphone },
    { name: 'Home', component: Home },
    { name: 'Plane', component: Plane },
    { name: 'Gift', component: Gift },
    { name: 'Dumbbell', component: Dumbbell },
    { name: 'Briefcase', component: Briefcase },
    { name: 'BookOpen', component: BookOpen },
    { name: 'Music', component: Music },
    { name: 'Film', component: Film },
    { name: 'User', component: User },
    { name: 'Shield', component: Shield },
    { name: 'DollarSign', component: DollarSign },
    { name: 'Utensils', component: Utensils },
    { name: 'Wifi', component: Wifi },
    { name: 'Fuel', component: Fuel },
    { name: 'Banknote', component: Banknote },
    { name: 'GraduationCap', component: GraduationCap },
    { name: 'Baby', component: Baby },
    { name: 'PawPrint', component: PawPrint },
    { name: 'Flower2', component: Flower2 },
    { name: 'Gamepad2', component: Gamepad2 },
    { name: 'Pizza', component: Pizza },
    { name: 'ShoppingCart', component: ShoppingCart },
    { name: 'Bus', component: Bus },
    { name: 'Stethoscope', component: Stethoscope },
    { name: 'Landmark', component: Landmark },
    { name: 'Scissors', component: Scissors },
    { name: 'Sparkles', component: Sparkles },
    { name: 'Tag', component: Tag },
    { name: 'CreditCard', component: CreditCard },
    { name: 'Percent', component: Percent },
];

// Category color palette for the category editor
export const CATEGORY_COLORS = [
    { id: 'rose', bg: 'bg-rose-100', text: 'text-rose-600', hex: '#f43f5e' },
    { id: 'orange', bg: 'bg-orange-100', text: 'text-orange-600', hex: '#f97316' },
    { id: 'amber', bg: 'bg-amber-100', text: 'text-amber-600', hex: '#f59e0b' },
    { id: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600', hex: '#10b981' },
    { id: 'teal', bg: 'bg-teal-100', text: 'text-teal-600', hex: '#14b8a6' },
    { id: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', hex: '#3b82f6' },
    { id: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-600', hex: '#6366f1' },
    { id: 'purple', bg: 'bg-purple-100', text: 'text-purple-600', hex: '#a855f7' },
    { id: 'pink', bg: 'bg-pink-100', text: 'text-pink-600', hex: '#ec4899' },
    { id: 'slate', bg: 'bg-slate-100', text: 'text-slate-600', hex: '#64748b' },
];
