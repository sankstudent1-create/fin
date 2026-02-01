import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

import {
  Plus, Wallet, Coffee, ShoppingBag, Car, Zap, Home, Heart, Smartphone,
  Briefcase, Laptop, Gift, Star, X, Calendar, ArrowDownLeft, ArrowUpRight,
  PieChart, List, ChevronRight, Lock, Mail, User, LogOut, Sparkles,
  TrendingUp, Percent, ShieldCheck, Coins, Download, AlertCircle, Loader2, Trash2, Camera,
  WifiOff, RefreshCw, LayoutDashboard, FileText, Edit2, Globe, Tag, Baby,
  Smile, Filter, ChevronDown, Share2, Cloud
} from 'lucide-react';
import { CalculatorModal } from './components/Calculators';
import { AnalyticsDashboard } from './components/Analytics';
import { generateEmailLink } from './utils/reportGenerator';


// --- 🟢 CONFIGURATION ---
const SUPABASE_URL = "https://rtcwtaweamrgyimyhhup.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Y3d0YXdlYW1yZ3lpbXloaHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDcyODEsImV4cCI6MjA4NTE4MzI4MX0.6bD8rcBJjoi0pRBOPEWiToPDZ_09-aVu7MgYZIS7a-8";

// --- 🌍 TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard", balance: "Balance", income: "Income", expense: "Expense", add_tx: "Add Transaction",
    categories: "Categories", analytics: "Analytics", settings: "Settings", calculators: "Calculators",
    tools: "Financial Tools", wealth_created: "Wealth Created", net_value: "Net Maturity Value",
    invested: "Invested", detailed_report: "Detailed Report", calculate: "Calculate", sign_in: "Sign In",
    new_here: "New here?", sign_up: "Sign Up", create_account: "Create Account", full_name: "Full Name",
    email: "Email", password: "Password", save: "Save", summary: "Summary", year_wise: "Year-wise Projection",
    assets: "Assets Retained", earnings: "Earnings (+)", spending: "Spending (-)", profile: "Profile",
    prev_balance: "Previous Balance", total_income: "Total Income", total_expense: "Total Expense",
    final_balance: "Final Net Balance", edit_tx: "Edit Transaction", add_transaction: "Add Transaction",
    amount: "Amount", category: "Category", description: "Description", date: "Date", share: "Share",
    weekly_flow: "Weekly Flow", income_vs_expense: "Income vs Expenses (7 Days)",
    expense_split: "Expense Split", top_categories: "Top Categories", no_expenses: "No expenses yet",
    delete_confirm: "Delete this transaction?", connect_internet: "Connect to internet to save custom categories.",
    financial_reports: "Financial Reports", report_desc: "Comprehensive analysis of your wealth",
    monthly_filter: "Monthly", custom_filter: "Custom", annual: "Annual",
    audit_log: "Audit Log / Full Transaction Ledger", no_tx: "No transactions found.",
    note: "Note", update_tx: "Update Transaction", save_tx: "Save Transaction",
    new_category: "New Category", name: "Name", icon: "Icon",
    switch_to_icons: "Switch to Icons", switch_to_emojis: "Switch to Emojis",
    create_category: "Create Category", syncing: "Syncing...", developed_by: "Developed by",
    custom: "Custom", good_morning: "Good Morning", good_afternoon: "Good Afternoon",
    good_evening: "Good Evening", recent_activity: "Recent Activity", tap_to_edit: "Tap to edit",
    all_time: "All Time", to: "to", financial_report_subject: "Financial Report",
    share_summary: "Here is my financial summary", generated_via: "Generated via",
    logout: "Log Out", language: "Language",
    tool_sip: "SIP", tool_lumpsum: "Lumpsum", tool_fd: "FD", tool_ppf: "PPF", tool_interest: "Interest",
    cat_food: "Food", cat_shopping: "Shopping", cat_travel: "Travel", cat_bills: "Bills", cat_rent: "Rent",
    cat_salary: "Salary", cat_freelance: "Freelance",
    sip_desc: "Equity Mutual Fund (MF)", lumpsum_desc: "One-time MF Investment", fd_desc: "Secure Bank Savings",
    ppf_desc: "Tax-Free Govt Scheme", interest_desc: "Simple Loan Interest",
    monthly_invest: "Monthly Investment (₹)", yearly_invest: "Yearly Investment (₹)", invest_amt: "Investment Amount (₹)",
    time_period: "Time Period (Years)", exp_ratio: "Expense Ratio (%)", return_rate: "Exp. Return Rate (% p.a)",
    ppf_info: "PPF uses fixed Govt rate ~7.1%", projection: "Projection", reset: "Reset",
    pdf_report: "PDF Report", est_tax: "Est. Tax",
    calc_subject: "Projection", calc_share_text: "I calculated my investment return on Orange Finance.",
    analysis_projections: "Investment Analysis & Projections", report_generated: "Report Generated",
    verification: "Verification", certified_ledger: "Certified Ledger Instance",
    approx_location: "Approx Location", official_extract: "Official Financial Extract",
    equity_tax_title: "Equity LTCG & STCG Analysis",
    equity_tax_desc: "Budget July 2024: Equity LTCG (>1yr) is 12.5% with ₹1.25L annual exemption. STCG (<1yr) is 20%.",
    fd_tax_title: "Interest & TDS Ledger",
    fd_tax_desc: "Interest is added to income and taxed at your slab rates. 10% TDS deducted if interest > ₹40,000.",
    ppf_tax_title: "EEE Taxation (Triple Exempt)",
    ppf_tax_desc: "Interest and Maturity are fully tax-free. Contributions are exempt up to ₹1.5L under Sec 80C.",
    std_tax_title: "Standard Taxation",
    std_tax_desc: "Taxes vary based on income slabs. Consult your CA for precise liability.",
    tax_slab_title: "Simplified Tax Slab (FY 2024-25)",
    year: "Year", invested_capital: "Invested Capital", est_returns: "Estimated Returns", cum_value: "Cumulative Value",
    report_summary: "Report Summary", audit_log_title: "Audit Log / Full Transaction Ledger",
    cashflow_momentum: "Cashflow Momentum", income_segmentation: "Income Segmentation",
    expense_segmentation: "Expense Segmentation", financial_intelligence: "Financial Intelligence",
    term_ltcg: "12.5% LTCG", term_stcg: "20% STCG", term_exemption: "₹1.25L Exemption",
    term_slab_rates: "Slab Rates", term_tds: "10% TDS", term_interest_income: "Interest Income",
    term_80c: "80C Exempt", term_tax_free_maturity: "Tax-Free Maturity", term_zero_tax: "Zero Tax",
    term_income_slab: "Income Slab", term_local_tax: "Local Tax", term_projections: "Projections",
    up_to: "Up to", above_slab: "Above"
  },
  mr: {
    dashboard: "डॅशबोर्ड", balance: "शिल्लक", income: "उत्पन्न", expense: "खर्च", add_tx: "व्यवहार जोडा",
    categories: "श्रेणी", analytics: "विश्लेषण", settings: "सेटिंग्ज", calculators: "कॅल्क्युलेटर",
    tools: "आर्थिक साधने", wealth_created: "संपत्ती निर्माण", net_value: "एकूण मूल्य",
    invested: "गुंतवणूक", detailed_report: "सविस्तर अहवाल", calculate: "गणना करा", sign_in: "लॉग इन करा",
    new_here: "नवीन आहात का?", sign_up: "नोंदणी करा", create_account: "खाते तयार करा", full_name: "पूर्ण नाव",
    email: "ईमेल", password: "पासवर्ड", save: "जतन करा", summary: "सारांश", year_wise: "वर्षनिहाय अंदाज",
    assets: "शिल्लक मालमत्ता", earnings: "कमाई (+)", spending: "खर्च (-)", profile: "प्रोफाइल",
    prev_balance: "मागील शिल्लक", total_income: "एकूण उत्पन्न", total_expense: "एकूण खर्च",
    final_balance: "अंतिम निव्वळ शिल्लक", edit_tx: "व्यवहार सुधारा", add_transaction: "व्यवहार जोडा",
    amount: "रक्कम", category: "वर्ग", description: "वर्णन", date: "तारीख", share: "शेअर करा",
    weekly_flow: "साप्ताहिक प्रवाह", income_vs_expense: "उत्पन्न विरुद्ध खर्च (७ दिवस)",
    expense_split: "खर्चाचे विभाजन", top_categories: "शीर्ष श्रेणी", no_expenses: "अद्याप कोणताही खर्च नाही",
    delete_confirm: "हा व्यवहार हटवायचा?", connect_internet: "कस्टम श्रेणी जतन करण्यासाठी इंटरनेटशी कनेक्ट करा.",
    financial_reports: "वित्तीय अहवाल", report_desc: "तुमच्या संपत्तीचे सर्वसमावेशक विश्लेषण",
    monthly_filter: "मासिक", custom_filter: "कस्टम", annual: "वार्षिक",
    audit_log: "ऑडिट लॉग / संपूर्ण व्यवहार लेजर", no_tx: "व्यवहार आढळले नाहीत.",
    note: "टीप", update_tx: "व्यवहार सुधारा", save_tx: "व्यवहार जतन करा",
    new_category: "नवीन श्रेणी", name: "नाव", icon: "चिन्ह",
    switch_to_icons: "चिन्हांवर स्विच करा", switch_to_emojis: "इमोजीवर स्विच करा",
    create_category: "श्रेणी तयार करा", syncing: "सिंक होत आहे...", developed_by: "विकसित",
    custom: "कस्टम", good_morning: "शुभ प्रभात", good_afternoon: "शुभ दुपार",
    good_evening: "शुभ संध्याकाळ", recent_activity: "अलीकडील व्यवहार", tap_to_edit: "बदलण्यासाठी टॅप करा",
    all_time: "आजवरचे", to: "ते", financial_report_subject: "आर्थिक अहवाल",
    share_summary: "येथे माझा आर्थिक सारांश आहे", generated_via: "द्वारे व्युत्पन्न",
    logout: "बाहेर पडा", language: "भाषा",
    tool_sip: "एसआयपी", tool_lumpsum: "एकरकमी", tool_fd: "मुदत ठेव", tool_ppf: "पीपीएफ", tool_interest: "व्याज",
    cat_food: "जेवण", cat_shopping: "खरेदी", cat_travel: "प्रवास", cat_bills: "बिले", cat_rent: "भाडे",
    cat_salary: "पगार", cat_freelance: "फ्रिलान्स",
    sip_desc: "इक्विटी म्युच्युअल फंड (MF)", lumpsum_desc: "एकवेळची MF गुंतवणूक", fd_desc: "सुरक्षित बँक बचत",
    ppf_desc: "करमुक्त सरकारी योजना", interest_desc: "साधे कर्ज व्याज",
    monthly_invest: "मासिक गुंतवणूक (₹)", yearly_invest: "वार्षिक गुंतवणूक (₹)", invest_amt: "गुंतवणूक रक्कम (₹)",
    time_period: "कालावधी (वर्षे)", exp_ratio: "खर्च गुणोत्तर (%)", return_rate: "अपेक्षित परतावा दर (% p.a)",
    ppf_info: "PPF अंदाजे ७.१% निश्चित सरकारी दर वापरते", projection: "सांख्यिकी", reset: "रीसेट करा",
    pdf_report: "अहवाल", est_tax: "अंदाजे कर",
    calc_subject: "अंदाज", calc_share_text: "मी ऑरेंज फायनान्सवर माझ्या गुंतवणुकीच्या परताव्याची गणना केली.",
    analysis_projections: "गुंतवणूक विश्लेषण आणि अंदाज", report_generated: "अहवाल तयार केला",
    verification: "पडताळणी", certified_ledger: "प्रमाणित खाते वही",
    approx_location: "अंदाजे स्थान", official_extract: "अधिकृत आर्थिक सारांश",
    equity_tax_title: "इक्विटी LTCG आणि STCG विश्लेषण",
    equity_tax_desc: "बजेट जुलै २०२४: इक्विटी LTCG (>१ वर्ष) १२.५% आहे, ₹१.२५ लाख वार्षिक सवलत. STCG (<१ वर्ष) २०% आहे.",
    fd_tax_title: "व्याज आणि TDS लेजर",
    fd_tax_desc: "व्याज एकूण उत्पन्नात जोडले जाते आणि तुमच्या स्लॅब दरांनुसार कर आकारला जातो. जर व्याज > ₹४०,००० असेल तर १०% TDS कापला जातो.",
    ppf_tax_title: "EEE कर आकारणी (तिहेरी सूट)",
    ppf_tax_desc: "व्याज आणि परिपक्वता पूर्णपणे करमुक्त आहे. कलम ८०सी अंतर्गत ₹१.५ लाखांपर्यंतची गुंतवणूक करमुक्त आहे.",
    std_tax_title: "मानक कर आकारणी",
    std_tax_desc: "कर उत्पन्नाच्या स्लॅबवर अवलंबून असतो. अचूक दायित्वासाठी तुमच्या CA चा सल्ला घ्या.",
    tax_slab_title: "सरलीकृत कर स्लॅब (FY २०२४-२५)",
    year: "वर्ष", invested_capital: "गुंतवलेले भांडवल", est_returns: "अपेक्षित परतावा", cum_value: "एकूण मूल्य",
    report_summary: "अहवाल सारांश", audit_log_title: "ऑडिट लॉग / संपूर्ण व्यवहार लेजर",
    cashflow_momentum: "कॅशफ्लो मोमेंटम", income_segmentation: "उत्पन्न विभाजन",
    expense_segmentation: "खर्च विभाजन", financial_intelligence: "फायनान्शिअल इंटेलिजन्स",
    term_ltcg: "१२.५% LTCG", term_stcg: "२०% STCG", term_exemption: "₹१.२५ लाख सवलत",
    term_slab_rates: "स्लॅब दर", term_tds: "१०% TDS", term_interest_income: "व्याज उत्पन्न",
    term_80c: "80C सवलत", term_tax_free_maturity: "करमुक्त परिपक्वता", term_zero_tax: "शून्य कर",
    term_income_slab: "उत्पन्न स्लॅब", term_local_tax: "स्थानिक कर", term_projections: "सांख्यिकी",
    up_to: "पर्यंत", above_slab: "किंवा अधिक"
  },
  hi: {
    dashboard: "डैशबोर्ड", balance: "बैलेंस", income: "आय", expense: "व्यय", add_tx: "लेनदेन जोड़ें",
    categories: "श्रेणियाँ", analytics: "विश्लेषण", settings: "सेटिंग्स", calculators: "कैलकुलेटर",
    tools: "वित्तीय उपकरण", wealth_created: "संपदा निर्माण", net_value: "कुल मूल्य",
    invested: "निवेश", detailed_report: "विस्तृत रिपोर्ट", calculate: "गणना करें", sign_in: "लॉग इन करें",
    new_here: "क्या आप नए हैं?", sign_up: "साइन अप करें", create_account: "खाता बनाएं", full_name: "पूरा नाम",
    email: "ईमेल", password: "पासवर्ड", save: "सहेजें", summary: "सारांश", year_wise: "वर्षवार अनुमान",
    assets: "बची हुई संपत्ति", earnings: "आय (+)", spending: "खर्च (-)", profile: "प्रोफाइल",
    prev_balance: "पिछला बैलेंस", total_income: "कुल आय", total_expense: "कुल खर्च",
    final_balance: "अंतिम नेट बैलेंस", edit_tx: "लेनदेन संपादित करें", add_transaction: "लेनदेन जोड़ें",
    amount: "राशि", category: "श्रेणी", description: "विवरण", date: "तारीख", share: "साझा करें",
    weekly_flow: "साप्ताहिक प्रवाह", income_vs_expense: "आय बनाम खर्च (७ दिन)",
    expense_split: "व्यय विभाजन", top_categories: "शीर्ष श्रेणियां", no_expenses: "अभी तक कोई खर्च नहीं",
    delete_confirm: "क्या आप इस लेनदेन को हटाना चाहते हैं?", connect_internet: "कस्टम श्रेणियां सहेजने के लिए इंटरनेट से कनेक्ट करें।",
    financial_reports: "वित्तीय रिपोर्ट", report_desc: "आपकी संपत्ति का व्यापक विश्लेषण",
    monthly_filter: "मासिक", custom_filter: "कस्टम", annual: "वार्षिक",
    audit_log: "ऑडिट लॉग / पूर्ण लेनदेन लेजर", no_tx: "कोई लेनदेन नहीं मिला।",
    note: "नोट", update_tx: "लेनदेन अपडेट करें", save_tx: "लेनदेन सहेजें",
    new_category: "नई श्रेणी", name: "नाम", icon: "आइकन",
    switch_to_icons: "आइकन पर स्विच करें", switch_to_emojis: "इमोजी पर स्विच करें",
    create_category: "श्रेणी बनाएं", syncing: "सिंक हो रहा है...", developed_by: "विकसित",
    custom: "कस्टम", good_morning: "शुभ प्रभात", good_afternoon: "शुभ दोपहर",
    good_evening: "शुभ संध्या", recent_activity: "हाल की गतिविधि", tap_to_edit: "संपादित करने के लिए टैप करें",
    all_time: "अब तक का", to: "से", financial_report_subject: "वित्तीय रिपोर्ट",
    share_summary: "यहाँ मेरा वित्तीय सारांश है", generated_via: "द्वारा निर्मित",
    logout: "लॉग आउट", language: "भाषा",
    tool_sip: "एसआईपी", tool_lumpsum: "एकमुश्त", tool_fd: "एफडी", tool_ppf: "पीपीएफ", tool_interest: "ब्याज",
    cat_food: "खाना", cat_shopping: "खरीदारी", cat_travel: "यात्रा", cat_bills: "बिल", cat_rent: "किराया",
    cat_salary: "वेतन", cat_freelance: "फ्रीलांस",
    sip_desc: "इक्विटी म्यूचुअल फंड (MF)", lumpsum_desc: "एकमुश्त MF निवेश", fd_desc: "सुरक्षित बैंक बचत",
    ppf_desc: "कर-मुक्त सरकारी योजना", interest_desc: "साधारण ऋण ब्याज",
    monthly_invest: "मासिक निवेश (₹)", yearly_invest: "वार्षिक निवेश (₹)", invest_amt: "निवेश राशि (₹)",
    time_period: "समय अवधि (वर्ष)", exp_ratio: "व्यय अनुपात (%)", return_rate: "अनुमानित रिटर्न दर (% p.a)",
    ppf_info: "PPF लगभग ७.१% निश्चित सरकारी दर का उपयोग करता है", projection: "अनुमान", reset: "रीसेट",
    pdf_report: "रिपोर्ट", est_tax: "अंदाजित कर",
    calc_subject: "अनुमान", calc_share_text: "मैंने ऑरेंज फाइनेंस पर अपने निवेश रिटर्न की गणना की।",
    analysis_projections: "निवेश विश्लेषण और अनुमान", report_generated: "रिपोर्ट तैयार की गई",
    verification: "सत्यापन", certified_ledger: "प्रमाणित लेजर इंस्टेंस",
    approx_location: "अनुमानित स्थान", official_extract: "आधिकारिक वित्तीय उद्धरण",
    equity_tax_title: "इक्विटी LTCG और STCG विश्लेषण",
    equity_tax_desc: "बजट जुलाई 2024: इक्विटी LTCG (>1 वर्ष) 12.5% है, जिसमें ₹1.25L वार्षिक छूट है। STCG (<1 वर्ष) 20% है।",
    fd_tax_title: "ब्याज और TDS लेजर",
    fd_tax_desc: "ब्याज को कुल आय में जोड़ा जाता है और आपके स्लैब दरों पर कर लगाया जाता है। यदि ब्याज > ₹40,000 है तो 10% TDS काटा जाता है।",
    ppf_tax_title: "EEE कराधान (तिहरी छूट)",
    ppf_tax_desc: "ब्याज और परिपक्वता पूरी तरह से कर-मुक्त हैं। धारा 80C के तहत ₹1.5L तक का योगदान मुक्त है।",
    std_tax_title: "मानक कराधान",
    std_tax_desc: "कर आय स्लैब के आधार पर भिन्न होते हैं। सटीक देयता के लिए अपने CA से परामर्श करें।",
    tax_slab_title: "सरलीकृत कर स्लैब (FY 2024-25)",
    year: "वर्ष", invested_capital: "निवेशित पूंजी", est_returns: "अनुमानित रिटर्न", cum_value: "संचयी मूल्य",
    report_summary: "रिपोर्ट सारांश", audit_log_title: "ऑडिट लॉग / पूर्ण लेनदेन लेजर",
    cashflow_momentum: "कैशफ्लो मोमेंटम", income_segmentation: "आय विभाजन",
    expense_segmentation: "व्यय विभाजन", financial_intelligence: "फाइनेंशियल इंटेलिजेंस",
    term_ltcg: "12.5% LTCG", term_stcg: "20% STCG", term_exemption: "₹1.25L की छूट",
    term_slab_rates: "स्लैब दरें", term_tds: "10% TDS", term_interest_income: "ब्याज आय",
    term_80c: "80C छूट", term_tax_free_maturity: "कर-मुक्त परिपक्वता", term_zero_tax: "शून्य कर",
    term_income_slab: "आय स्लैब", term_local_tax: "स्थानीय कर", term_projections: "अनुमान",
    up_to: "तक", above_slab: "से अधिक"
  },
  te: {
    dashboard: "డాష్‌బోర్డ్", balance: "బ్యాలెన్స్", income: "ఆదాయం", expense: "ఖర్చు", add_tx: "లావాదేవీని జోడించు",
    categories: "వర్గాలు", analytics: "విశ్లేషణ", settings: "సెట్టింగ్‌లు", calculators: "క్యాలిక్యులేటర్లు",
    tools: "ఆర్థిక సాధనాలు", wealth_created: "సంపద సృష్టి", net_value: "మొత్తం విలువ",
    invested: "పెట్టుబడి", detailed_report: "వివరణాత్మక నివేదిక", calculate: "లెక్కించు", sign_in: "లాగిన్ అవ్వండి",
    new_here: "కొత్త వారా?", sign_up: "సైన్ అప్ అవ్వండి", create_account: "ఖాతాను సృష్టించు", full_name: "పూర్తి పేరు",
    email: "ఈమెయిల్", password: "పాస్‌వర్డ్", save: "సేవ్ చేయి", summary: "సారాంశం", year_wise: "సంవత్సరాల వారీగా అంచనా",
    assets: "మిగిలి ఉన్న ఆస్తులు", earnings: "ఆదాయం (+)", spending: "ఖర్చులు (-)", profile: "ప్రొఫైల్",
    prev_balance: "మునుపటి బ్యాలెన్స్", total_income: "మొత్తం ఆదాయం", total_expense: "మొత్తం ఖర్చు",
    final_balance: "తుది నికర బ్యాలెన్స్", edit_tx: "లావాదేవీని సవరించు", add_transaction: "లావాదేవీని జోడించు",
    amount: "మొత్తం", category: "వర్గం", description: "వివరణ", date: "తేదీ", share: "షేర్ చేయి",
    weekly_flow: "వారపు ప్రవాహం", income_vs_expense: "ఆదాయం మరియు ఖర్చులు (7 రోజులు)",
    expense_split: "ఖర్చులు విభజన", top_categories: "ప్రధాన వర్గాలు", no_expenses: "ఇంకా ఖర్చులు లేవు",
    delete_confirm: "ఈ లావాదేవీని తొలగించాలా?", connect_internet: "కస్టమ్ వర్గాలను సేవ్ చేయడానికి ఇంటర్నెట్‌కు కనెక్ట్ అవ్వండి.",
    financial_reports: "ఆర్థిక నివేదికలు", report_desc: "మీ సంపద యొక్క సమగ్ర విశ్లేషణ",
    monthly_filter: "నెలవారీ", custom_filter: "కస్టమ్", annual: "వార్షిక",
    audit_log: "ఆడిట్ లాగ్ / పూర్తి లావాదేవీల లెడ్జర్", no_tx: "లావాదేవీలు ఏవీ లేవు.",
    note: "గమనిక", update_tx: "లావాదేవీని నవీకరించు", save_tx: "లావాదేవీని సేవ్ చేయి",
    new_category: "కొత్త వర్గం", name: "పేరు", icon: "చిహ్నం",
    switch_to_icons: "చిహ్నాలకు మారండి", switch_to_emojis: "ఎమోజీలకు మారండి",
    create_category: "వర్గాన్ని సృష్టించు", syncing: "సింక్ అవుతోంది...", developed_by: "అభివృద్ధి",
    custom: "కస్టమ్", good_morning: "శుభోదయం", good_afternoon: "శుభ మధ్యాహ్నం",
    good_evening: "శుభ సాయంత్రం", recent_activity: "ఇటీవలి కార్యకలాపాలు", tap_to_edit: "సవరించడానికి నొక్కండి",
    all_time: "అప్పటి నుండి ఇప్పటి వరకు", to: "నుండి", financial_report_subject: "ఆర్థిక నివేదిక",
    share_summary: "ఇది నా ఆర్థిక సారాంశం", generated_via: "ద్వారా రూపొందించబడింది",
    logout: "లాగ్ అవుట్", language: "భాష",
    tool_sip: "ఎస్ఐపి", tool_lumpsum: "లంప్సమ్", tool_fd: "ఎఫ్డి", tool_ppf: "పిపిఎఫ్", tool_interest: "వడ్డీ",
    cat_food: "ఆహారం", cat_shopping: "షాపింగ్", cat_travel: "ప్రయాణం", cat_bills: "బిల్లులు", cat_rent: "అద్దె",
    cat_salary: "జీతం", cat_freelance: "ఫ్రీలాన్స్",
    sip_desc: "ఈక్విటీ మ్యూచువల్ ఫండ్ (MF)", lumpsum_desc: "ఒక-సారి MF పెట్టుబడి", fd_desc: "సురక్షిత బ్యాంక్ పొదుపు",
    ppf_desc: "పన్ను రహిత ప్రభుత్వ పథకం", interest_desc: "సాధారణ రుణ వడ్డీ",
    monthly_invest: "నెలవారీ పెట్టుబడి (₹)", yearly_invest: "వార్షిక పెట్టుబడి (₹)", invest_amt: "పెట్టుబడి మొత్తం (₹)",
    time_period: "సమయం (సంవత్సరాలు)", exp_ratio: "ఖర్చు నిష్పత్తి (%)", return_rate: "ఆశించిన రాబడి రేటు (% p.a)",
    ppf_info: "PPF స్థిర ప్రభుత్వ రేటు ~7.1% ఉపయోగిస్తుంది", projection: "అంచనా", reset: "రీసెట్",
    pdf_report: "నివేదిక", est_tax: "అంచనా పన్ను",
    calc_subject: "అంచనా", calc_share_text: "నేను ఆరెంజ్ ఫైనాన్స్‌లో నా పెట్టుబడి రాబడిని లెక్కించాను.",
    analysis_projections: "పెట్టుబడి విశ్లేషణ మరియు అంచనాలు", report_generated: "నివేదిక రూపొందించబడింది",
    verification: "ధృవీకరణ", certified_ledger: "ధృవీకరించబడిన లెడ్జర్ ఉదాహరణ",
    approx_location: "సుమారు స్థానం", official_extract: "అధికారిక ఆర్థిక సారాంశం",
    equity_tax_title: "ఈక్విటీ LTCG మరియు STCG విశ్లేషణ",
    equity_tax_desc: "బడ్జెట్ జూలై 2024: ఈక్విటీ LTCG (>1 సం) 12.5% కి ₹1.25L వార్షిక మినహాయింపు ఉంది. STCG (<1 సం) 20%.",
    fd_tax_title: "వడ్డీ మరియు TDS లెడ్జర్",
    fd_tax_desc: "వడ్డీ మొత్తం ఆదాయానికి జోడించబడుతుంది మరియు మీ స్లాబ్ రేట్ల ప్రకారం పన్ను విధించబడుతుంది. వడ్డీ > ₹40,000 ఉంటే 10% TDS తీసివేయబడుతుంది.",
    ppf_tax_title: "EEE పన్ను విధానం (ట్రిపుల్ మినహాయింపు)",
    ppf_tax_desc: "వడ్డీ మరియు మెచ్యూరిటీ పూర్తి పన్ను రహితం. సెక్షన్ 80C కింద ₹1.5L వరకు మినహాయింపు ఉంది.",
    std_tax_title: "ప్రామాణిక పన్ను విధానం",
    std_tax_desc: "ఆదాయ స్లాబ్‌ల ఆధారంగా పన్నులు మారుతుంటాయి. ఖచ్చితమైన వివరాల కోసం మీ CA ని సంప్రదించండి.",
    tax_slab_title: "సరళీకృత పన్ను స్లాబ్ (FY 2024-25)",
    year: "సంవత్సరం", invested_capital: "పెట్టుబడి పెట్టిన మూలధనం", est_returns: "అంచనా రాబడి", cum_value: "మొత్తం విలువ",
    report_summary: "నివేదిక సారాంశం", audit_log_title: "ఆడిట్ లాగ్ / పూర్తి లావాదేవీల లెడ్జర్",
    cashflow_momentum: "క్యాష్ ఫ్లో మొమెంటం", income_segmentation: "ఆదాయ విభజన",
    expense_segmentation: "ఖర్చు విభజన", financial_intelligence: "ఫైనాన్షియల్ ఇంటలిజెన్స్",
    term_ltcg: "12.5% LTCG", term_stcg: "20% STCG", term_exemption: "₹1.25L మినహాయింపు",
    term_slab_rates: "స్లాబ్ రేట్లు", term_tds: "10% TDS", term_interest_income: "వడ్డీ ఆదాయం",
    term_80c: "80C మినహాయింపు", term_tax_free_maturity: "పన్ను రహిత మెచ్యూరిటీ", term_zero_tax: "సున్నా పన్ను",
    term_income_slab: "ఆదాయ స్లాబ్", term_local_tax: "స్థానిక పన్ను", term_projections: "అంచనాలు",
    up_to: "వరకు", above_slab: "పైన"
  },
};

