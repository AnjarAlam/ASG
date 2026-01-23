'use client';

import { Layers } from 'lucide-react';
import { stockData, StockRow } from '../components/mockData';

export default function StockTable() {
  // Step 1: Group data per day
  const dailyData = Object.values(
    stockData.reduce((acc: Record<string, any>, row) => {
      if (!acc[row.date]) {
        acc[row.date] = { date: row.date, inward: 0, outward: 0, balance: 0 };
      }
      acc[row.date].inward += parseInt(row.inward.replace(/,/g, ''));
      acc[row.date].outward += parseInt(row.outward.replace(/,/g, ''));
      acc[row.date].balance += parseInt(row.balance.replace(/,/g, ''));
      return acc;
    }, {})
  );

  // Step 2: Dynamically get all keys for table headers
  const columns = dailyData.length > 0 ? Object.keys(dailyData[0]) : [];

  return (
    <section>
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-3 text-gray-800">
        <Layers size={24} strokeWidth={2.1} />
        Daily Stock Summary
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col) => (
                <th
                  key={col}
                  className={`border border-gray-300 p-3.5 font-semibold text-gray-800 ${
                    col === 'date' ? 'text-left' : 'text-right'
                  }`}
                >
                  {col.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dailyData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => {
                  const value = row[col];
                  const isNumeric = typeof value === 'number';
                  return (
                    <td
                      key={col}
                      className={`border border-gray-300 p-3.5 ${
                        isNumeric ? 'text-right font-medium tabular-nums' : 'text-left'
                      }`}
                    >
                      {isNumeric ? value.toLocaleString() : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
    