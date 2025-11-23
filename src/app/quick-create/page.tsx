"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickCreate() {
  const [formData, setFormData] = useState({
    type: 'auto',
    coverageAmount: 0,
    premium: 0,
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get user ID from localStorage (your auth method)
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      if (!user) {
        setError('Please log in to create a policy');
        return;
      }

      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.id }),
      });

      if (res.ok) {
        alert('Policy created successfully!');
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create policy');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4">Quick Create Policy</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full p-2 border rounded mb-4"
          required
        >
          <option value="auto">Auto Insurance</option>
          <option value="home">Home Insurance</option>
          <option value="health">Health Insurance</option>
        </select>
        <input
          type="number"
          placeholder="Coverage Amount ($)"
          value={formData.coverageAmount}
          onChange={(e) => setFormData({ ...formData, coverageAmount: Number(e.target.value) })}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="number"
          placeholder="Premium ($)"
          value={formData.premium}
          onChange={(e) => setFormData({ ...formData, premium: Number(e.target.value) })}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
          {loading ? 'Creating...' : 'Create Policy'}
        </button>
      </form>
    </div>
  );
}