const LANG_OPTIONS = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' }
];

// --- 🎨 SYSTEM MANAGER (Styles & Scripts) ---
const SystemManager = ({ onLoad }) => {
  useEffect(() => {
    // 1. Tailwind CSS
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        window.tailwind.config = {
          theme: {
            extend: {
              colors: {
                orange: { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c' }
              },
              fontFamily: {
                sans: ['Poppins', 'Mukta', 'Noto Sans Telugu', 'sans-serif'],
              }
            }
          }
        };
      };
      document.head.appendChild(script);
    }

    // 2. Google Fonts (Poppins & Mukta for Devanagari support)
    if (!document.getElementById('google-fonts')) {
      const link = document.createElement('link');
      link.id = 'google-fonts';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Mukta:wght@300;400;500;600;700;800&family=Noto+Sans+Telugu:wght@300;400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }

    // 3. Supabase
    if (!window.supabase) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = () => {
        const { createClient } = window.supabase;
        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        onLoad(client);
      };
      document.body.appendChild(script);
    } else {
      const { createClient } = window.supabase;
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      onLoad(client);
    }



  }, []);

  return (
    <style>{`
      body { font-family: 'Poppins', 'Mukta', 'Noto Sans Telugu', sans-serif; background-color: #fff7ed; color: #431407; -webkit-tap-highlight-color: transparent; }
      .bg-mesh { background-color: #ff9a9e; background-image: radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%); }
      .warm-shadow { box-shadow: 0 8px 30px rgba(234, 88, 12, 0.12); }
      .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #fed7aa; border-radius: 10px; }
      
      /* --- 📱 SCREEN STYLES (NO-PRINT) --- */
      .print-only { display: none !important; }
      .app-avatar { width: 40px; height: 40px; border-radius: 99px; object-fit: cover; }

      /* --- 🖨️ CONSOLIDATED PRINT ENGINE --- */
      @media print {
        @page { margin: 1cm; size: A4; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        
        html, body { 
          height: auto !important; 
          overflow: visible !important; 
          background: #fff !important; 
          font-size: 13px !important;
          color: #0f172a !important;
          zoom: 0.95;
        }
        
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        
        #print-root { width: 100%; max-width: 100%; }

        .pdf-header-classic {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2.5rem 0;
          border-bottom: 4px solid #0f172a;
          margin-bottom: 3rem;
        }
        
        .header-left .url { font-size: 26px; font-weight: 950; letter-spacing: -0.05em; color: #0f172a; }
        .header-left .sub-brand { font-size: 10px; font-weight: 800; color: #64748b !important; text-transform: uppercase; letter-spacing: 0.4em; border: none; margin-top: 10px; }
        
        .header-right { display: flex; align-items: center; gap: 24px; text-align: right; }
        .user-meta-info .name { font-size: 18px; font-weight: 900; display: block; color: #0f172a; margin-bottom: 2px; }
        .user-meta-info .email { font-size: 12px; font-weight: 700; color: #94a3b8 !important; }
        .header-avatar { width: 64px; height: 64px; border-radius: 18px; border: 3px solid #f1f5f9; object-fit: cover; }

        .report-summary-title { font-size: 24px; font-weight: 950; margin-bottom: 2rem; text-align: center; color: #0f172a; border: none; }

        .pdf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 3rem; }
        .pdf-card { padding: 1.5rem; border-radius: 2rem; border: 1px solid #f1f5f9; display: flex; flex-direction: column; justify-content: center; background: white; }
        
        .pdf-card-dark { color: white !important; }
        .pdf-card-balance { background: #0f172a !important; color: white !important; border: none; }
        .pdf-card-income { background: #065f46 !important; color: white !important; border: none; }
        .pdf-card-expense { background: #7f1d1d !important; color: white !important; border: none; }
        .pdf-card-indigo { background: #312e81 !important; color: white !important; border: none; }
        
        .pdf-card-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem; color: inherit; opacity: 0.8; }
        .pdf-card-value { font-size: 22px; font-weight: 950; color: inherit; letter-spacing: -0.02em; }

        .pdf-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; border-radius: 1rem; overflow: hidden; border: 1px solid #f1f5f9; }
        .pdf-table th { background: #f8fafc !important; color: #64748b; font-size: 11px; font-weight: 900; padding: 1rem 1.25rem; border-bottom: 2px solid #f1f5f9; text-align: left; text-transform: uppercase; }
        .pdf-table td { padding: 1rem 1.25rem; border-bottom: 1px solid #f8fafc; font-size: 13px; color: #1e293b; font-weight: 700; }
        
        .pdf-section-title { font-size: 16px; font-weight: 950; margin: 3rem 0 1.5rem; border-left: 5px solid #f97316; padding-left: 1rem; text-transform: uppercase; display: flex; align-items: center; gap: 10px; color: #0f172a; }
        
        /* Analytics Elements */
        .pdf-chart-box { background: white; border-radius: 2rem; border: 1px solid #f1f5f9; padding: 2rem; }
        .pdf-pie { width: 110px; height: 110px; border-radius: 50%; display: inline-block; border: 6px solid #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .category-bullet { width: 10px; height: 10px; border-radius: 4px; display: inline-block; margin-right: 12px; }
        .pdf-bar { width: 100%; border-radius: 8px; display: block; min-height: 4px; }
        
        .pdf-page-section { page-break-inside: avoid !important; margin-bottom: 2rem; }
        .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        
        .pdf-footer { margin-top: 4rem; padding-top: 2rem; border-t: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
        .pdf-footer p { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
      }
    `}</style>
  );
};

