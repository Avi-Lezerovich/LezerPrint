'use client';

import { useState, useEffect, useMemo } from 'react';
import { historyService, PrintJob, PrintStatistics } from '@/services/historyService';

export default function HistoryPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [statistics, setStatistics] = useState<PrintStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load jobs and statistics in parallel
      const [jobsResponse, statsResponse] = await Promise.all([
        historyService.getDemoJobs(), // Using demo for portfolio
        historyService.getDemoStatistics(),
      ]);

      setJobs(jobsResponse.jobs);
      setStatistics(statsResponse.statistics);
    } catch (err) {
      console.error('Error loading history data:', err);
      setError('Failed to load print history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    return filtered;
  }, [jobs, statusFilter, sortBy, sortOrder]);

  const handleDeleteJob = async (jobId: string) => {
    try {
      await historyService.deleteJob(jobId);
      await loadData(); // Reload data
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
    }
  };

  if (loading && !statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading print history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading History</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Print History</h1>
              <p className="text-gray-600 mt-1">
                Manage and analyze your printing activity
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
                Export History
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Prints</h3>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalPrints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                  <p className="text-2xl font-bold text-gray-900">{statistics.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⏱️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Time</h3>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalPrintTime.toFixed(1)}h</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🧵</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Filament Used</h3>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalFilamentUsed.toFixed(1)}g</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                    Status:
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="printing">Printing</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label htmlFor="sort-by" className="text-sm font-medium text-gray-700">
                    Sort:
                  </label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="completedAt">Date Completed</option>
                    <option value="filename">Filename</option>
                    <option value="actualDuration">Duration</option>
                    <option value="filamentUsed">Filament Used</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {filteredJobs.length} jobs
                </span>
                <button
                  onClick={loadData}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="text-lg">
                            {historyService.getStatusIcon(job.status)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {job.filename}
                          </div>
                          {job.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {job.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${historyService.getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {job.progress.toFixed(1)}%
                        {job.currentLayer && job.totalLayers && (
                          <span> • Layer {job.currentLayer}/{job.totalLayers}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.actualDuration ? historyService.formatDuration(job.actualDuration) : 
                       job.estimatedDuration ? `~${historyService.formatDuration(job.estimatedDuration)}` : 
                       '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.filamentUsed ? `${job.filamentUsed.toFixed(1)}g` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                      <div className="text-xs">
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {['completed', 'failed', 'cancelled'].includes(job.status) && (
                        <button
                          onClick={() => setShowDeleteConfirm(job.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No print jobs found</h3>
                <p className="text-gray-500">
                  {statusFilter === 'all' 
                    ? "You haven't printed anything yet. Start your first print to see history here."
                    : `No ${statusFilter} jobs found. Try changing the filter.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedJob.filename}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Job ID: {selectedJob.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Print Details</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Status</dt>
                      <dd className={`text-sm px-2 py-1 rounded w-fit ${historyService.getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Progress</dt>
                      <dd className="text-sm text-gray-900">{selectedJob.progress.toFixed(1)}%</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Layer</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedJob.currentLayer || 0} / {selectedJob.totalLayers || 'Unknown'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Print Settings</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Layer Height</dt>
                      <dd className="text-sm text-gray-900">{selectedJob.layerHeight}mm</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Print Speed</dt>
                      <dd className="text-sm text-gray-900">{selectedJob.printSpeed}mm/s</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Temperatures</dt>
                      <dd className="text-sm text-gray-900">
                        Hotend: {selectedJob.temperatures.hotend}°C, Bed: {selectedJob.temperatures.bed}°C
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Timing & Materials</h4>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Started</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedJob.startedAt ? new Date(selectedJob.startedAt).toLocaleString() : 'Not started'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Completed</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedJob.completedAt ? new Date(selectedJob.completedAt).toLocaleString() : 'In progress'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Duration</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedJob.actualDuration ? historyService.formatDuration(selectedJob.actualDuration) : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Filament Used</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedJob.filamentUsed ? `${selectedJob.filamentUsed.toFixed(1)}g` : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              {selectedJob.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selectedJob.notes}
                  </p>
                </div>
              )}

              {selectedJob.errorMessage && (
                <div>
                  <h4 className="font-medium text-red-900 mb-3">Error Details</h4>
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                    {selectedJob.errorMessage}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedJob.status === 'printing' && (
                <button
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                >
                  Cancel Print
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Print Job</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this print job from your history? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeleteJob(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}