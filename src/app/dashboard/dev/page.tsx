'use client';

import { useState } from 'react';
import { Button } from '@chakra-ui/react';

export default function DevTools() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const seedData = async () => {
    setLoading(true);
    const res = await fetch('/api/dev/dummy', { method: 'POST' });
    const json = await res.json();
    setLoading(false);
    setResult(JSON.stringify(json, null, 2));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Dev Tools</h1>
      <Button onClick={seedData} disabled={loading}>
        {loading ? 'Seeding...' : 'Seed Dummy Data'}
      </Button>
      {result && (
        <pre className="p-4 bg-gray-100 text-sm overflow-auto border rounded">{result}</pre>
      )}
    </div>
  );
}