// --- Config ---
const ICON_MAP = { Coffee, ShoppingBag, Car, Zap, Home, Heart, Smartphone, Briefcase, Laptop, Gift, Star, PieChart, Coins, TrendingUp, ShieldCheck, Baby, Percent, Camera, WifiOff, RefreshCw, LayoutDashboard, FileText, Tag, Globe, Smile };

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon_key: 'Coffee', type: 'expense', usage_count: 10 },
  { name: 'Shopping', icon_key: 'ShoppingBag', type: 'expense', usage_count: 8 },
  { name: 'Travel', icon_key: 'Car', type: 'expense', usage_count: 6 },
  { name: 'Bills', icon_key: 'Zap', type: 'expense', usage_count: 5 },
  { name: 'Rent', icon_key: 'Home', type: 'expense', usage_count: 4 },
  { name: 'Salary', icon_key: 'Briefcase', type: 'income', usage_count: 10 },
  { name: 'Freelance', icon_key: 'Laptop', type: 'income', usage_count: 5 },
  // Requested Default Referrals
  { name: 'PhonePe Refer', icon_key: 'Smartphone', type: 'income', usage_count: 3 },
  { name: 'Paytm Refer', icon_key: 'Wallet', type: 'income', usage_count: 3 },
  { name: 'GPay Refer', icon_key: 'CreditCard', type: 'income', usage_count: 3 },
];

