import React, { useState, useMemo } from 'react';

export default function App() {
  // Timeline State (Months)
  const [projectionMonths, setProjectionMonths] = useState(6);
  const [savingsTarget, setSavingsTarget] = useState(15000);
  const [monthlyIncome, setMonthlyIncome] = useState(26000); // Updated to match your screenshot

  // Default Expenses Breakdown
  const [expenses, setExpenses] = useState([
    // Fixed Expenses
    { id: '1', name: 'Water & Electricity', amount: 2200, type: 'fixed' },
    { id: '2', name: 'Gym / Fitness', amount: 650, type: 'fixed' },
    { id: '3', name: 'Airtime & Data', amount: 850, type: 'fixed' },
    // Variable Expenses
    { id: '4', name: 'Groceries', amount: 6500, type: 'variable' },
    { id: '5', name: 'Petrol', amount: 3200, type: 'variable' },
    { id: '6', name: 'Dining & Entertainment', amount: 2800, type: 'variable' },
    { id: '7', name: 'Takeaways', amount: 1400, type: 'variable' }, // Added based on your screenshot
    // Savings & Emergency
    { id: '8', name: 'Stokvel / Savings Club', amount: 1500, type: 'savings' },
    { id: '9', name: 'Emergency Fund', amount: 2000, type: 'savings' },
  ]);

  // Adjustments simulator
  const [adjustments, setAdjustments] = useState({});

  // Dynamic Category Input State
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemType, setNewItemType] = useState('variable');

  // Handle adding custom item
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemAmount || isNaN(newItemAmount)) return;
    const newItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      amount: parseFloat(newItemAmount),
      type: newItemType,
    };
    setExpenses([...expenses, newItem]);
    setNewItemName('');
    setNewItemAmount('');
  };

  // Handle removing item
  const handleRemoveItem = (id) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  // Core Calculations
  const totals = useMemo(() => {
    let fixed = 0;
    let variable = 0;
    let savings = 0;
    let adjustedVariable = 0;

    expenses.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'fixed') {
        fixed += amt;
      } else if (item.type === 'savings') {
        savings += amt;
      } else {
        variable += amt;
        const discount = adjustments[item.id] || 0;
        adjustedVariable += amt * (1 - discount / 100);
      }
    });

    const totalOutflow = fixed + variable + savings;
    const adjustedOutflow = fixed + adjustedVariable + savings;
    const currentMonthlyNet = monthlyIncome - totalOutflow;
    const simulatedMonthlyNet = monthlyIncome - adjustedOutflow;

    const projectedSavingsCurrent = Math.max(0, currentMonthlyNet) * projectionMonths + (savings * projectionMonths);
    const projectedSavingsSimulated = Math.max(0, simulatedMonthlyNet) * projectionMonths + (savings * projectionMonths);

    const shortfall = Math.max(0, savingsTarget - projectedSavingsSimulated);

    return {
      fixed,
      variable,
      savings,
      totalOutflow,
      adjustedOutflow,
      currentMonthlyNet,
      simulatedMonthlyNet,
      projectedSavingsCurrent,
      projectedSavingsSimulated,
      shortfall,
      potentialMonthlyGain: totalOutflow - adjustedOutflow,
    };
  }, [expenses, monthlyIncome, adjustments, savingsTarget, projectionMonths]);

  const formatZAR = (val) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400 tracking-tight">
              📈 My Money Trajectory
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Capture spending, simulate adjustments, and project long-term financial path
            </p>
          </div>
          
          {/* Timeline Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 px-3">Horizon:</span>
            {[6, 8, 12].map((m) => (
              <button
                key={m}
                onClick={() => setProjectionMonths(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  projectionMonths === m
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {m} Months
              </button>
            ))}
          </div>
        </header>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Comes In (Income)</span>
            <div className="text-2xl font-bold mt-2 text-white flex items-center gap-1">
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="bg-transparent border-b border-slate-700 hover:border-emerald-500 focus:border-emerald-400 focus:outline-none w-full text-2xl font-bold text-white"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Goes Out (Expenses)</span>
            <div className="text-2xl font-bold mt-2 text-rose-400">{formatZAR(totals.totalOutflow)}</div>
            <span className="text-slate-500 text-xs mt-1 block">Fixed + Variable + Savings</span>
          </div>

          <div className={`p-5 rounded-xl border ${
            totals.currentMonthlyNet < 0
              ? 'bg-rose-950/30 border-rose-900/50 text-rose-200'
              : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'
          }`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Left Over</span>
            <div className="text-2xl font-bold mt-2">
              {formatZAR(totals.currentMonthlyNet)}
            </div>
            <span className="text-xs mt-1 block opacity-70">Monthly Net Cash Flow</span>
          </div>
        </div>

        {/* Trajectory Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Where it's heading</h3>
          <p className="text-slate-400 text-sm">
            If nothing changes, you would {totals.shortfall > 0 ? `fall short by ${formatZAR(totals.shortfall)}` : 'meet your target'} over {projectionMonths} months.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Grey: last 3 months. Coloured: next {projectionMonths} if the pattern continues.
          </p>
        </div>

        {/* Main Grid: Data Entry + Visual Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Data Capture & Expenses List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Custom Category Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">+</span> Add Custom Expense / Savings Item
              </h3>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Gym, Water)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 sm:col-span-1"
                />
                <input
                  type="number"
                  placeholder="Amount (R)"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 sm:col-span-1"
                />
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 sm:col-span-1"
                >
                  <option value="fixed">Fixed Expense</option>
                  <option value="variable">Variable Expense</option>
                  <option value="savings">Savings / Reserve</option>
                </select>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 sm:col-span-1"
                >
                  Add Item
                </button>
              </form>
            </div>

            {/* Expenses List Categorized */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
              <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3">
                Expense Breakdown & Custom Items
              </h3>
              
              {['fixed', 'variable', 'savings'].map((typeKey) => {
                const groupItems = expenses.filter(i => i.type === typeKey);
                const titleMap = {
                  fixed: 'Fixed Expenses (Bills, Gym, Data)',
                  variable: 'Variable Expenses (Groceries, Petrol, Takeaways)',
                  savings: 'Savings & Emergency Reserves (Outflows)'
                };
                
                return (
                  <div key={typeKey} className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span>{titleMap[typeKey]}</span>
                      <span>{formatZAR(groupItems.reduce((acc, curr) => acc + Number(curr.amount), 0))}</span>
                    </div>
                    <div className="space-y-2">
                      {groupItems.length === 0 ? (
                        <p className="text-slate-600 text-xs italic py-1">No items in this category.</p>
                      ) : (
                        groupItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-lg px-4 py-2.5">
                            <span className="text-sm font-medium text-slate-300">{item.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold text-slate-200">{formatZAR(item.amount)}</span>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-slate-500 hover:text-rose-400 transition-colors text-xs font-bold px-1"
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Trajectory & Simulator */}
          <div className="space-y-6">
            
            {/* Trajectory Simulation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3">
                Variable Spending Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Adjust flexible variable categories to eliminate your projected shortfall over the next {projectionMonths} months.
              </p>
              
              <div className="space-y-4">
                {expenses.filter(i => i.type === 'variable').map((item) => {
                  const currentDiscount = adjustments[item.id] || 0;
                  const itemSavings = (item.amount * currentDiscount) / 100;
                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="text-emerald-400 font-semibold">-{currentDiscount}% ({formatZAR(itemSavings)}/mo)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={currentDiscount}
                        onChange={(e) => setAdjustments({...adjustments, [item.id]: Number(e.target.value)})}
                        className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {totals.potentialMonthlyGain > 0 && (
                <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-lg p-3 text-xs text-emerald-300 flex items-center justify-between">
                  <span>Simulated Monthly Boost:</span>
                  <span className="font-bold text-sm">+{formatZAR(totals.potentialMonthlyGain)}/month</span>
                </div>
              )}
            </div>

            {/* Projection Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3">
                {projectionMonths}-Month Path Projection
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Savings Target</span>
                  <span className="font-semibold text-slate-200">{formatZAR(savingsTarget)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Base Trajectory</span>
                  <span className="font-semibold text-slate-200">{formatZAR(totals.projectedSavingsCurrent)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Simulated Trajectory</span>
                  <span className="font-semibold text-emerald-400">{formatZAR(totals.projectedSavingsSimulated)}</span>
                </div>
                <div className="flex justify-between py-1 pt-2 font-bold text-base">
                  <span className="text-slate-200">Final Outcome</span>
                  <span className={totals.shortfall > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {totals.shortfall > 0 ? `Shortfall: ${formatZAR(totals.shortfall)}` : 'Target Achieved!'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
