"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Minus,
  Edit3,
  LogOut,
  Search,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Layers,
  Package,
  Filter,
  Building,
  RefreshCw,
  X,
  PlusCircle,
  History,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

// Mock Categories
const CATEGORIES = [
  "الهواتف الذكية",
  "أجهزة المحمول",
  "الأجهزة اللوحية",
  "سماعات الرأس",
  "الإكسسوارات",
];

// Product Interface
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: "متوفر" | "غير متوفر" | "مخزون منخفض";
  costPrice: number;
  salePrice: number;
  quantity: number;
  lowStockThreshold: number;
  supplierName: string;
}

// Stock Log Interface
interface StockLog {
  id: string;
  productName: string;
  type: "إضافة" | "سحب";
  amount: number;
  reason: string;
  timestamp: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    sku: "APP-IP15P-256",
    category: "الهواتف الذكية",
    status: "متوفر",
    costPrice: 3800,
    salePrice: 4800,
    quantity: 12,
    lowStockThreshold: 5,
    supplierName: "Apple Inc. Global",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    sku: "SAM-S24U-512",
    category: "الهواتف الذكية",
    status: "مخزون منخفض",
    costPrice: 3500,
    salePrice: 4300,
    quantity: 3, // < threshold
    lowStockThreshold: 5,
    supplierName: "Samsung Gulf Distribution",
  },
  {
    id: "3",
    name: "MacBook Pro M3 Max",
    sku: "APP-MBP-M3M",
    category: "أجهزة المحمول",
    status: "متوفر",
    costPrice: 8500,
    salePrice: 10500,
    quantity: 8,
    lowStockThreshold: 3,
    supplierName: "Apple Inc. Global",
  },
  {
    id: "4",
    name: "iPad Air M2",
    sku: "APP-IPA-M2",
    category: "الأجهزة اللوحية",
    status: "غير متوفر",
    costPrice: 2200,
    salePrice: 2800,
    quantity: 0,
    lowStockThreshold: 4,
    supplierName: "Apple Inc. Global",
  },
  {
    id: "5",
    name: "Sony WH-1000XM5",
    sku: "SON-XM5-B",
    category: "سماعات الرأس",
    status: "متوفر",
    costPrice: 950,
    salePrice: 1300,
    quantity: 18,
    lowStockThreshold: 4,
    supplierName: "Sony Middle East FZCO",
  },
];

