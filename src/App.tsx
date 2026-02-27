import React, { useState, useEffect } from 'react';
import { Plus, HardDrive, Loader2, CloudOff, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { FileMetadata, FileTypeFilter } from './types';
import UploadModal from './components/UploadModal';
import FileCard from './components/FileCard';
import FileViewer from './components/FileViewer';
import Filters from './components/Filters';
import Auth from './components/Auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !currentUser.emailVerified) {
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchFiles = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        type: typeFilter,
        sort: sortOrder,
      });
      const response = await fetch(`/api/files?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const debounce = setTimeout(fetchFiles, 300);
      return () => clearTimeout(debounce);
    }
  }, [search, typeFilter, sortOrder, user]);

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    fetch(`/api/files/${id}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          setFiles(prev => prev.filter(f => f.id !== id));
        }
      })
      .catch(error => {
        console.error('Delete failed:', error);
      });
  };

  const handleUpdate = (updatedFile: FileMetadata) => {
    setFiles(files.map(f => f.id === updatedFile.id ? updatedFile : f));
    if (selectedFile?.id === updatedFile.id) {
      setSelectedFile(updatedFile);
    }
  };

  const handleUploadSuccess = (newFile: FileMetadata) => {
    setFiles([newFile, ...files]);
    setSelectedFile(newFile); // Show preview immediately after upload
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">Gemini Drive</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Smart Storage</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-gray-900 leading-none">{user.displayName || 'User'}</p>
                <p className="text-[9px] text-gray-400 font-medium mt-1 truncate max-w-[120px]">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Upload File</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters & Search */}
        <Filters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {/* File Grid */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
              <p className="text-sm font-medium">Scanning your drive...</p>
            </div>
          ) : files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {files.map((file) => (
                  <motion.div key={file.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <FileCard
                      file={file}
                      onDelete={handleDelete}
                      onEdit={(f) => setSelectedFile(f)}
                      onView={(f) => setSelectedFile(f)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-12"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                <CloudOff className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-8">
                {search || typeFilter !== 'all' 
                  ? "We couldn't find any files matching your current filters."
                  : "Your drive is empty. Start by uploading your first file!"}
              </p>
              {!search && typeFilter === 'all' && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-8 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 shadow-sm transition-all"
                >
                  Upload your first file
                </button>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Modals & Overlays */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <FileViewer
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200/50 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-gray-400">
          <HardDrive className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {files.length} Files Stored
          </span>
        </div>
        <p className="text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Gemini Drive. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
