import React, { useState } from 'react';
import { CalculationStage } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface Props {
  stages: CalculationStage[];
}

export const ResultsTable: React.FC<Props> = ({ stages }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(stages.length / itemsPerPage);

  const paginatedData = stages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownloadCSV = () => {
    const headers = ['Цикл', 'Начальный баланс', 'Доход (6.8%)', 'Конечный баланс', 'Реинвестировано'];
    const rows = stages.map(s => [
      s.stageNumber,
      s.principalAtStart.toFixed(2),
      s.gainAmount.toFixed(2),
      s.principalAtEnd.toFixed(2),
      s.reinvested.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ipg_investment_projection.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-serif font-bold text-white">Детализация по циклам</h3>
        <button 
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 text-sm text-gold hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          Скачать CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
              <th className="p-4 font-medium">Цикл</th>
              <th className="p-4 font-medium">Начальный баланс</th>
              <th className="p-4 font-medium text-green-400">Доход (6.8%)</th>
              <th className="p-4 font-medium text-gold">Реинвестировано</th>
              <th className="p-4 font-medium">Конечный баланс</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {paginatedData.map((row) => (
              <tr key={row.stageNumber} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-gray-500">#{row.stageNumber}</td>
                <td className="p-4 font-mono">{formatCurrency(row.principalAtStart)}</td>
                <td className="p-4 font-mono text-green-400">+{formatCurrency(row.gainAmount)}</td>
                <td className="p-4 font-mono text-gold">{formatCurrency(row.reinvested)}</td>
                <td className="p-4 font-mono font-bold text-white">{formatCurrency(row.principalAtEnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 flex justify-between items-center border-t border-white/10 bg-black/20">
            <span className="text-xs text-gray-500">
                Показано {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, stages.length)} из {stages.length}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-mono text-white px-2">{currentPage} / {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};