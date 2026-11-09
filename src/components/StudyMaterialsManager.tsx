import React, { useState, useRef, useMemo } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Paperclip, 
  Trash2, 
  Eye, 
  Download, 
  Search, 
  Filter, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  Plus, 
  Clock, 
  FolderOpen,
  ArrowRight,
  BookOpen
} from 'lucide-react';

// --- DATA TYPES ---

export interface FileAttachment {
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  extension: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface Note {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  batch: string;
  date: string;
  link?: string;
  content: string;
  attachment?: FileAttachment;
}

interface StudyMaterialsManagerProps {
  notes: Note[];
  onAddNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  currentRole: 'teacher' | 'student';
  currentTeacherId: string;
  teacherBatchNames: string[];
  activeStudentBatch?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

const getFileIcon = (ext: string) => {
  switch (ext) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-rose-500" />;
    case 'doc':
    case 'docx':
      return <File className="w-5 h-5 text-blue-500" />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    default:
      return <FileText className="w-5 h-5 text-indigo-500" />;
  }
};

const getFileBadgeColor = (ext: string): string => {
  switch (ext) {
    case 'pdf':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'doc':
    case 'docx':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function StudyMaterialsManager({
  notes,
  onAddNote,
  onDeleteNote,
  currentRole,
  currentTeacherId,
  teacherBatchNames,
  activeStudentBatch
}: StudyMaterialsManagerProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'pdf' | 'docs' | 'images' | 'sheets' | 'text'>('ALL');

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  // Form states for new note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteBatch, setNoteBatch] = useState(teacherBatchNames[0] || 'ALL');
  const [noteContent, setNoteContent] = useState('');
  const [activeInputTab, setActiveInputTab] = useState<'both' | 'text' | 'file'>('both');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed extensions & mime types: PDF, DOCX, PNG, JPG, XLSX
  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'xlsx', 'xls', 'csv'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleProcessFile = (file: File) => {
    setFileError('');

    // Size validation (Max 10MB)
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File "${file.name}" exceeds the maximum 10MB limit (${formatFileSize(file.size)}).`);
      return;
    }

    // Extension validation
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`Invalid file format ".${ext}". Allowed: PDF, DOCX, PNG, JPG, XLSX.`);
      return;
    }

    // Read as DataURL for browser persistence & 1-click preview/download
    const reader = new FileReader();
    reader.onload = () => {
      const attachment: FileAttachment = {
        name: file.name,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        type: file.type || `application/${ext}`,
        extension: ext,
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString()
      };
      setSelectedFile(attachment);
      if (!noteTitle) {
        // Auto-fill title from filename
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNoteTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      setFileError('Please provide a title for the study notes.');
      return;
    }

    if (!noteContent.trim() && !selectedFile) {
      setFileError('Please enter text content OR upload an attached file.');
      return;
    }

    const newNote: Note = {
      id: `n_${Date.now()}`,
      teacherId: currentTeacherId,
      title: noteTitle.trim(),
      subject: noteSubject.trim() || 'General Academics',
      batch: noteBatch || 'ALL',
      date: new Date().toISOString().split('T')[0],
      link: selectedFile ? selectedFile.name : '#',
      content: noteContent.trim() || (selectedFile ? `File attachment: ${selectedFile.name} (${selectedFile.sizeFormatted})` : ''),
      attachment: selectedFile || undefined
    };

    onAddNote(newNote);
    setShowUploadModal(false);
    setNoteTitle('');
    setNoteSubject('');
    setNoteContent('');
    setSelectedFile(null);
    setFileError('');
  };

  // Download handler for notes & attachments
  const handleDownloadAttachment = (note: Note) => {
    if (note.attachment?.dataUrl) {
      const a = document.createElement('a');
      a.href = note.attachment.dataUrl;
      a.download = note.attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Export markdown text note
      const text = `# ${note.title}\nSubject: ${note.subject}\nBatch: ${note.batch}\nDate: ${note.date}\n\n${note.content}`;
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Search and filter logic
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      // Search matching title, content, subject, batch, or attachment name
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        !searchQuery ||
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.batch.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.attachment && n.attachment.name.toLowerCase().includes(q));

      // Batch filter
      const matchBatch = 
        selectedBatchFilter === 'ALL' || 
        n.batch === selectedBatchFilter || 
        n.batch === 'ALL';

      // Type filter
      let matchType = true;
      if (selectedTypeFilter === 'pdf') {
        matchType = n.attachment?.extension === 'pdf';
      } else if (selectedTypeFilter === 'docs') {
        matchType = ['doc', 'docx'].includes(n.attachment?.extension || '');
      } else if (selectedTypeFilter === 'images') {
        matchType = ['png', 'jpg', 'jpeg', 'webp'].includes(n.attachment?.extension || '');
      } else if (selectedTypeFilter === 'sheets') {
        matchType = ['xlsx', 'xls', 'csv'].includes(n.attachment?.extension || '');
      } else if (selectedTypeFilter === 'text') {
        matchType = !n.attachment;
      }

      return matchSearch && matchBatch && matchType;
    });
  }, [notes, searchQuery, selectedBatchFilter, selectedTypeFilter]);

  // Statistics
  const totalNotesCount = notes.length;
  const filesCount = notes.filter(n => !!n.attachment).length;
  const totalBytes = notes.reduce((sum, n) => sum + (n.attachment?.size || 0), 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Study Materials & Notes Desk</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Subject revision notes, formula compendiums, solved worksheets & document attachments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Quick Metrics */}
          <div className="hidden sm:flex items-center space-x-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span><strong>{totalNotesCount}</strong> Total Items</span>
            <span className="text-slate-300">•</span>
            <span><strong>{filesCount}</strong> Attached Files</span>
            <span className="text-slate-300">•</span>
            <span><strong>{formatFileSize(totalBytes)}</strong></span>
          </div>

          {currentRole === 'teacher' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowUploadModal(true);
                  setActiveInputTab('file');
                  setFileError('');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                title="Select and attach PDF, DOCX, PNG, JPG, or XLSX files from your computer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File from Computer</span>
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(true);
                  setActiveInputTab('text');
                  setFileError('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-200"
                title="Type or paste text notes directly"
              >
                <Plus className="w-4 h-4" />
                <span>Write Text Note</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, topic, batch, or file name..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Batch Filter */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Batches</option>
            {teacherBatchNames.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* File Type Filter Pills */}
        <div className="flex items-center overflow-x-auto pb-1 md:pb-0 gap-1 text-xs shrink-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'pdf', label: 'PDFs' },
            { id: 'docs', label: 'Word' },
            { id: 'images', label: 'Images' },
            { id: 'sheets', label: 'Sheets' },
            { id: 'text', label: 'Text Only' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedTypeFilter(type.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedTypeFilter === type.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCHABLE STUDY NOTES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => {
          const hasAttachment = !!note.attachment;
          const ext = note.attachment ? note.attachment.extension : 'txt';

          return (
            <div
              key={note.id}
              className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Subject & Date Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {note.subject}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {note.date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-base mt-2.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {note.title}
                </h3>

                {/* Text Preview */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {note.content}
                </p>

                {/* Attachment Chip (if present) */}
                {hasAttachment && note.attachment && (
                  <div className={`mt-3 p-2.5 rounded-xl border flex items-center space-x-2.5 ${getFileBadgeColor(ext)}`}>
                    <div className="p-1.5 bg-white rounded-lg shadow-2xs shrink-0">
                      {getFileIcon(ext)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{note.attachment.name}</p>
                      <p className="text-[10px] opacity-75">{note.attachment.sizeFormatted} • {ext.toUpperCase()}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Batch Badge & Action Buttons */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[120px]">
                  {note.batch}
                </span>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {/* View / Read Button */}
                  <button
                    onClick={() => setViewingNote(note)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                    title="View note details and full content"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  {/* 1-Click Download Button */}
                  <button
                    onClick={() => handleDownloadAttachment(note)}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                    title={hasAttachment ? `Download attached ${note.attachment?.name}` : 'Download notes document'}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  {/* Teacher Delete Button */}
                  {currentRole === 'teacher' && (
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete study note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No study notes found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? `No results matching "${searchQuery}". Try adjusting your keywords or filters.` 
                : 'No notes uploaded for this batch yet. Teachers can upload PDF, Word, spreadsheets, or text guides above.'}
            </p>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* DUAL-INPUT UPLOAD MODAL (TEACHERS ONLY) */}
      {/* ===================================================================== */}
      {showUploadModal && currentRole === 'teacher' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Upload Study Materials</h3>
                  <p className="text-xs text-slate-500">Attach files (PDF, DOCX, PNG, JPG, XLSX) or write notes</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleCreateNoteSubmit} className="space-y-4 text-xs">
              
              {/* Title & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title / Topic Name *</label>
                  <input
                    required
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Thermodynamics Solved Numericals"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Specialization *</label>
                  <input
                    required
                    type="text"
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Batch Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Student Batch *</label>
                <select
                  value={noteBatch}
                  onChange={(e) => setNoteBatch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
                >
                  <option value="ALL">All Batches (Public to all enrolled students)</option>
                  {teacherBatchNames.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Only students enrolled in this batch will be able to access this material.
                </p>
              </div>

              {/* DUAL-INPUT MODE TABS */}
              <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Note Content & System File Attachment</span>
                  <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveInputTab('both')}
                      className={`px-2.5 py-1 rounded-md transition-all ${activeInputTab === 'both' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                    >
                      Dual Input
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInputTab('file')}
                      className={`px-2.5 py-1 rounded-md transition-all ${activeInputTab === 'file' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                    >
                      File Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInputTab('text')}
                      className={`px-2.5 py-1 rounded-md transition-all ${activeInputTab === 'text' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'}`}
                    >
                      Text Only
                    </button>
                  </div>
                </div>

                {/* 1. Drag & Drop File Upload Zone */}
                {(activeInputTab === 'both' || activeInputTab === 'file') && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      System File Attachment (Max 10MB)
                    </label>

                    {!selectedFile ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-indigo-500 bg-indigo-50/80'
                            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-700 text-xs">
                          Click to browse or drag and drop your file here
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Supported formats: PDF, DOCX, PNG, JPG, XLSX (Up to 10MB)
                        </p>
                      </div>
                    ) : (
                      /* Preview & Remove Chip */
                      <div className="p-3 bg-white border border-indigo-200 rounded-xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                            {getFileIcon(selectedFile.extension)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-slate-500">{selectedFile.sizeFormatted} • {selectedFile.extension.toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                            <Check className="w-3 h-3" /> Ready
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove attached file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Direct Text / Formula Input */}
                {(activeInputTab === 'both' || activeInputTab === 'text') && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Direct Text Notes / Summary / Formulas
                    </label>
                    <textarea
                      rows={3}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Type or paste formula summaries, key derivations, or study notes..."
                      className="w-full p-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs leading-relaxed"
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {fileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Publish Study Material</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1-CLICK VIEW / PREVIEW MODAL */}
      {/* ===================================================================== */}
      {viewingNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {viewingNote.subject} • {viewingNote.batch}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{viewingNote.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Published on {viewingNote.date}</p>
              </div>
              <button
                onClick={() => setViewingNote(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note Text Content */}
            {viewingNote.content && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-64 overflow-y-auto">
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {viewingNote.content}
                </p>
              </div>
            )}

            {/* Attachment Preview (if any) */}
            {viewingNote.attachment && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Attached Document:</label>
                
                {/* Image Inline Preview */}
                {['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(viewingNote.attachment.extension) && viewingNote.attachment.dataUrl && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 flex items-center justify-center bg-slate-950 p-2">
                    <img 
                      src={viewingNote.attachment.dataUrl} 
                      alt={viewingNote.attachment.name}
                      className="max-h-60 max-w-full object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* File Attachment Chip */}
                <div className={`p-3 rounded-2xl border flex items-center justify-between ${getFileBadgeColor(viewingNote.attachment.extension)}`}>
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-xl shadow-2xs shrink-0">
                      {getFileIcon(viewingNote.attachment.extension)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{viewingNote.attachment.name}</p>
                      <p className="text-[10px] opacity-75">{viewingNote.attachment.sizeFormatted} • {viewingNote.attachment.extension.toUpperCase()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadAttachment(viewingNote)}
                    className="px-3 py-1.5 bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold border border-indigo-200 shadow-2xs flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-xs text-slate-400">
                {viewingNote.attachment ? 'Includes 1 attached file' : 'Direct text note'}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownloadAttachment(viewingNote)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {viewingNote.attachment ? viewingNote.attachment.extension.toUpperCase() : 'Notes (.md)'}</span>
                </button>
                <button
                  onClick={() => setViewingNote(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

