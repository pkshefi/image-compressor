import React from 'react';

interface FileInfo {
  name: string;
  originalSize: number;
  compressedSize: number;
  status: 'compressing' | 'done' | 'error';
}

interface CompressedFilesListProps {
  files: FileInfo[];
}

const CompressedFilesList: React.FC<CompressedFilesListProps> = ({ files }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Compressed Files</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
            <div className="flex-1">
              <span className="font-medium">{file.name}</span>
              <div className="text-sm text-gray-600">
                {file.originalSize}KB → {file.compressedSize}KB
              </div>
            </div>
            <span className={`px-2 py-1 text-sm rounded ${
              file.status === 'done' ? 'bg-green-100 text-green-800' :
              file.status === 'compressing' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {file.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompressedFilesList;