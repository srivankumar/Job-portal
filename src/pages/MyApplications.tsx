import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applicationApi } from "../services/api";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Award,
  ExternalLink
} from "lucide-react";

interface Application {
  id: string;
  resume_url: {
    key: string;
    timestamp: number;
  };
  ats_score: number;
  status: "pending" | "shortlisted" | "rejected";
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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await applicationApi.getMyApplications();
      if (response?.applications) {
        setApplications(response.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Fetch applications error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resumeKey: string) => {
    try {
      setError(null);
      const { url } = await applicationApi.getResumeDownloadUrl(resumeKey);
      window.open(url, "_blank", "noopener");
    } catch (err) {
      console.error("Resume download error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to download resume"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "Shortlisted";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-3xl font-bold mb-6">My Applications</h1>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded shadow">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p>No applications found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white border rounded-lg p-6"
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {application.job.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-2">
                      {application.job.description}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm border ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Applied: {formatDate(application.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>ATS: {application.ats_score}/100</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <button
                      onClick={() => handleDownload(application.resume_url.key)}
                      className="flex items-center gap-1 text-slate-900 hover:underline"
                    >
                      <span>View Resume</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      application.ats_score >= 70
                        ? "bg-green-600"
                        : application.ats_score >= 40
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                    style={{ width: `${application.ats_score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