const TOOLS = [
  { id: 'sip', name: 'SIP', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'lumpsum', name: 'Lumpsum', icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'fd', name: 'FD', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'ppf', name: 'PPF', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 'interest', name: 'Interest', icon: Percent, color: 'text-orange-600', bg: 'bg-orange-100' },
];

// --- 🛠️ OFFLINE & SYNC HOOK ---
// Global lock to prevent parallel sync workers across remounts
let globalSyncLock = false;

const useOfflineSync = (supabase, userId, onSyncComplete) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const handleOnline = () => { if (!isOnline) setIsOnline(true); };
    const handleOffline = () => { if (isOnline) setIsOnline(false); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const heartbeat = setInterval(async () => {
      const currentlyOnline = navigator.onLine;
      if (currentlyOnline) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          await fetch(`https://www.google.com/favicon.ico?cb=${Date.now()}`, {
            mode: 'no-cors',
            signal: controller.signal,
            cache: 'no-store'
          });
          clearTimeout(timeoutId);
          if (!isOnline) setIsOnline(true);
        } catch (e) {
          if (isOnline) setIsOnline(false);
        }
      } else {
        if (isOnline) setIsOnline(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(heartbeat);
    };
  }, [isOnline]);

  useEffect(() => {
    const syncData = async () => {
      if (!userId || !supabase || globalSyncLock) return;

      const pendingKey = `pending_tx_${userId}`;
      const lockKey = `sync_lock_${userId}`;

      const getQueue = () => JSON.parse(localStorage.getItem(pendingKey) || '[]');
      if (getQueue().length === 0) return;

      // CROSS-TAB LOCK: Check if another tab is already syncing
      const lastSyncTime = parseInt(localStorage.getItem(lockKey) || '0');
      if (Date.now() - lastSyncTime < 10000) return; // Wait 10s before taking over

      globalSyncLock = true;
      if (isMounted.current) setIsSyncing(true);
      const tempIdMap = {};

      // Heartbeat for the lock to keep other tabs away
      const lockHeartbeat = setInterval(() => {
        localStorage.setItem(lockKey, Date.now().toString());
      }, 3000);

      try {
        while (true) {
          const queue = getQueue();
          if (queue.length === 0) break;

          // PAUSE if we are offline
          if (!navigator.onLine || !isOnline) {
            await new Promise(resolve => {
              const check = setInterval(() => {
                if (navigator.onLine && isOnline) {
                  clearInterval(check);
                  resolve();
                }
              }, 1000);
            });
          }

          const action = queue[0];
          try {
            // Deduplication Check: Before inserting, check if it already exists in DB
            // (Only for inserts to avoid race condition duplicates)
            if (action.action === 'INSERT') {
              const { data: existing } = await supabase.from('transactions').select('id').match({
                title: action.data.title,
                amount: action.data.amount,
                user_id: userId
              }).gte('date', new Date(Date.now() - 30000).toISOString()).limit(1);

              if (existing && existing.length > 0) {
                console.log("Skipping duplicate sync item");
                const latestQueue = getQueue();
                latestQueue.shift();
                localStorage.setItem(pendingKey, JSON.stringify(latestQueue));
                continue;
              }

              const { id: tempId, ...dataToInsert } = action.data;
              const { data, error } = await supabase.from('transactions').insert([dataToInsert]).select();
              if (!error && data?.[0] && tempId) {
                tempIdMap[tempId] = data[0].id;
              }
            } else if (action.action === 'DELETE') {
              const targetId = tempIdMap[action.id] || action.id;
              await supabase.from('transactions').delete().eq('id', targetId);
            } else if (action.action === 'UPDATE') {
              const { id: oldId, ...updates } = action.data;
              const targetId = tempIdMap[oldId] || oldId;
              await supabase.from('transactions').update(updates).eq('id', targetId);
            }

            // Success: Remove item and proceed
            const latestQueue = getQueue();
            latestQueue.shift();
            localStorage.setItem(pendingKey, JSON.stringify(latestQueue));
          } catch (e) {
            console.error("Sync Item Error:", e);
            if (e.message?.includes('fetch')) continue;
            break;
          }
        }
      } catch (err) {
        console.error("Global Sync Error:", err);
      } finally {
        clearInterval(lockHeartbeat);
        localStorage.removeItem(lockKey);
        globalSyncLock = false;
        if (isMounted.current) {
          setIsSyncing(false);
          if (getQueue().length === 0 && onSyncComplete) onSyncComplete();
        }
      }
    };
    if (isOnline) syncData();
  }, [isOnline, userId, supabase]);

  return { isOnline, isSyncing };
};

// --- 🛠️ HEAD MANAGER (PWA - META ONLY) ---
// Note: Manifest is handled by the physical file now. We only inject meta tags.
const HeadManager = () => {
  useEffect(() => {
    document.title = "Orange Finance | Swinfosystems";

    // 1. Force PWA Scaling Limits
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.name = "viewport";
      document.head.appendChild(metaViewport);
    }
    metaViewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

    // 2. Favicon (Explicitly point to root file to avoid conflict)
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = '/favicon.ico';
    document.head.appendChild(link);

    // 3. Apple Meta
    const appleMeta = document.createElement('meta');
    appleMeta.name = "apple-mobile-web-app-capable";
    appleMeta.content = "yes";
    document.head.appendChild(appleMeta);

  }, []);
  return null;
};

// --- 📊 COMPONENTS ---
// --- 📊 COMPONENTS (REMOVED REDUNDANT TRENDBARCHART) ---
// --- PRINT ANALYTICS COMPONENT (Simplified for Print) ---
const PrintAnalytics = ({ stats, transactions, t }) => {
  const maxVal = Math.max(stats.income, stats.expense, 100);
  const PDF_COLORS = ['#450a0a', '#991b1b', '#dc2626', '#f87171', '#fca5a5', '#fee2e2'];
  const INCOME_COLORS = ['#064e3b', '#065f46', '#0d9488', '#2dd4bf', '#99f6e4', '#ccfbf1'];

  const processSplit = (type) => {
    const filterTxs = transactions.filter(tx => tx.type === type);
    const grouped = {};
    filterTxs.forEach(tx => { grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount; });
    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value, percentage: (value / (total || 1)) * 100 }))
      .sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const expenseSplit = processSplit('expense');
  const incomeSplit = processSplit('income');

  const getGradient = (split, colors) => {
    let cumulative = 0;
    if (split.length === 0) return '#f1f5f9';
    const parts = split.map((cat, i) => {
      const start = cumulative; cumulative += cat.percentage;
      return `${colors[i % colors.length]} ${start}% ${cumulative}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  };

  return (
    <div className="space-y-10">
      <div className="pdf-page-section">
        <div className="pdf-chart-box">
          <p className="pdf-card-title text-center !mb-10 !text-slate-400">{t('cashflow_momentum')}</p>
          <div className="flex items-end justify-center gap-16 h-56 border-b-2 border-slate-50 pb-4">
            <div className="flex flex-col items-center justify-end h-full w-32">
              <div
                style={{ height: `${Math.max((stats.income / maxVal) * 100, 5)}%`, backgroundColor: '#059669' }}
                className="pdf-bar shadow-xl shadow-emerald-500/10"
              ></div>
              <div className="text-center mt-6">
                <span className="text-[12px] font-black text-emerald-800 block tracking-widest uppercase mb-1">{t('income')}</span>
                <span className="text-[11px] font-bold text-slate-400">₹{stats.income.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-end h-full w-32">
              <div
                style={{ height: `${Math.max((stats.expense / maxVal) * 100, 5)}%`, backgroundColor: '#e11d48' }}
                className="pdf-bar shadow-xl shadow-rose-500/10"
              ></div>
              <div className="text-center mt-6">
                <span className="text-[12px] font-black text-rose-800 block tracking-widest uppercase mb-1">{t('expense')}</span>
                <span className="text-[11px] font-bold text-slate-400">₹{stats.expense.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div>
          <div className="pdf-section-title"><TrendingUp size={18} className="text-emerald-600" /> {t('income_segmentation')}</div>
          <div className="pdf-pie-container bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm">
            <div className="pdf-pie !w-32 !h-32" style={{ background: getGradient(incomeSplit, INCOME_COLORS) }}></div>
            <div className="flex-1 space-y-4">
              {incomeSplit.map((cat, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <div className="flex items-center">
                    <span className="category-bullet" style={{ background: INCOME_COLORS[i % INCOME_COLORS.length] }}></span>
                    <span className="text-[13px] font-bold text-slate-700 truncate max-w-[120px]">
                      {t(`cat_${cat.name.toLowerCase()}`) !== `cat_${cat.name.toLowerCase()}` ? t(`cat_${cat.name.toLowerCase()}`) : cat.name}
                    </span>
                  </div>
                  <span className="text-[13px] font-black text-emerald-600">{cat.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="pdf-section-title"><PieChart size={18} className="text-rose-600" /> {t('expense_segmentation')}</div>
          <div className="pdf-pie-container bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm">
            <div className="pdf-pie !w-32 !h-32" style={{ background: getGradient(expenseSplit, PDF_COLORS) }}></div>
            <div className="flex-1 space-y-4">
              {expenseSplit.map((cat, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <div className="flex items-center">
                    <span className="category-bullet" style={{ background: PDF_COLORS[i % PDF_COLORS.length] }}></span>
                    <span className="text-[13px] font-bold text-slate-700 truncate max-w-[120px]">
                      {t(`cat_${cat.name.toLowerCase()}`) !== `cat_${cat.name.toLowerCase()}` ? t(`cat_${cat.name.toLowerCase()}`) : cat.name}
                    </span>
                  </div>
                  <span className="text-[13px] font-black text-rose-600">{cat.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

const CalculatorPrintView = ({ data, ipInfo, t, lang }) => {
  if (!data) return null;
  const { toolName, inputs, result } = data;
  const locale = lang === 'en' ? 'en-IN' : lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'te-IN';

  const profitPercent = (result.returns / (result.total || result.netTotal || 1)) * 100;
  const pieGradient = `#e2e8f0 0% ${100 - profitPercent}%, #0d9488 ${100 - profitPercent}% 100%`;

  const getTaxDeepDive = () => {
    const name = toolName.toLowerCase();
    if (name.includes('sip') || name.includes('lumpsum')) {
      return {
        title: t('equity_tax_title'),
        desc: t('equity_tax_desc'),
        terms: [t('term_ltcg'), t('term_stcg'), t('term_exemption')],
        showExpenseRatio: true,
        variant: "blue"
      };
    } else if (name.includes('fd') || name.includes('interest')) {
      return {
        title: t('fd_tax_title'),
        desc: t('fd_tax_desc'),
        terms: [t('term_slab_rates'), t('term_tds'), t('term_interest_income')],
        showExpenseRatio: false,
        variant: "slate"
      };
    } else if (name.includes('ppf')) {
      return {
        title: t('ppf_tax_title'),
        desc: t('ppf_tax_desc'),
        terms: [t('term_80c'), t('term_tax_free_maturity'), t('term_zero_tax')],
        showExpenseRatio: false,
        variant: "indigo"
      };
    }
    return { title: t('std_tax_title'), desc: t('std_tax_desc'), terms: [t('term_income_slab'), t('term_local_tax'), t('term_projections')], showExpenseRatio: false, variant: "slate" };
  };

  const taxInfo = getTaxDeepDive();
  const boxColor = taxInfo.variant === 'blue' ? 'blue' : taxInfo.variant === 'indigo' ? 'indigo' : 'slate';

  return (
    <div className="print-only" style={{ padding: '20px 0' }}>
      <div className="mb-4 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest mb-2">{t('analysis_projections')}</div>
        <h2 className="text-3xl font-black text-slate-900 leading-tight">{toolName} {t('analytics')}</h2>
        <div className="w-16 h-1 bg-[#0f172a] mx-auto mt-1 rounded-full"></div>
      </div>

      <div className="pdf-grid mb-6">
        <div className="pdf-card shadow-sm">
          <p className="pdf-card-title !text-slate-400 !mb-1">{t('invested')}</p>
          <h2 className="pdf-card-value !text-slate-800">₹{(result.invested || 0).toLocaleString()}</h2>
        </div>
        <div className="pdf-card border-emerald-100 !bg-emerald-50/10 shadow-sm">
          <p className="pdf-card-title !text-emerald-700 !mb-1">{t('wealth_created')}</p>
          <h2 className="pdf-card-value !text-emerald-700">+₹{(result.returns || 0).toLocaleString()}</h2>
        </div>
        <div className="pdf-card pdf-card-indigo shadow-xl">
          <p className="pdf-card-title !text-indigo-200/60 !mb-1">{t('net_value')}</p>
          <h2 className="pdf-card-value !text-white">₹{(result.netTotal || result.total || 0).toLocaleString()}</h2>
        </div>
      </div>

      <div className="pdf-card !bg-white !border-slate-100 p-8 rounded-[2.5rem] mb-6 flex flex-col items-center justify-center">
        <h4 className="text-[10px] font-black text-slate-300 uppercase mb-6">{t('summary')}</h4>
        <div className="flex items-center gap-12">
          <div className="pdf-pie !w-32 !h-32" style={{ background: `conic-gradient(${pieGradient})` }}></div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-slate-200"></div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('invested')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-emerald-700"></div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('wealth_created')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Projections (Optional) */}
      {
        result.detailed && result.projections && (
          <div className="mt-8 page-break-before-auto">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('year_wise')}</h4>
            <table className="pdf-table !mt-0">
              <thead>
                <tr>
                  <th>{t('year')}</th>
                  <th>{t('invested_capital')}</th>
                  <th>{t('est_returns')}</th>
                  <th style={{ textAlign: 'right' }}>{t('cum_value')}</th>
                </tr>
              </thead>
              <tbody>
                {result.projections.map((p) => (
                  <tr key={p.year}>
                    <td>{t('year')} {p.year}</td>
                    <td>₹{Math.round(p.invested).toLocaleString()}</td>
                    <td>₹{Math.round(p.total - p.invested).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: '900' }}>₹{Math.round(p.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {/* Taxation Deep Dive (Moved to End) */}
      <div className="grid grid-cols-2 gap-6 mt-8 items-start page-break-avoid">
        <div style={{ backgroundColor: boxColor === 'blue' ? '#eff6ff' : boxColor === 'indigo' ? '#eef2ff' : '#f8fafc', borderColor: boxColor === 'blue' ? '#bfdbfe' : boxColor === 'indigo' ? '#c7d2fe' : '#e2e8f0' }} className="p-5 rounded-[1.5rem] border shadow-sm">
          <h3 className="text-sm font-black text-slate-900 mb-2">{taxInfo.title}</h3>
          <p className="text-[10px] text-slate-600 font-medium leading-relaxed mb-4">{taxInfo.desc}</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{t('est_tax')}</p>
              <p className="text-base font-black text-rose-700">₹{(result.tax || 0).toLocaleString()}</p>
            </div>
            {taxInfo.showExpenseRatio && inputs.expense_ratio && (
              <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{t('exp_ratio').split('(')[0]}</p>
                <p className="text-base font-black text-slate-800">{inputs.expense_ratio}%</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('tax_slab_title')}</h4>
          <div className="space-y-2">
            {[
              { r: "0%", s: `${t('up_to')} ₹3L` },
              { r: "5%", s: "₹3L - ₹7L" },
              { r: "10%", s: "₹7L - ₹10L" },
              { r: "15%", s: "₹10L - ₹12L" },
              { r: "20% - 30% Slab", s: t('above_slab') }
            ].map((row, i) => (
              <div key={i} className="flex justify-between text-[11px] font-bold border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">{row.s}</span>
                <span className="text-slate-900">{row.r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PrintView = ({ user, stats, transactions, avatarUrl, filterLabel, calculatorData, ipInfo, t, lang }) => {
  const locale = lang === 'en' ? 'en-IN' : lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'te-IN';
  return (
    <div id="print-root" className="print-only">
      <div className="pdf-header-classic">
        <div className="header-left">
          <span className="url">fin.swinfosystems.online</span>
          <p className="sub-brand">{t('financial_intelligence')}</p>
        </div>
        <div className="header-right">
          <div className="user-meta-info">
            <span className="name">{user?.user_metadata?.full_name || 'Orange Client'}</span>
            <span className="email">{user?.email}</span>
          </div>
          <img src={avatarUrl} alt="U" className="header-avatar" crossOrigin="anonymous" />
        </div>
      </div>

      {calculatorData ? (
        <CalculatorPrintView data={calculatorData} ipInfo={ipInfo} t={t} lang={lang} />
      ) : (
        <div className="audit-ledger-container">
          <h3 className="report-summary-title">{t('report_summary')}: {filterLabel}</h3>

          <div className="pdf-grid">
            <div className="pdf-card pdf-card-balance">
              <p className="pdf-card-title">{t('assets')}</p>
              <h2 className="pdf-card-value">₹{(stats.carriedBalance || 0).toLocaleString()}</h2>
            </div>
            <div className="pdf-card pdf-card-income">
              <p className="pdf-card-title">{t('earnings')}</p>
              <h2 className="pdf-card-value">₹{(stats.income || 0).toLocaleString()}</h2>
            </div>
            <div className="pdf-card pdf-card-expense">
              <p className="pdf-card-title">{t('spending')}</p>
              <h2 className="pdf-card-value">₹{(stats.expense || 0).toLocaleString()}</h2>
            </div>
          </div>

          <PrintAnalytics stats={stats} transactions={transactions} t={t} />

          <div className="audit-table-section mt-12">
            <div className="pdf-section-title"><List size={18} className="text-orange-500" /> {t('audit_log_title')}</div>
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('description')}</th>
                  <th>{t('category')}</th>
                  <th style={{ textAlign: 'right' }}>{t('amount')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? transactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{tx.date ? new Date(tx.date).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'N/A'}</td>
                    <td style={{ fontWeight: '800' }}>{tx.title}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-[4px]" style={{ backgroundColor: tx.type === 'income' ? '#059669' : '#e11d48' }}></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          {t(`cat_${tx.category.toLowerCase()}`) !== `cat_${tx.category.toLowerCase()}` ? t(`cat_${tx.category.toLowerCase()}`) : tx.category}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '950', borderLeft: '1px solid #f8fafc', color: tx.type === 'income' ? '#065f46' : '#991b1b' }}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: '800' }}>{t('no_tx')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unified Footer */}
      <div className="pdf-footer">
        <div>
          <p>{t('report_generated')}: {new Date().toLocaleString(locale)}</p>
          <p>{t('verification')}: {t('certified_ledger')}</p>
          <p className="mt-4 !text-slate-300 font-black tracking-[0.3em]">{t('official_extract')} • Orange Finance</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p>IP: {ipInfo?.ip || t('syncing')}</p>
          <p>{t('approx_location')}: {ipInfo?.city || 'India'}, {ipInfo?.region || 'Global'}</p>
        </div>
      </div>
    </div>
  );
};

// --- 🏠 MAIN SCREENS ---
const LanguageSwitcher = ({ lang, onLangChange, variant = 'light', up = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = LANG_OPTIONS.find(o => o.code === lang) || LANG_OPTIONS[0];

  return (
    <div className="relative no-print">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase transition-all shadow-sm active:scale-95 ${variant === 'dark'
          ? 'bg-gray-800/40 text-gray-300 hover:bg-gray-800 border border-gray-700/50'
          : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'
          }`}
      >
        <Globe size={14} className={variant === 'dark' ? 'text-gray-500' : 'text-orange-400'} />
        <span>{currentLang.native}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className={`absolute ${up ? 'bottom-full mb-3' : 'top-full mt-2'} right-0 w-36 py-2 rounded-2xl shadow-2xl z-[70] border animate-slide-up ${variant === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-orange-50'
            }`}>
            <div className={`px-4 pb-2 mb-2 border-b text-[9px] font-black uppercase tracking-widest ${variant === 'dark' ? 'border-gray-800 text-gray-500' : 'border-gray-50 text-gray-400'}`}>Language</div>
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => {
                  onLangChange(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold uppercase transition-colors ${lang === opt.code
                  ? (variant === 'dark' ? 'text-orange-400 bg-orange-500/10' : 'text-orange-600 bg-orange-50')
                  : (variant === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')
                  }`}
              >
                {opt.native}
                {lang === opt.code && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;

  const handleLangChange = (l) => {
    setLang(l);
    localStorage.setItem('app_lang', l);
  };

  const handleSystemLoad = (client) => {
    setSupabase(client);
    client.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    client.auth.onAuthStateChange((_event, session) => { setSession(session); setLoading(false); });
  };

  return (
    <>
      <SystemManager onLoad={handleSystemLoad} />
      {(loading || !supabase) ? (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 text-orange-500"><Loader2 className="animate-spin" size={40} /></div>
      ) : (
        !session ? (
          <AuthScreen supabase={supabase} lang={lang} t={t} onLangChange={handleLangChange} />
        ) : (
          <Dashboard session={session} supabase={supabase} lang={lang} t={t} onLangChange={handleLangChange} />
        )
      )}
    </>
  );
}

// 🔐 AUTH SCREEN
const AuthScreen = ({ supabase, lang, t, onLangChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6 animate-fade-in no-print">
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] w-full max-w-sm warm-shadow-lg border border-white/50 animate-slide-up relative">
        <div className="absolute -top-12 left-0 right-0 flex justify-center">
          <LanguageSwitcher lang={lang} onLangChange={onLangChange} up={true} />
        </div>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-6">
            <Wallet className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Orange Finance</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{t('tools')}</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">{t('full_name')}</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-transparent outline-none font-semibold text-gray-800" placeholder="John Doe" required />
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <label className="block text-[10px] font-bold text-gray-400 uppercase">{t('email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent outline-none font-semibold text-gray-800" placeholder="name@mail.com" required />
          </div>
          <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <label className="block text-[10px] font-bold text-gray-400 uppercase">{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent outline-none font-semibold text-gray-800" placeholder="••••••••" required />
          </div>
          <button disabled={loading} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? t('sign_in') : t('create_account'))}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">
          {isLogin ? t('new_here') + " " : t('have_an_account') + " "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-orange-600 font-bold hover:underline">{isLogin ? t('sign_up') : t('sign_in')}</button>
        </p>
      </div>
    </div>
  );
};

// 🏠 DASHBOARD (Protected)
const Dashboard = ({ session, supabase, lang, t, onLangChange }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Forms
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', type: 'expense' });
  const [catForm, setCatForm] = useState({ name: '', icon_key: 'Star', type: 'expense', isEmoji: false });

  const [avatarUrl, setAvatarUrl] = useState(session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`);
  const fileInputRef = useRef(null);

  // Analytics Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState('monthly'); // 'monthly' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analysisType, setAnalysisType] = useState('expense'); // expense | income
  const [selectedTool, setSelectedTool] = useState(null);
  const [calculatorPrintData, setCalculatorPrintData] = useState(null);
  const [ipInfo, setIpInfo] = useState(null);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setIpInfo(data);
      } catch (err) { console.error("IP Fetch Error:", err); }
    };
    fetchIp();
  }, []);

  // Trigger Calculator Print
  const handlePrintCalculator = (toolName, inputs, result) => {
    setCalculatorPrintData({ toolName, inputs, result });
    setTimeout(() => {
      window.print();
      setCalculatorPrintData(null);
    }, 100);
  };

  // Offline Hook
  const { isOnline, isSyncing } = useOfflineSync(supabase, session.user.id, () => fetchData());

  // Deep Persistence: Ensure local storage is ALWAYS in sync with state
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(`cached_tx_${session.user.id}`, JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    const customCats = categories.filter(c => !DEFAULT_CATEGORIES.some(d => d.name === c.name));
    if (customCats.length > 0) {
      localStorage.setItem(`cached_cat_${session.user.id}`, JSON.stringify(customCats));
    }
  }, [categories]);

  // --- 🔄 FETCH DATA ---
  const fetchData = async () => {
    if (!session.user) return;
    const cacheKeyTx = `cached_tx_${session.user.id}`;
    const cacheKeyCat = `cached_cat_${session.user.id}`;

    // Load from cache first
    const cachedTx = localStorage.getItem(cacheKeyTx);
    const cachedCat = localStorage.getItem(cacheKeyCat);
    if (cachedTx) setTransactions(JSON.parse(cachedTx));
    if (cachedCat) setCategories([...DEFAULT_CATEGORIES, ...JSON.parse(cachedCat)]);

    if (!isOnline) { setLoading(false); return; }

    // Fetch Fresh
    try {
      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      const { data: catData } = await supabase.from('categories').select('*').order('usage_count', { ascending: false });

      if (txData) {
        const pendingKey = `pending_tx_${session.user.id}`;
        const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
        const pendingInserts = pending.filter(a => a.action === 'INSERT').map(a => a.data);
        const pendingUpdates = pending.filter(a => a.action === 'UPDATE').map(a => a.data);
        const pendingDeletes = pending.filter(a => a.action === 'DELETE').map(a => a.id);

        let merged = [...txData];

        // 1. Apply Deletes
        if (pendingDeletes.length > 0) {
          merged = merged.filter(tx => !pendingDeletes.includes(tx.id));
        }

        // 2. Apply Updates (Replace existing records with their latest pending local versions)
        if (pendingUpdates.length > 0) {
          merged = merged.map(tx => {
            const updatesForTx = pendingUpdates.filter(u => u.id === tx.id);
            const latestUpdate = updatesForTx.length > 0 ? updatesForTx[updatesForTx.length - 1] : null;
            return latestUpdate ? { ...tx, ...latestUpdate } : tx;
          });
        }

        // 3. Apply Inserts (Prepend new records, avoiding duplicates if they just synced)
        // Fuzzy matching: if an entry has same title, amount and very close date, ignore the pending insert
        if (pendingInserts.length > 0) {
          const newInserts = pendingInserts.filter(pi => !merged.some(m => {
            const sameId = m.id === pi.id;
            const sameContent = m.title === pi.title && m.amount === pi.amount;
            const closeTime = Math.abs(new Date(m.date) - new Date(pi.date)) < 5000;
            return sameId || (sameContent && closeTime);
          }));
          merged = [...newInserts, ...merged];
        }

        setTransactions(merged);
      }
      if (catData && catData.length > 0) {
        const customCats = catData.filter(c => !DEFAULT_CATEGORIES.some(d => d.name === c.name));
        const mergedCats = [...DEFAULT_CATEGORIES, ...customCats];
        setCategories(mergedCats);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    if (isOnline) {
      const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData()).subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [isOnline]);

  // --- 📝 TRANSACTIONS (Optimistic UI) ---
  const handleSaveTx = async () => {
    if (!formData.amount || !formData.title || isSaving) return;
    setIsSaving(true);
    const txData = {
      user_id: session.user.id,
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: new Date().toISOString()
    };

    // Optimistic Update
    const newTx = { ...txData, id: editingTx?.id || `temp-${Date.now()}` };
    if (editingTx) {
      setTransactions(prev => prev.map(tx => tx.id === editingTx.id ? newTx : tx));
    } else {
      setTransactions(prev => [newTx, ...prev]);
    }

    if (isOnline) {
      try {
        if (editingTx) {
          await supabase.from('transactions').update(txData).eq('id', editingTx.id);
        } else {
          const { data, error } = await supabase.from('transactions').insert([txData]).select();
          if (!error && data?.[0]) {
            // Replace temp ID with real ID
            setTransactions(prev => prev.map(tx => tx.id === newTx.id ? data[0] : tx));
          }
          const cat = categories.find(c => c.name === formData.category);
          if (cat && cat.id) {
            await supabase.from('categories').update({ usage_count: (cat.usage_count || 0) + 1 }).eq('id', cat.id);
          }
        }
      } catch (e) {
        console.error("Save error:", e);
        fetchData(); // Rollback on error
      }
    } else {
      const action = editingTx ? 'UPDATE' : 'INSERT';
      const payload = { ...txData, id: editingTx?.id || newTx.id };
      const pendingKey = `pending_tx_${session.user.id}`;
      let pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');

      if (editingTx) {
        // If updating something already in the queue, update it in place
        const existingIdx = pending.findIndex(p => p.data?.id === editingTx.id);
        if (existingIdx > -1) {
          pending[existingIdx].data = { ...pending[existingIdx].data, ...txData, id: editingTx.id };
        } else {
          pending.push({ action, data: payload });
        }
      } else {
        // Prevent accidental rapid double-insert while offline
        const isDuplicate = pending.some(p =>
          p.action === 'INSERT' &&
          p.data.title === txData.title &&
          p.data.amount === txData.amount &&
          (Date.now() - new Date(p.data.date).getTime() < 2000)
        );

        if (!isDuplicate) {
          pending.push({ action, data: payload });
        }
      }

      localStorage.setItem(pendingKey, JSON.stringify(pending));
    }

    setShowModal(false);
    setEditingTx(null);
    setIsSaving(false);
    setFormData({ title: '', amount: '', category: 'Food', type: 'expense' });
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setFormData({ title: tx.title, amount: tx.amount, category: tx.category, type: tx.type });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('delete_confirm'))) return;

    // Optimistic delete from UI state immediately
    const newTxList = transactions.filter(tx => tx.id !== id);
    setTransactions(newTxList);
    localStorage.setItem(`cached_tx_${session.user.id}`, JSON.stringify(newTxList));

    if (isOnline) {
      await supabase.from('transactions').delete().eq('id', id);
    } else {
      const pendingKey = `pending_tx_${session.user.id}`;
      const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
      pending.push({ action: 'DELETE', id });
      localStorage.setItem(pendingKey, JSON.stringify(pending));
    }
  };

  // --- 🏷️ CATEGORIES ---
  const handleSaveCategory = async () => {
    if (!catForm.name) return;
    if (isOnline) {
      await supabase.from('categories').insert([{
        user_id: session.user.id,
        name: catForm.name,
        type: catForm.type,
        icon_key: catForm.icon_key,
        usage_count: 0,
        isEmoji: catForm.isEmoji
      }]);
    } else {
      alert(t('connect_internet'));
      return;
    }
    setShowCatModal(false);
    setCatForm({ name: '', icon_key: 'Star', type: 'expense', isEmoji: false });
  };

  // --- 🖼️ AVATAR ---
  const handleAvatarUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const fileName = `${session.user.id}-${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
      setAvatarUrl(data.publicUrl);
    } catch (error) { alert("Error: " + error.message); }
  };

  // --- 📊 DERIVED STATE ---
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
  }, [categories]);

  const filteredTx = useMemo(() => {
    let filtered = transactions;
    if (filterType === 'monthly') {
      if (filterMonth !== 'all') {
        filtered = filtered.filter(tx => {
          const d = new Date(tx.date);
          return d.getMonth() === parseInt(filterMonth) && d.getFullYear() === parseInt(filterYear);
        });
      }
    } else if (filterType === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(tx => {
        const d = new Date(tx.date);
        return d >= start && d <= end;
      });
    }
    return filtered;
  }, [transactions, filterMonth, filterYear, filterType, startDate, endDate]);

  const stats = useMemo(() => {
    // 1. Calculate Carry Forward Balance
    let carriedBalance = 0;
    if (filterType === 'monthly' && filterMonth !== 'all') {
      const firstDayOfMonth = new Date(filterYear, filterMonth, 1);
      carriedBalance = transactions
        .filter(tx => new Date(tx.date) < firstDayOfMonth)
        .reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
    } else if (filterType === 'custom' && startDate) {
      const start = new Date(startDate);
      carriedBalance = transactions
        .filter(tx => new Date(tx.date) < start)
        .reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
    }

    // 2. Calculate Current Filter Stats
    const inc = filteredTx.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
    const exp = filteredTx.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);

    return {
      income: inc,
      expense: exp,
      carriedBalance,
      balance: carriedBalance + inc - exp
    };
  }, [transactions, filteredTx, filterMonth, filterYear, filterType, startDate]);

  const reportData = useMemo(() => {
    const relevantTx = filteredTx.filter(tx => tx.type === analysisType);
    const grouped = {};
    relevantTx.forEach(tx => { grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount; });
    return Object.keys(grouped).map(cat => ({
      label: cat, value: grouped[cat], color: 'gray-500'
    })).sort((a, b) => b.value - a.value);
  }, [filteredTx, analysisType]);

  const greeting = new Date().getHours() < 12 ? t('good_morning') : new Date().getHours() < 18 ? t('good_afternoon') : t('good_evening');
  const monthNames = lang === 'en' ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] :
    lang === 'mr' ? ["जाने", "फेब्रु", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑग", "सप्टे", "ऑक्टो", "नोव्हें", "डिसें"] :
      lang === 'hi' ? ["जन", "फर", "मार्च", "अप्रै", "मई", "जून", "जुलाई", "अग", "सित", "अक्तू", "नवं", "दिस"] :
        ["జన", "ఫిబ్ర", "మార్చి", "ఏప్రి", "మే", "జూన్", "జూలై", "ఆగ", "సెప్టె", "అక్టో", "నవం", "డిసెం"];

  return (
    <div className="flex h-screen bg-[#fff7ed] text-slate-800 overflow-hidden">
      <HeadManager />

      <PrintView
        user={session.user}
        stats={stats}
        transactions={filteredTx}
        avatarUrl={avatarUrl}
        filterLabel={filterType === 'monthly' ? (filterMonth === 'all' ? t('all_time') : `${monthNames[filterMonth]} ${filterYear}`) : `${startDate} ${t('to')} ${endDate}`}
        calculatorData={calculatorPrintData}
        ipInfo={ipInfo}
        t={t}
        lang={lang}
      />

      <aside className="hidden lg:flex w-64 bg-white border-r border-orange-100 flex-col p-6 shadow-sm z-20 no-print">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-md">
            <Wallet size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Orange</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutDashboard size={20} /> {t('dashboard')}
          </button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>
            <PieChart size={20} /> {t('analytics')}
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-orange-50">
          <div className="mb-4">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-2 ml-2">{t('language')}</p>
            <LanguageSwitcher lang={lang} onLangChange={onLangChange} variant="dark" up={true} />
          </div>
          <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 text-red-500 text-sm font-medium hover:bg-red-50 py-2 rounded-lg transition-colors">
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative no-print">
        <div className="max-w-5xl mx-auto px-6 py-8 pb-32 lg:pb-8">

          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-orange-200 overflow-hidden cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <img src={avatarUrl} alt="avatar" className="app-avatar w-full h-full object-cover" />
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-800/60 uppercase">{greeting}</p>
                <h2 className="text-lg font-bold text-gray-900 truncate max-w-[150px]">{session.user.user_metadata.full_name?.split(' ')[0]}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 my-1">
                {!isOnline && <div className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse" title="Offline"><WifiOff size={14} /></div>}
                {isOnline && isSyncing && <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse" title="Syncing..."><RefreshCw size={14} className="animate-spin" /></div>}
                {isOnline && !isSyncing && <div className="flex items-center gap-2 bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold" title="Online & Synced"><Cloud size={14} /></div>}
              </div>

              {/* Mobile Settings - Language & Logout */}
              <div className="lg:hidden flex items-center gap-2 ml-1">
                <div className="scale-75 origin-right">
                  <LanguageSwitcher lang={lang} onLangChange={onLangChange} variant="light" />
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl active:scale-90 transition-all border border-rose-100"
                  title={t('logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                  <Plus size={18} /> {t('add_tx')}
                </button>
              </div>
            </div>
          </header>

          {activeTab === 'home' ? (
            <div className="animate-fade-in space-y-8">
              <div className="bg-mesh rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden transform transition-all hover:scale-[1.01]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 opacity-90"><span className="text-xs font-bold uppercase tracking-widest">{t('balance')}</span></div>
                    <h1 className="text-5xl font-extrabold tracking-tight">₹ {stats.balance.toLocaleString()}</h1>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 min-w-[120px] border border-white/10">
                        <div className="flex items-center gap-2 text-emerald-100 mb-1"><ArrowDownLeft size={16} /> <span className="text-xs font-bold uppercase">{t('income')}</span></div>
                        <p className="font-bold text-lg">₹{stats.income.toLocaleString()}</p>
                      </div>
                      <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 min-w-[120px] border border-white/10">
                        <div className="flex items-center gap-2 text-rose-100 mb-1"><ArrowUpRight size={16} /> <span className="text-xs font-bold uppercase">{t('expense')}</span></div>
                        <p className="font-bold text-lg">₹{stats.expense.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">{t('tools')}</h3>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                  {TOOLS.map(tool => (
                    <div key={tool.id} onClick={() => setSelectedTool(tool.id)} className="min-w-[100px] bg-white p-4 rounded-2xl border border-orange-50 warm-shadow flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform cursor-pointer active:scale-95">
                      <div className={`p-3 rounded-xl ${tool.bg} ${tool.color}`}><tool.icon size={20} /></div>
                      <span className="text-xs font-bold text-gray-600">{t(`tool_${tool.id}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{t('recent_activity')}</h3>
                  <span className="text-[10px] text-gray-400">{t('tap_to_edit')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transactions.slice(0, 10).map(tx => {
                    const cat = categories.find(c => c.name === tx.category);
                    const CatIcon = ICON_MAP[cat?.icon_key] || Star;
                    const isEmoji = cat?.isEmoji;

                    return (
                      <div key={tx.id} onClick={() => handleEditClick(tx)} className="bg-white p-4 rounded-2xl border border-gray-50 warm-shadow flex items-center justify-between group hover:border-orange-200 transition-colors cursor-pointer active:scale-95">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'} text-xl`}>
                            {isEmoji ? cat.icon_key : (CatIcon ? <CatIcon size={20} /> : <Star size={20} />)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-gray-800 text-sm truncate w-32">
                              {t(`cat_${tx.category.toLowerCase()}`) !== `cat_${tx.category.toLowerCase()}` ? t(`cat_${tx.category.toLowerCase()}`) : tx.category}
                            </h4>
                            <p className="text-xs text-gray-400 font-medium">{tx.date ? new Date(tx.date).toLocaleDateString() : t('syncing')}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`block font-bold text-base ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>{tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}</span>
                          <div className="flex gap-2 mt-2">
                            <button onClick={(e) => { e.stopPropagation(); handleEditClick(tx); }} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-100 hover:text-orange-600 transition-all border border-gray-100 shadow-sm"><Edit2 size={18} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }} className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-all border border-rose-100 shadow-sm"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {transactions.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">{t('no_tx')}</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in pb-20 space-y-8">
              {/* Enhanced Filter Section */}
              <div className="bg-white p-6 rounded-[2.5rem] warm-shadow border border-orange-100/50">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">{t('financial_reports')}</h2>
                    <p className="text-xs lg:text-sm text-gray-400 mt-0.5">{t('report_desc')}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="bg-orange-50/50 p-1.5 rounded-2xl flex border border-orange-100">
                      <button onClick={() => setFilterType('monthly')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'monthly' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}>{t('monthly_filter')}</button>
                      <button onClick={() => setFilterType('custom')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'custom' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}>{t('custom_filter')}</button>
                    </div>

                    {filterType === 'monthly' ? (
                      <div className="flex gap-2">
                        <select
                          value={filterMonth}
                          onChange={(e) => setFilterMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                          className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none shadow-sm"
                        >
                          <option value="all">{t('annual')}</option>
                          {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        </select>
                        <select
                          value={filterYear}
                          onChange={(e) => setFilterYear(parseInt(e.target.value))}
                          className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none shadow-sm"
                        >
                          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm px-4">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs font-bold text-gray-700 bg-transparent outline-none" />
                        <span className="text-gray-300 font-bold">→</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs font-bold text-gray-700 bg-transparent outline-none" />
                      </div>
                    )}

                    <div className="flex gap-2 w-full lg:w-auto">
                      <button onClick={() => window.print()} className="flex-1 lg:flex-none bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-800 transition-all"><Download size={16} /> PDF</button>
                      <a
                        href={generateEmailLink(
                          `${t('financial_report_subject')}: ${filterType === 'monthly' ? (filterMonth === 'all' ? t('annual') : monthNames[filterMonth]) : t('custom_filter')}`,
                          `${t('share_summary')}:\n\n${t('prev_balance')}: Rs ${stats.carriedBalance.toLocaleString()}\n${t('total_income')}: Rs ${stats.income.toLocaleString()}\n${t('total_expense')}: Rs ${stats.expense.toLocaleString()}\n${t('final_balance')}: Rs ${stats.balance.toLocaleString()}\n\n${t('generated_via')} fin.swinfosystems.online`
                        )}
                        className="flex-1 lg:flex-none bg-orange-100 text-orange-600 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-200 transition-all"
                      >
                        <Share2 size={16} /> {t('share')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white p-5 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] warm-shadow border border-gray-50 group hover:border-orange-200 transition-all">
                  <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 lg:mb-2">{t('prev_balance')}</p>
                  <p className="text-2xl lg:text-3xl font-black text-gray-800">₹{stats.carriedBalance.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50/30 p-5 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-emerald-100/50 group hover:bg-emerald-50 transition-all">
                  <p className="text-[9px] lg:text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1.5 lg:mb-2">{t('total_income')}</p>
                  <p className="text-2xl lg:text-3xl font-black text-emerald-700">₹{stats.income.toLocaleString()}</p>
                </div>
                <div className="bg-rose-50/30 p-5 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-red-100/50 group hover:bg-rose-50 transition-all">
                  <p className="text-[9px] lg:text-[10px] text-red-600 font-bold uppercase tracking-widest mb-1.5 lg:mb-2">{t('total_expense')}</p>
                  <p className="text-2xl lg:text-3xl font-black text-red-700">₹{stats.expense.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl hover:scale-[1.02] transition-all">
                  <p className="text-[9px] lg:text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1.5 lg:mb-2">{t('final_balance')}</p>
                  <p className="text-2xl lg:text-3xl font-black text-white">₹{stats.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="xl:grid xl:grid-cols-2 xl:gap-8 space-y-8 xl:space-y-0">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] warm-shadow border border-orange-50 overflow-hidden h-[450px]">
                  <AnalyticsDashboard transactions={filteredTx} categories={categories} showOnly="trend" t={t} />
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] warm-shadow border border-orange-50 overflow-hidden h-[450px]">
                  <AnalyticsDashboard transactions={filteredTx} categories={categories} showOnly="pie" t={t} />
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 text-center border-t border-orange-100 pt-6 no-print">
            <p className="text-xs text-gray-400 font-medium">{t('developed_by')} <a href="https://swinfosystems.online" target="_blank" className="text-orange-500 hover:underline">Swinfosystems</a></p>
            <p className="text-xs text-gray-300 mt-1">fin.swinfosystems.online</p>
          </div>
        </div>

        {selectedTool && <CalculatorModal toolId={selectedTool} onClose={() => setSelectedTool(null)} onPrint={handlePrintCalculator} t={t} />}
      </main>

      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-2 rounded-[2rem] shadow-2xl border border-white/50 flex justify-between items-center z-50 max-w-sm mx-auto no-print">
        <button onClick={() => setActiveTab('home')} className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors ${activeTab === 'home' ? 'bg-orange-50 text-orange-600' : 'text-gray-400'}`}><LayoutDashboard size={20} /></button>
        <div className="relative -top-8">
          <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all border-4 border-white"><Plus size={28} /></button>
        </div>
        <button onClick={() => setActiveTab('reports')} className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors ${activeTab === 'reports' ? 'bg-orange-50 text-orange-600' : 'text-gray-400'}`}><PieChart size={20} /></button>
      </nav>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center no-print px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] p-8 animate-slide-up h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{editingTx ? t('edit_tx') : t('add_transaction')}</h2>
              <button onClick={() => setShowModal(false)} className="bg-gray-50 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-6">
              {['expense', 'income'].map(type => (
                <button key={type} onClick={() => setFormData({ ...formData, type })} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${formData.type === type ? 'bg-white shadow text-gray-900' : 'text-gray-400'}`}>{t(type)}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6">
              <div className="text-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('amount')}</label>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className="text-3xl text-gray-300 font-bold">₹</span>
                  <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="text-5xl font-extrabold text-gray-900 w-40 text-center outline-none" placeholder="0" autoFocus />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('category')}</label>
                  <button onClick={() => setShowCatModal(true)} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">+ {t('custom')}</button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {sortedCategories.filter(c => c.type === formData.type).slice(0, 8).map(cat => {
                    const Icon = ICON_MAP[cat.icon_key] || Star;
                    return (
                      <button key={cat.name} onClick={() => setFormData({ ...formData, category: cat.name })} className={`flex flex-col items-center gap-2 p-2 rounded-2xl border-2 transition-all ${formData.category === cat.name ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-gray-50'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.category === cat.name ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {cat.isEmoji ? cat.icon_key : <Icon size={18} />}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 truncate w-full text-center">
                          {t(`cat_${cat.name.toLowerCase()}`) !== `cat_${cat.name.toLowerCase()}` ? t(`cat_${cat.name.toLowerCase()}`) : cat.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('note')}</label>
                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-100" placeholder="e.g. Dinner" />
              </div>
              <button
                onClick={handleSaveTx}
                disabled={isSaving}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : (editingTx ? t('update_tx') : t('save_tx'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center no-print p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCatModal(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-4">{t('new_category')}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">{t('name')}</label>
                <input autoFocus value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="w-full border-b-2 border-orange-100 py-2 font-bold text-lg outline-none focus:border-orange-500" placeholder="e.g. Gym" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Icon</label>
                  <button onClick={() => setCatForm(prev => ({ ...prev, isEmoji: !prev.isEmoji }))} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    {catForm.isEmoji ? 'Switch to Icons' : 'Switch to Emojis'}
                  </button>
                </div>

                {catForm.isEmoji ? (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <input
                      type="text"
                      placeholder="Type an emoji"
                      className="w-full bg-transparent outline-none text-center text-2xl"
                      maxLength={2}
                      value={catForm.icon_key}
                      onChange={(e) => setCatForm({ ...catForm, icon_key: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {Object.keys(ICON_MAP).map(key => {
                      const Icon = ICON_MAP[key];
                      return (
                        <button key={key} onClick={() => setCatForm({ ...catForm, icon_key: key })} className={`p-2 rounded-xl border ${catForm.icon_key === key ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500'}`}><Icon size={18} /></button>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {['expense', 'income'].map(type => (
                  <button key={type} onClick={() => setCatForm({ ...catForm, type })} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border ${catForm.type === type ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500'}`}>{t(type)}</button>
                ))}
              </div>
              <button onClick={handleSaveCategory} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg mt-2 tracking-wide">{t('create_category')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
