import React, { useState } from 'react';
import { useCategories } from '../contexts/CategoryContext';
import { Plus, Trash2, Edit2, CheckSquare, Square } from 'lucide-react';

const MISC_CATEGORY = { id: 'misc', name: 'Misc/Other' };

const initialRow = (categories) => ({
  date: new Date().toISOString().slice(0, 10),
  description: '',
  amount: '',
  category: '', // allow blank
  cleared: false,
});

const CashFlow = () => {
  const { categories } = useCategories();
  const allCategories = [...categories, MISC_CATEGORY];
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState(initialRow(categories));

  // Add new transaction row
  const handleAdd = () => {
    if (!newRow.amount || isNaN(Number(newRow.amount))) return;
    setRows([
      ...rows,
      { ...newRow, amount: parseFloat(newRow.amount) },
    ]);
    setNewRow(initialRow(categories));
  };

  // Delete a row
  const handleDelete = (idx) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  // Edit a row (inline)
  const handleEdit = (idx, field, value) => {
    setRows(rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // Toggle cleared
  const handleToggleCleared = (idx) => {
    setRows(rows.map((row, i) => i === idx ? { ...row, cleared: !row.cleared } : row));
  };

  // Calculate running balance
  const getBalance = (upToIdx) => {
    return rows.slice(0, upToIdx + 1).reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  };

  // Calculate total balance
  const totalBalance = rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const balanceColor = totalBalance > 0 ? 'text-green-600' : totalBalance < 0 ? 'text-red-600' : 'text-gray-700';

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">Cash Flow</h1>
      <p className="text-gray-600 mb-6">Quickly enter transactions and see your running cash balance. Mark transactions as cleared when processed by your bank.</p>
      {/* Account Balance Box */}
      <div className={`mb-6 flex items-center justify-between`}>
        <div className={`px-6 py-3 rounded-lg bg-gray-50 border font-bold text-lg ${balanceColor}`}>Account Balance: {totalBalance.toFixed(2)}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Description</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Cleared</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Balance</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const cat = allCategories.find(cat => cat.id === row.category) || MISC_CATEGORY;
              return (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input type="date" value={row.date} onChange={e => handleEdit(idx, 'date', e.target.value)} className="w-32 border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="text" value={row.description} onChange={e => handleEdit(idx, 'description', e.target.value)} className="w-40 border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input type="number" value={row.amount} onChange={e => handleEdit(idx, 'amount', e.target.value)} className="w-24 border rounded px-2 py-1 text-right" />
                  </td>
                  <td className="px-3 py-2">
                    <select value={row.category} onChange={e => handleEdit(idx, 'category', e.target.value)} className="w-32 border rounded px-2 py-1">
                      <option value="">Misc/Other</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleToggleCleared(idx)}>
                      {row.cleared ? <CheckSquare className="w-5 h-5 text-green-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {getBalance(idx).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleDelete(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
            {/* New row for quick entry */}
            <tr className="bg-blue-50">
              <td className="px-3 py-2">
                <input type="date" value={newRow.date} onChange={e => setNewRow({ ...newRow, date: e.target.value })} className="w-32 border rounded px-2 py-1" />
              </td>
              <td className="px-3 py-2">
                <input type="text" value={newRow.description} onChange={e => setNewRow({ ...newRow, description: e.target.value })} className="w-40 border rounded px-2 py-1" placeholder="Description" />
              </td>
              <td className="px-3 py-2 text-right">
                <input type="number" value={newRow.amount} onChange={e => setNewRow({ ...newRow, amount: e.target.value })} className="w-24 border rounded px-2 py-1 text-right" placeholder="0.00" />
              </td>
              <td className="px-3 py-2">
                <select value={newRow.category} onChange={e => setNewRow({ ...newRow, category: e.target.value })} className="w-32 border rounded px-2 py-1">
                  <option value="">Misc/Other</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2 text-center">
                <button onClick={() => setNewRow({ ...newRow, cleared: !newRow.cleared })}>
                  {newRow.cleared ? <CheckSquare className="w-5 h-5 text-green-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                </button>
              </td>
              <td className="px-3 py-2 text-right font-mono text-gray-400">—</td>
              <td className="px-3 py-2 text-center">
                <button onClick={handleAdd} className="text-blue-600 hover:text-blue-800"><Plus className="w-4 h-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlow; 