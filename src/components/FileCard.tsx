import React, { useState } from 'react';
import { FileText, Image as ImageIcon, MoreVertical, Trash2, Edit3, ExternalLink, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { FileMetadata } from '../types';
import { formatBytes, formatDate } from '../lib/utils';

interface FileCardProps {
  file: FileMetadata;
  onDelete: (id: number) => void | Promise<void>;
  onEdit: (file: FileMetadata) => void;
  onView: (file: FileMetadata) => void;
}

export default function FileCard({ file, onDelete, onEdit, onView }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isImage = file.mimeType.startsWith('image/');

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      <div
        className="aspect-video bg-gray-50 relative cursor-pointer overflow-hidden group-hover:bg-gray-100 transition-colors"
        onClick={() => onView(file)}
      >
        {isImage ? (
          <img
            src={`/uploads/${file.path}`}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg">
            <ExternalLink className="w-5 h-5 text-gray-700" />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 pr-2" title={file.name}>
            {file.name}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                  <button
                    onClick={() => {
                      onEdit(file);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Details
                  </button>
                  <a
                    href={`/uploads/${file.path}`}
                    download={file.originalName}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      onDelete(file.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          <span>{formatBytes(file.size)}</span>
          <span>•</span>
          <span>{file.mimeType.split('/')[1]}</span>
        </div>

        {file.notes && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1 italic">
            "{file.notes}"
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-medium">
            {formatDate(file.uploadDate)}
          </span>
          {isImage ? (
            <ImageIcon className="w-3 h-3 text-indigo-400" />
          ) : (
            <FileText className="w-3 h-3 text-indigo-400" />
          )}
        </div>
      </div>
    </div>
  );
}
