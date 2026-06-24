import { Link } from 'react-router-dom';
import { Search, Star, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center pt-20 px-4 bg-slate-50">
      <div className="max-w-4xl w-full text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Dream Job</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          The smart job portal that matches your skills with the perfect employer using advanced analytics and evaluation algorithms.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg px-8 py-4">
            Get Started Now
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-4">
            I already have an account
          </Link>
        </div>
      </div>

      <div className="max-w-5xl w-full mt-24 grid md:grid-cols-3 gap-8 pb-20">
        <div className="glass-panel p-8 rounded-2xl text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Search size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Matching</h3>
          <p className="text-slate-600">Our algorithm connects you with jobs that perfectly align with your skills and experience.</p>
        </div>
        
        <div className="glass-panel p-8 rounded-2xl text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Star size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Skill Evaluation</h3>
          <p className="text-slate-600">Take assessments to prove your capabilities and stand out to top employers worldwide.</p>
        </div>
        
        <div className="glass-panel p-8 rounded-2xl text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Career Analytics</h3>
          <p className="text-slate-600">Track your application success rates and discover areas for professional growth.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
