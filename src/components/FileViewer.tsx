import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Loader2, Download, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileMetadata } from '../types';
import { formatBytes, formatDate } from '../lib/utils';
import { generateFileNotes } from '../services/gemini';

interface FileViewerProps {
  file: FileMetadata | null;
  onClose: () => void;
  onUpdate: (file: FileMetadata) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
}

export default function FileViewer({ file, onClose, onUpdate, onDelete }: FileViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setNotes(file.notes);
      setIsEditing(false);
    }
  }, [file]);

  if (!file) return null;

  const handleGeminiSuggest = async () => {
    setIsGenerating(true);
    const suggestion = await generateFileNotes(name, notes);
    if (suggestion) {
      setNotes(suggestion);
      setIsEditing(true);
    }
    setIsGenerating(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, notes }),
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isImage = file.mimeType.startsWith('image/');

  return (
    <AnimatePresence>
      {file && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full flex flex-col md:flex-row gap-6 max-w-7xl mx-auto overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-0 right-0 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Preview Area */}
            <div className="flex-1 bg-black/40 rounded-3xl overflow-hidden flex items-center justify-center border border-white/10">
              {isImage ? (
                <img
                  src={`/uploads/${file.path}`}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-12">
                  <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Download className="w-12 h-12 text-white/40" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{file.name}</h2>
                  <p className="text-white/40 mb-8">This file type cannot be previewed directly.</p>
                  <a
                    href={`/uploads/${file.path}`}
                    download={file.originalName}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all"
                  >
                    <Download className="w-5 h-5" /> Download File
                  </a>
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="w-full md:w-96 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col">
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        placeholder="File name"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-white break-words">{file.name}</h2>
                    )}
                  </div>
                  <button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    disabled={isSaving}
                    className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isEditing ? (
                      <Save className="w-5 h-5" />
                    ) : (
                      <Edit3 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Size</p>
                    <p className="text-sm text-white/80 font-medium">{formatBytes(file.size)}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Type</p>
                    <p className="text-sm text-white/80 font-medium">{file.mimeType.split('/')[1].toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col mb-8">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Notes</p>
                  <button
                    onClick={handleGeminiSuggest}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Gemini Suggest
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                    placeholder="Add notes..."
                  />
                ) : (
                  <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 overflow-y-auto">
                    <p className="text-sm text-white/60 italic leading-relaxed">
                      {file.notes || 'No notes added yet.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Uploaded on</p>
                <p className="text-xs text-white/40 mb-6">{formatDate(file.uploadDate)}</p>
                
                <div className="flex gap-3">
                  <a
                    href={`/uploads/${file.path}`}
                    download={file.originalName}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-bold transition-all"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this file?')) {
                        onDelete(file.id);
                        onClose();
                      }
                    }}
                    className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-2xl text-red-400 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
