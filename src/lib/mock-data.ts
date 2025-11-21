// This file contains mock data to simulate a database for the SME DataBrain application.
// In a real-world application, this data would be sourced from user uploads and a persistent database.

export const mockBusinessData = {
  summary: {
    totalRevenue: 52340,
    totalExpenses: 31200,
    netProfit: 21140,
    topPerformingProduct: "Gadget Pro",
    customerAcquisition: 120, // new customers
    customerRetentionRate: 0.85,
  },
  revenue: [
    { month: "Jan", revenue: 40000 },
    { month: "Feb", revenue: 30000 },
    { month: "Mar", revenue: 50000 },
    { month: "Apr", revenue: 45000 },
    { month: "May", revenue: 60000 },
    { month: "Jun", revenue: 55000 },
  ],
  expenses: {
    breakdown: [
      { name: "Salaries", value: 15000 },
      { name: "Marketing", value: 8000 },
      { name: "Rent", value: 5000 },
      { name: "Utilities", value: 2200 },
      { name: "Supplies", value: 1000 },
    ],
    total: 31200,
  },
  products: {
    topSellers: [
      { product: "Gadget Pro", sales: 1200 },
      { product: "Widget Max", sales: 980 },
      { product: "Flexi-Thing", sales: 750 },
      { product: "Data-Sphere", sales: 600 },
      { product: "Connect-It", sales: 450 },
    ],
    inventory: [
      { productId: "GP01", name: "Gadget Pro", stock: 50, status: "In Stock" },
      { productId: "WM01", name: "Widget Max", stock: 12, status: "Low Stock" },
      { productId: "FT01", name: "Flexi-Thing", stock: 150, status: "In Stock" },
      { productId: "DS01", name: "Data-Sphere", stock: 0, status: "Out of Stock" },
      { productId: "CI01", name: "Connect-It", stock: 25, status: "In Stock" },
      { productId: "INV-ERR-01", name: "Widget Max", stock: -12, status: "Anomaly Detected" }
    ],
  },
  market: {
    trends: "Increase in demand for sustainable and eco-friendly gadgets.",
    competitorNews: "Competitor 'TechCorp' launched a new marketing campaign."
  }
};

// Stringified versions for AI flow inputs
export const mockFinancialData = JSON.stringify({ revenue: mockBusinessData.revenue, expenses: mockBusinessData.expenses });
export const mockOperationalData = JSON.stringify({ products: mockBusinessData.products });
export const mockMarketData = JSON.stringify(mockBusinessData.market);
export const fullBusinessDataString = JSON.stringify(mockBusinessData);
