import React from 'react';

const SettingsPanel: React.FC = () => (
  <div className="space-y-3">
    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
    <div className="bg-white shadow-sm border border-gray-200 divide-y divide-gray-200">
      <div className="p-3">
        <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" defaultValue="QH Manage" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input type="email" className="w-full px-3 py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" defaultValue="admin@qhmanage.com" />
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium">Enable</button>
          </div>
          <div className="flex items-center justify-between">
            <div><h4 className="text-sm font-medium text-gray-900">Session Timeout</h4><p className="text-sm text-gray-500">Auto logout after inactivity</p></div>
            <select className="border border-gray-300 px-3 py-2 text-sm">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" defaultChecked /><span className="ml-2 text-sm text-gray-700">Email notifications for new users</span></label>
          <label className="flex items-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" defaultChecked /><span className="ml-2 text-sm text-gray-700">Security alerts</span></label>
          <label className="flex items-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><span className="ml-2 text-sm text-gray-700">Weekly reports</span></label>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-medium mr-3">Cancel</button>
      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium">Save Changes</button>
    </div>
  </div>
);

export default SettingsPanel;
