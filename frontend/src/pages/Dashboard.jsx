import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import { Plus, Users, Search, CheckCircle, X } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newJob, setNewJob] = useState({ title: '', description: '', requiredSkills: '', location: '', salary: '', experienceRequired: '', deadline: '' });
  const [isPosting, setIsPosting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [profile, setProfile] = useState({ name: '', phone: '', education: '', experience: '', skills: '', resumeUrl: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  useEffect(() => {
    if (user?.role === 'EMPLOYER') {
      fetchEmployerData();
    } else if (user?.role === 'JOB_SEEKER') {
      fetchSeekerData();
    }
  }, [user]);

  const fetchEmployerData = async () => {
    try {
      const jobsRes = await api.get('/jobs/recruiter');
      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSeekerData = async () => {
    try {
      const jobsRes = await api.get('/jobs');
      setJobs(jobsRes.data);
      const appsRes = await api.get('/applications/my');
      setApplications(appsRes.data);
      const profileRes = await api.get('/job-seekers/profile');
      setProfile({
        name: profileRes.data.name || '',
        phone: profileRes.data.phone || '',
        education: profileRes.data.education || '',
        experience: profileRes.data.experience || '',
        skills: profileRes.data.skills || '',
        resumeUrl: profileRes.data.resumeUrl || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingResume(true);
    try {
      await api.post('/job-seekers/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Resume uploaded successfully!');
      fetchSeekerData(); // Refresh profile to get the new URL
    } catch (err) {
      console.error(err);
      alert('Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.put('/job-seekers/profile', profile);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', newJob);
      setIsPosting(false);
      setNewJob({ title: '', description: '', requiredSkills: '', location: '', salary: '', experienceRequired: '', deadline: '' });
      fetchEmployerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (jobId) => {
    const skills = prompt("Enter your skills (comma separated) for this application:", profile.skills);
    if (!skills) return;
    try {
      await api.post('/applications', { jobId, applicantSkills: skills });
      fetchSeekerData();
      alert('Application successful!');
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed');
    }
  };

  const handleViewApplicants = async (jobId) => {
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
      return;
    }
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setJobApplicants(res.data);
      setSelectedJobId(jobId);
    } catch (err) {
      console.error(err);
      alert('Failed to load applicants');
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      // Update local state
      setJobApplicants(jobApplicants.map(app => app.id === appId ? res.data : app));
      if (selectedApplication?.id === appId) {
        setSelectedApplication(null); // Close modal
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.requiredSkills.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  if (user?.role === 'EMPLOYER') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Employer Dashboard</h1>
          <button onClick={() => setIsPosting(!isPosting)} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Post New Job
          </button>
        </div>

        {isPosting && (
          <div className="glass-panel p-6 rounded-xl mb-8 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Create Job Posting</h2>
            <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Job Title" className="input-field" required
                value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
              <input type="text" placeholder="Required Skills (comma separated)" className="input-field" required
                value={newJob.requiredSkills} onChange={e => setNewJob({...newJob, requiredSkills: e.target.value})} />
              <input type="text" placeholder="Location" className="input-field"
                value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
              <input type="text" placeholder="Salary" className="input-field"
                value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} />
              <input type="text" placeholder="Experience Required (e.g. 2+ years)" className="input-field"
                value={newJob.experienceRequired} onChange={e => setNewJob({...newJob, experienceRequired: e.target.value})} />
              <input type="datetime-local" placeholder="Deadline" className="input-field"
                value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} />
              <textarea placeholder="Job Description" className="input-field md:col-span-2 h-32" required
                value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}></textarea>
              <button type="submit" className="btn-primary md:col-span-2">Publish Job</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map(job => (
            <div key={job.id} className="glass-panel p-6 rounded-xl hover:shadow-2xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-600">{job.title}</h3>
                  <p className="text-slate-500 text-sm">{job.location} • {job.salary}</p>
                </div>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700 mb-4 line-clamp-2">{job.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.requiredSkills.split(',').map((skill, i) => (
                  <span key={i} className="bg-brand-50 text-brand-700 px-2 py-1 rounded text-xs font-medium border border-brand-100">
                    {skill.trim()}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => handleViewApplicants(job.id)}
                className="text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1 text-sm mt-4">
                <Users size={16} /> {selectedJobId === job.id ? 'Hide Applicants' : 'View Applicants'}
              </button>

              {selectedJobId === job.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Applicants</h4>
                  {jobApplicants.length === 0 ? (
                    <p className="text-sm text-slate-500">No applicants yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {jobApplicants.map(app => (
                        <div key={app.id} className="bg-white border border-slate-200 p-4 rounded-lg flex justify-between items-center shadow-sm">
                          <div>
                            <p className="font-bold text-slate-800">{app.seekerName}</p>
                            <p className="text-xs text-slate-500 mb-1">Applied: {new Date(app.applicationDate).toLocaleDateString()}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="bg-brand-100 text-brand-700 px-2 py-1 rounded text-sm font-bold">
                              {app.matchScore.toFixed(0)}% Match
                            </span>
                            <button onClick={() => setSelectedApplication(app)} className="text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded transition-colors">
                              Evaluate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedApplication && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-slate-800">Skill Evaluation</h2>
                <button onClick={() => setSelectedApplication(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-brand-600">{selectedApplication.seekerName}</h3>
                    <p className="text-sm text-slate-500 mb-2">{selectedApplication.seekerEmail} • {selectedApplication.seekerPhone}</p>
                    {selectedApplication.resumeUrl && (
                      <a href={`${import.meta.env.PROD ? 'https://backend-production-c7a39.up.railway.app' : 'http://localhost:8080'}${selectedApplication.resumeUrl}`} target="_blank" rel="noreferrer" className="inline-block bg-brand-50 text-brand-700 px-3 py-1.5 rounded text-xs font-bold border border-brand-100 hover:bg-brand-100 transition-colors">
                        View Resume (PDF)
                      </a>
                    )}
                  </div>
                  <div className="text-center bg-brand-50 p-3 rounded-xl border border-brand-100">
                    <span className="block text-3xl font-black text-brand-600">{selectedApplication.matchScore.toFixed(0)}%</span>
                    <span className="text-xs font-medium text-brand-700 uppercase tracking-wider">Match Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">Education</h4>
                    <p className="text-slate-700 text-sm">{selectedApplication.seekerEducation || 'Not provided'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">Experience</h4>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{selectedApplication.seekerExperience || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-2">Required Skills (Job)</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.jobRequiredSkills?.split(',').map((skill, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-2 mt-4">Applicant Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.seekerSkills ? selectedApplication.seekerSkills.split(',').map((skill, i) => {
                        const requiredSkillsArray = selectedApplication.jobRequiredSkills?.toLowerCase().split(',').map(s => s.trim()) || [];
                        const isMatch = requiredSkillsArray.includes(skill.trim().toLowerCase());
                        return (
                          <span key={i} className={`border px-3 py-1 rounded-full text-xs font-medium ${isMatch ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {skill.trim()}
                          </span>
                        );
                      }) : <span className="text-sm text-slate-500">Not provided</span>}
                    </div>
                  </div>

                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'REJECTED')}
                    className="px-6 py-2.5 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Reject Applicant
                  </button>
                  <button 
                    onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'ACCEPTED')}
                    className="px-6 py-2.5 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
                  >
                    Accept Applicant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Job Seeker Dashboard</h1>
        <div className="flex bg-slate-200 rounded-lg p-1">
          <button 
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'jobs' ? 'bg-white shadow text-brand-700' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setActiveTab('jobs')}
          >
            Find Jobs
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'profile' ? 'bg-white shadow text-brand-700' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'profile' ? (
            <div className="glass-panel p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Settings</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" className="input-field" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="text" className="input-field" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
                  <textarea className="input-field h-24" placeholder="University, Degree, Year..." value={profile.education} onChange={e => setProfile({...profile, education: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                  <textarea className="input-field h-24" placeholder="Previous roles, responsibilities..." value={profile.experience} onChange={e => setProfile({...profile, experience: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                  <input type="text" className="input-field" placeholder="Java, React, SQL..." value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} />
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Resume (PDF)</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer btn-secondary px-4 py-2">
                      {isUploadingResume ? 'Uploading...' : 'Upload Resume'}
                      <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isUploadingResume} />
                    </label>
                    {profile.resumeUrl && (
                      <a href={`${import.meta.env.PROD ? 'https://backend-production-c7a39.up.railway.app' : 'http://localhost:8080'}${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-600 hover:text-brand-700 underline">
                        View Current Resume
                      </a>
                    )}
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full md:w-auto px-8" disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Search className="text-slate-400" />
                  <h2 className="text-2xl font-bold text-slate-800">Available Jobs</h2>
                </div>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Search by keyword or skill..." 
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Filter by location..." 
              className="input-field"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>

          {filteredJobs.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No jobs found matching your criteria.</p>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="glass-panel p-6 rounded-xl transition-all hover:border-brand-300">
                <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-brand-600">{job.title}</h3>
                  <p className="text-slate-600 font-medium">{job.companyName}</p>
                </div>
                <button 
                  onClick={() => handleApply(job.id)}
                  className="btn-primary py-1.5 px-4 text-sm"
                  disabled={applications.some(a => a.jobId === job.id)}
                >
                  {applications.some(a => a.jobId === job.id) ? 'Applied' : 'Apply Now'}
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-1 mb-4">{job.location} • {job.salary}</p>
              <p className="text-slate-700 mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.split(',').map((skill, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
            ))
            )}
            </>
          )}
        </div>

        <div>
          <div className="glass-panel p-6 rounded-xl sticky top-24">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle className="text-brand-500" size={20} /> My Applications
            </h2>
            {applications.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">You haven't applied to any jobs yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-slate-900">{app.jobTitle}</h4>
                    <p className="text-xs text-slate-500 font-medium">{app.companyName}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status}
                      </span>
                      <span className="text-sm font-bold text-brand-600">Match: {app.matchScore.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
