import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationApi } from '../services/api';
import { ArrowLeft, FileText, Calendar, Award, ExternalLink } from 'lucide-react';

interface Application {
  id: string;
  resume_url: string;
  ats_score: number;
  status: 'pending' | 'shortlisted' | 'rejected';
  created_at: string;
  job: {
    id: string;
    title: string;
    description: string;
  };
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const response = await applicationApi.getMyApplications();
    if (response.applications) {
      setApplications(response.applications);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'Shortlisted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-600">Track your job applications and their status</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-slate-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">You haven't applied to any jobs yet</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-900 font-medium hover:underline"
            >
              Browse available jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {application.job.title}
                    </h3>
                    <p className="text-slate-600 mb-3 line-clamp-2">
                      {application.job.description}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Applied: {formatDate(application.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">ATS Score: {application.ats_score}/100</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600">
                    <FileText className="w-4 h-4" />
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-900 hover:underline flex items-center space-x-1"
                    >
                      <span>View Resume</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      application.ats_score >= 70
                        ? 'bg-green-600'
                        : application.ats_score >= 40
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${application.ats_score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
