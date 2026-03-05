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
    <div className="representative-card overflow-hidden">
      <div className="p-6 pb-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="card-badge">Детализация по циклам</span>
        <button 
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 text-sm font-bold text-[#d4af37] hover:text-[#b5922b] transition-colors px-5 py-2.5 rounded-xl border-2 border-[#d4af37]/30 hover:bg-amber-50 hover:border-[#d4af37]/50"
        >
          <Download className="w-4 h-4" />
          Скачать CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
              <th className="p-4">Цикл</th>
              <th className="p-4">Начальный баланс</th>
              <th className="p-4 text-green-600">Доход (6.8%)</th>
              <th className="p-4 text-[#d4af37]">Реинвестировано</th>
              <th className="p-4">Конечный баланс</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
            {paginatedData.map((row) => (
              <tr key={row.stageNumber} className="hover:bg-amber-50/30 transition-colors">
                <td className="p-4 font-mono text-slate-500">#{row.stageNumber}</td>
                <td className="p-4 font-mono">{formatCurrency(row.principalAtStart)}</td>
                <td className="p-4 font-mono text-green-600">+{formatCurrency(row.gainAmount)}</td>
                <td className="p-4 font-mono text-[#d4af37]">{formatCurrency(row.reinvested)}</td>
                <td className="p-4 font-mono font-bold text-slate-900">{formatCurrency(row.principalAtEnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 flex justify-between items-center border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
                Показано {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, stages.length)} из {stages.length}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 border border-slate-200"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-mono text-slate-700 px-3">{currentPage} / {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 border border-slate-200"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};