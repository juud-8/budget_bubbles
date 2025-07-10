import React, { useState } from 'react';
import { useCategories } from '../contexts/CategoryContext';

const FREQUENCIES = [
  'Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'Yearly'
];
const MISC_CATEGORY = { id: 'misc', name: 'Misc/Other' };

const initialExpense = (categories) => ({
  name: '',
  amount: '',
  frequency: 'Monthly',
  nextDue: new Date().toISOString().slice(0, 10),
  category: '',
  notes: '',
});

const Expenses = () => {
  const { categories } = useCategories();
  const allCategories = [...categories, MISC_CATEGORY];
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState(initialExpense(categories));

  const handleAdd = () => {
    if (!newExpense.name || !newExpense.amount || isNaN(Number(newExpense.amount))) return;
    setExpenses([
      ...expenses,
      { ...newExpense, amount: parseFloat(newExpense.amount) },
    ]);
    setNewExpense(initialExpense(categories));
  };

  const handleDelete = (idx) => {
    setExpenses(expenses.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx, field, value) => {
    setExpenses(expenses.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">Recurring & Frequent Expenses</h1>
      <p className="text-gray-600 mb-6">Track your subscriptions, recurring bills, and frequent charges. Add new expenses below.</p>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Frequency</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Next Due</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Notes</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, idx) => {
              const cat = allCategories.find(cat => cat.id === exp.category) || MISC_CATEGORY;
              return (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input type="text" value={exp.name} onChange={e => handleEdit(idx, 'name', e.target.value)} className="w-32 border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input type="number" value={exp.amount} onChange={e => handleEdit(idx, 'amount', e.target.value)} className="w-24 border rounded px-2 py-1 text-right" />
                  </td>
                  <td className="px-3 py-2">
                    <select value={exp.frequency} onChange={e => handleEdit(idx, 'frequency', e.target.value)} className="w-28 border rounded px-2 py-1">
                      {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input type="date" value={exp.nextDue} onChange={e => handleEdit(idx, 'nextDue', e.target.value)} className="w-32 border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2">
                    <select value={exp.category} onChange={e => handleEdit(idx, 'category', e.target.value)} className="w-32 border rounded px-2 py-1">
                      <option value="">Misc/Other</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input type="text" value={exp.notes} onChange={e => handleEdit(idx, 'notes', e.target.value)} className="w-40 border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleDelete(idx)} className="text-red-500 hover:text-red-700"><span role="img" aria-label="delete">🗑️</span></button>
                  </td>
                </tr>
              );
            })}
            {/* New expense row */}
            <tr className="bg-blue-50">
              <td className="px-3 py-2">
                <input type="text" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} className="w-32 border rounded px-2 py-1" placeholder="Name" />
              </td>
              <td className="px-3 py-2 text-right">
                <input type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-24 border rounded px-2 py-1 text-right" placeholder="0.00" />
              </td>
              <td className="px-3 py-2">
                <select value={newExpense.frequency} onChange={e => setNewExpense({ ...newExpense, frequency: e.target.value })} className="w-28 border rounded px-2 py-1">
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </td>
              <td className="px-3 py-2">
                <input type="date" value={newExpense.nextDue} onChange={e => setNewExpense({ ...newExpense, nextDue: e.target.value })} className="w-32 border rounded px-2 py-1" />
              </td>
              <td className="px-3 py-2">
                <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} className="w-32 border rounded px-2 py-1">
                  <option value="">Misc/Other</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <input type="text" value={newExpense.notes} onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })} className="w-40 border rounded px-2 py-1" placeholder="Notes" />
              </td>
              <td className="px-3 py-2 text-center">
                <button onClick={handleAdd} className="text-blue-600 hover:text-blue-800"><span role="img" aria-label="add">➕</span></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses; 