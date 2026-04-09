import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import clsx from 'clsx';

interface DropZoneProps {
  onFileParsed: (csvText: string, fileName: string) => void;
}

export default function DropZone({ onFileParsed }: DropZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted: File[], rejected: unknown[]) => {
    setError('');
    if ((rejected as { file: File }[]).length > 0) {
      setError('Only CSV files are accepted.');
      return;
    }
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onFileParsed(text, f.name);
    };
    reader.readAsText(f);
  }, [onFileParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.txt'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  function clearFile() {
    setFile(null);
    setError('');
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 truncate">{file.name}</p>
          <p className="text-xs text-green-500">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button onClick={clearFile} className="text-green-400 hover:text-green-600 p-1 flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className={clsx('h-8 w-8 mx-auto mb-3', isDragActive ? 'text-blue-500' : 'text-gray-300')} />
        <p className="text-sm font-medium text-gray-600">
          {isDragActive ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
        </p>
        <p className="text-xs text-gray-400 mt-1">or <span className="text-blue-500 underline">browse to upload</span> · max 10 MB</p>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
