import React from 'react';

const AnalyticsPanel: React.FC = () => (
  <div className="space-y-3">
    <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-white shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-sm text-gray-600">Direct</span><span className="text-sm font-medium">45%</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} /></div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-sm text-gray-600">Mobile</span><span className="text-sm font-medium">62%</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }} /></div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
        <div className="space-y-2">
          {['/dashboard', '/users', '/settings'].map((path, idx) => (
            <div key={path} className="flex justify-between text-sm"><span className="text-gray-600">{path}</span><span className="font-medium">{['1,234','856','432'][idx]} views</span></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsPanel;