const INITIAL_LOGS: StockLog[] = [
  {
    id: "l-1",
    productName: "iPhone 15 Pro Max",
    type: "إضافة",
    amount: 5,
    reason: "استلام شحنة جديدة من المورد الرئيسي",
    timestamp: "2026-06-28 09:30",
  },
  {
    id: "l-2",
    productName: "Samsung Galaxy S24 Ultra",
    type: "سحب",
    amount: 2,
    reason: "مبيعات مباشرة للعملاء عبر الموقع الإلكتروني",
    timestamp: "2026-06-28 10:15",
  },
];

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [logs, setLogs] = useState<StockLog[]>(INITIAL_LOGS);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals state
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  
  // Stock adjustments state
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<"add" | "subtract">("add");
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustError, setAdjustError] = useState("");

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("فشل تسجيل الخروج", error);
    }
  };

  // Financial Stats calculations
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
    const lowStockItems = products.filter(
      (p) => p.quantity <= p.lowStockThreshold
    ).length;

    const totalValueCost = products.reduce(
      (acc, p) => acc + p.costPrice * p.quantity,
      0
    );
    const totalValueSale = products.reduce(
      (acc, p) => acc + p.salePrice * p.quantity,
      0
    );
    const potentialProfit = totalValueSale - totalValueCost;

    return {
      totalItems,
      totalStock,
      lowStockItems,
      totalValueCost,
      totalValueSale,
      potentialProfit,
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "الكل" || p.category === selectedCategory;

      const isLowStock = p.quantity <= p.lowStockThreshold;
      const matchesLowStock = !lowStockFilter || isLowStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, lowStockFilter]);

  // Save Product (New or Edited)
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editProduct) return;

    // Check SKU uniqueness for new products
    if (isNewProduct && products.some((p) => p.sku === editProduct.sku)) {
      alert("الرمز SKU مستخدم بالفعل لمنتج آخر.");
      return;
    }

    // Determine status based on quantity
    let status: "متوفر" | "غير متوفر" | "مخزون منخفض" = "متوفر";
    if (editProduct.quantity === 0) {
      status = "غير متوفر";
    } else if (editProduct.quantity <= editProduct.lowStockThreshold) {
      status = "مخزون منخفض";
    }

    const updatedProduct = {
      ...editProduct,
      status,
      costPrice: Number(editProduct.costPrice),
      salePrice: Number(editProduct.salePrice),
      quantity: Number(editProduct.quantity),
      lowStockThreshold: Number(editProduct.lowStockThreshold),
    };

    if (isNewProduct) {
      setProducts([updatedProduct, ...products]);
      // Log creation
      const newLog: StockLog = {
        id: "l-" + Date.now(),
        productName: updatedProduct.name,
        type: "إضافة",
        amount: updatedProduct.quantity,
        reason: "إضافة منتج جديد للأنظمة لأول مرة",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      setLogs([newLog, ...logs]);
    } else {
      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    }

    setEditProduct(null);
  };

  // Adjust Stock quantity handler
  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;
    if (adjustAmount <= 0) {
      setAdjustError("الكمية يجب أن تكون أكبر من الصفر.");
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustError("يرجى إدخال سبب تعديل المخزون.");
      return;
    }

    const currentQty = adjustProduct.quantity;
    let newQty = currentQty;

    if (adjustType === "add") {
      newQty += adjustAmount;
    } else {
      if (currentQty < adjustAmount) {
        setAdjustError("الكمية المطلوبة سحبها أكبر من الكمية المتوفرة حالياً.");
        return;
      }
      newQty -= adjustAmount;
    }

    // Determine new status
    let status: "متوفر" | "غير متوفر" | "مخزون منخفض" = "متوفر";
    if (newQty === 0) {
      status = "غير متوفر";
    } else if (newQty <= adjustProduct.lowStockThreshold) {
      status = "مخزون منخفض";
    }

    // Update Product
    setProducts(
      products.map((p) =>
        p.id === adjustProduct.id ? { ...p, quantity: newQty, status } : p
      )
    );

    // Add entry to history logs
    const newLog: StockLog = {
      id: "l-" + Date.now(),
      productName: adjustProduct.name,
      type: adjustType === "add" ? "إضافة" : "سحب",
      amount: adjustAmount,
      reason: adjustReason.trim(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setLogs([newLog, ...logs]);

    // Close Modal
    setAdjustProduct(null);
    setAdjustAmount(1);
    setAdjustReason("");
    setAdjustError("");
  };

  const openNewProductModal = () => {
    setIsNewProduct(true);
    setEditProduct({
      id: "p-" + Date.now(),
      name: "",
      sku: "",
      category: CATEGORIES[0],
      status: "متوفر",
      costPrice: 0,
      salePrice: 0,
      quantity: 0,
      lowStockThreshold: 5,
      supplierName: "",
    });
  };

  const openEditProductModal = (product: Product) => {
    setIsNewProduct(false);
    setEditProduct({ ...product });
  };

  const openAdjustStockModal = (product: Product, type: "add" | "subtract") => {
    setAdjustProduct(product);
    setAdjustType(type);
    setAdjustAmount(1);
    setAdjustReason("");
    setAdjustError("");
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-white font-sans pb-16">
      {/* Dynamic Header like Apple style */}
      <header className="sticky top-0 z-40 bg-[#08080c]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 relative">
            <Image
              src="/logo-v2.png"
              alt="ATLUS"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>ATLUS</span>
              <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-normal border border-primary-500/30">
                إدارة المخزون
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top welcome widget */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600/10 to-[#ec4899]/5 border border-white/5 p-6 sm:p-8">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(43,127,255,0.1),transparent)]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                لوحة تحكم إدارة المخزون المحلي 📦
              </h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                مرحباً بك في نظام ATLUS الذكي لإدارة منتجاتك. يمكنك هنا تحديث مستويات المخزون،
                تعديل التفاصيل المالية للمنتجات، والحصول على تنبيهات فورية للمخزون المنخفض.
              </p>
            </div>
            <button
              onClick={openNewProductModal}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>
        </div>

        {/* Financial and Quantities Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="glass-card p-6 bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-bl-full pointer-events-none group-hover:bg-primary-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">إجمالي المنتجات</span>
              <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-white">{stats.totalItems}</h3>
              <p className="text-xs text-zinc-500 mt-1">منتجاً فريداً مسجلاً</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">إجمالي كمية المخزون</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-white">{stats.totalStock}</h3>
              <p className="text-xs text-zinc-500 mt-1">وحدة مخزنة بالكامل</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">القيمة المالية الكلية</span>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-white">
                {stats.totalValueSale.toLocaleString()} <span className="text-xs font-normal text-zinc-400">ريال</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">تكلفة الشراء الكلية: {stats.totalValueCost.toLocaleString()} ريال</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-6 bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">الأرباح المتوقعة</span>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-emerald-400">
                +{stats.potentialProfit.toLocaleString()} <span className="text-xs font-normal text-zinc-400">ريال</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">هامش ربح إجمالي متوقع</p>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Alert if any */}
        {products.some((p) => p.quantity <= p.lowStockThreshold) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold">تنبيه: مخزون منخفض وحرج!</p>
                <p className="text-xs text-rose-400/80 mt-0.5">
                  هناك {stats.lowStockItems} منتجات حالياً وصلت أو قلت عن حد الأمان المحدد. يرجى مراجعة الجدول.
                </p>
              </div>
            </div>
            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
            >
              {lowStockFilter ? "عرض كل المنتجات" : "تصفية المنتجات المتأثرة"}
            </button>
          </div>
        )}

        {/* Filter and Search Bar Section */}
        <div className="glass-card p-6 bg-zinc-900/20 border border-white/5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute right-4 inset-y-0 my-auto w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="ابحث بالاسم، SKU أو اسم المورد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-zinc-950 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:border-primary-500 transition-all placeholder-zinc-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-zinc-400 ml-2 hidden sm:inline flex-shrink-0">
                الفئة:
              </span>
              <button
                onClick={() => setSelectedCategory("الكل")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedCategory === "الكل"
                    ? "bg-primary-500 text-white border-primary-500 shadow-md"
                    : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                الكل
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary-500 text-white border-primary-500 shadow-md"
                      : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Inventory Table Card */}
        <div className="glass-card bg-[#111116]/40 border border-white/5 overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-white">جدول المخزون</h3>
              <p className="text-xs text-zinc-400 mt-1">
                تصفح وتعديل المخزون للمنتجات النشطة
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">
                عرض {filteredProducts.length} من أصل {products.length} منتجات
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white/[0.02] text-zinc-400 text-xs uppercase font-semibold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">المنتج والتصنيف</th>
                  <th className="px-6 py-4">الرمز SKU</th>
                  <th className="px-6 py-4">المورد</th>
                  <th className="px-6 py-4 text-center">الكمية الحالية</th>
                  <th className="px-6 py-4">حد الأمان</th>
                  <th className="px-6 py-4">سعر التكلفة / البيع</th>
                  <th className="px-6 py-4">الربح المتوقع</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-left">العمليات الإدارية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-zinc-500 text-sm">
                      لا توجد منتجات مطابقة لخيارات البحث والتصفية الخاصة بك.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLowStock = p.quantity <= p.lowStockThreshold;
                    const profitPerUnit = p.salePrice - p.costPrice;

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          isLowStock ? "bg-rose-500/[0.02]" : ""
                        }`}
                      >
                        {/* Name and Category */}
                        <td className="px-6 py-4 font-semibold text-white">
                          <div>
                            <span className="block font-bold">{p.name}</span>
                            <span className="text-[11px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full inline-block mt-1">
                              {p.category}
                            </span>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-6 py-4 font-mono text-zinc-300 text-xs">
                          {p.sku}
                        </td>

                        {/* Supplier */}
                        <td className="px-6 py-4 text-zinc-300 text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{p.supplierName}</span>
                          </div>
                        </td>

                        {/* Current Quantity with adjustments inline buttons */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Subtract button */}
                            <button
                              onClick={() => openAdjustStockModal(p, "subtract")}
                              disabled={p.quantity === 0}
                              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="سحب من المخزون (-)"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span
                              className={`w-12 text-center font-bold text-base ${
                                isLowStock ? "text-rose-500 text-glow" : "text-white"
                              }`}
                            >
                              {p.quantity}
                            </span>

                            {/* Add button */}
                            <button
                              onClick={() => openAdjustStockModal(p, "add")}
                              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 transition-all active:scale-90 cursor-pointer"
                              title="إضافة للمخزون (+)"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Low stock threshold */}
                        <td className="px-6 py-4 text-zinc-400 text-xs">
                          {p.lowStockThreshold} وحدات
                        </td>

                        {/* Cost and Sale Price */}
                        <td className="px-6 py-4 text-zinc-300 text-xs">
                          <div>
                            <span className="block text-zinc-400">التكلفة: {p.costPrice} ريال</span>
                            <span className="block text-primary-400 mt-0.5">البيع: {p.salePrice} ريال</span>
                          </div>
                        </td>

                        {/* Profit per unit */}
                        <td className="px-6 py-4">
                          <span className="text-emerald-400 font-bold text-xs">
                            +{profitPerUnit} ريال
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-4">
                          {p.quantity === 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500">
                              نفذ المخزون
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" />
                              حرِج
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              مستقر
                            </span>
                          )}
                        </td>

                        {/* Edit Button */}
                        <td className="px-6 py-4 text-left">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary-500/20 hover:border-primary-500/30 hover:text-primary-400 transition-all duration-300 active:scale-95 cursor-pointer"
                            title="تعديل تفاصيل المنتج"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* History log system to show dynamic changes */}
        <div className="glass-card bg-zinc-900/10 border border-white/5 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <History className="w-5 h-5 text-primary-500" />
              <span>سجل التعديلات والعمليات الأخيرة</span>
            </h3>
            <span className="text-xs text-zinc-500">محدث فورياً</span>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      log.type === "إضافة"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {log.type === "إضافة" ? (
                      <Plus className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {log.type === "إضافة" ? "تم توريد" : "تم سحب"}{" "}
                      <span className="text-primary-400 font-black">{log.amount}</span> وحدة من{" "}
                      <span className="text-zinc-300 font-semibold">{log.productName}</span>
                    </p>
                    <p className="text-zinc-500 mt-1">السبب: {log.reason}</p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full self-start sm:self-center">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit / New Product Modal Dialog */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="w-full max-w-xl bg-[#111116] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative animate-scaleUp">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-bold text-white">
                {isNewProduct ? "إضافة منتج جديد للمخازن" : "تعديل تفاصيل المنتج"}
              </h4>
              <button
                onClick={() => setEditProduct(null)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 mr-2">اسم المنتج</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: iPhone 15 Pro Max"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 placeholder-zinc-600"
                />
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 mr-2">رمز المنتج SKU</label>
                  <input
                    type="text"
                    required
                    disabled={!isNewProduct}
                    placeholder="مثال: APP-IP15P-256"
                    value={editProduct.sku}
                    onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 placeholder-zinc-600 disabled:opacity-50 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 mr-2">الفئة</label>
                  <select
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost Price & Sale Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 mr-2">سعر التكلفة (ريال)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0.00"
                    value={editProduct.costPrice || ""}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, costPrice: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 mr-2">سعر البيع المقترح (ريال)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0.00"
                    value={editProduct.salePrice || ""}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, salePrice: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Quantity & Low Stock Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 mr-2">الكمية الابتدائية</label>
                  <input
                    type="number"
                    min="0"
                    required
                    disabled={!isNewProduct}
                    placeholder="مثال: 10"
                    value={editProduct.quantity}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, quantity: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 placeholder-zinc-600 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 mr-2">حد المخزون المنخفض</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="مثال: 5"
                    value={editProduct.lowStockThreshold}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, lowStockThreshold: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Supplier Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 mr-2">اسم المورد</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-4 flex items-center text-zinc-600">
                    <Building className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شركة الموردين المعتمدة"
                    value={editProduct.supplierName}
                    onChange={(e) => setEditProduct({ ...editProduct, supplierName: e.target.value })}
                    className="w-full pl-4 pr-12 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer text-center"
                >
                  حفظ البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold text-sm active:scale-98 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal (Add / Subtract Quantity with Reason) */}
      {adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative animate-scaleUp">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span>{adjustType === "add" ? "إضافة مخزون (+)" : "سحب مخزون (-)"}</span>
                <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full font-mono">
                  {adjustProduct.sku}
                </span>
              </h4>
              <button
                onClick={() => setAdjustProduct(null)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400 space-y-1">
                <p>اسم المنتج: <span className="text-white font-bold">{adjustProduct.name}</span></p>
                <p>الكمية المتوفرة حالياً: <span className="text-primary-400 font-bold">{adjustProduct.quantity} وحدات</span></p>
              </div>

              {adjustError && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">{adjustError}</span>
                </div>
              )}

              {/* Amount to Adjust */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 mr-2">كمية التعديل</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Reason for Adjustment */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 mr-2">سبب التعديل (إلزامي)</label>
                <textarea
                  required
                  placeholder={
                    adjustType === "add"
                      ? "مثال: استلام توريد جديد من الموزع المحلي"
                      : "مثال: تسليم طلب رقم #12345"
                  }
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 h-24 placeholder-zinc-600 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className={`flex-1 py-3.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer ${
                    adjustType === "add"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/10"
                      : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/10"
                  }`}
                >
                  تأكيد التعديل
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustProduct(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold text-sm active:scale-98 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
