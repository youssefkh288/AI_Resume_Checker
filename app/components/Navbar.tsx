import { Link } from "react-router";
import { usePuterStore } from '../lib/puter';
import { useNavigate } from 'react-router';

const Navbar = () => {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUMIFY</p>
      </Link>
      <div className="flex items-center gap-4">
        {/* <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link> */}
        {!isLoading && (
          auth.isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-sm font-medium">
                {auth.user?.username || 'User'}
              </span>
              <button 
                onClick={auth.signOut}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/auth')}
              className="px-6 py-3 primary-gradient hover:primary-gradient-hover text-white rounded-full transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105"
            >
              Login
            </button>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;