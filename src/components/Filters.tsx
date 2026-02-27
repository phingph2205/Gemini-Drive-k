import React from 'react';
import { Search, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { FileTypeFilter } from '../types';

interface FiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: FileTypeFilter;
  onTypeFilterChange: (val: FileTypeFilter) => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (val: 'newest' | 'oldest') => void;
}

export default function Filters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sortOrder,
  onSortOrderChange,
}: FiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search files by name or notes..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
          {(['all', 'image', 'document', 'other'] as FileTypeFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => onTypeFilterChange(type)}
              className={`
                px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                ${typeFilter === type ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}
              `}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSortOrderChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-all text-gray-500 flex items-center gap-2"
          title={sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
        >
          {sortOrder === 'newest' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
          <span className="text-xs font-bold uppercase tracking-wider hidden lg:inline">
            {sortOrder}
          </span>
        </button>
      </div>
    </div>
  );
}
