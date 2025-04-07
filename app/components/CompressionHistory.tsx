import React from 'react';

interface HistoryEntry {
  timestamp: string;
  fileName: string;
  operation: string;
  status: 'success' | 'failed';
}

interface CompressionHistoryProps {
  history: HistoryEntry[];
}

const CompressionHistory: React.FC<CompressionHistoryProps> = ({ history }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Compression History</h3>
      <div className="space-y-2">
        {history.map((entry, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{entry.fileName}</div>
              <div className="text-sm text-gray-600">
                {new Date(entry.timestamp).toLocaleString()} - {entry.operation}
              </div>
            </div>
            <span className={`px-2 py-1 text-sm rounded ${
              entry.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {entry.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompressionHistory;