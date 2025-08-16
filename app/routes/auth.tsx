import React, { useEffect } from 'react';

import { usePuterStore } from '../lib/puter';
import { useLocation, useNavigate } from 'react-router';

export const meta = () => ([
    { title: 'Resumify | Auth' },
    { name: 'description', content: 'Log into your account' },
])

const Auth = () => {
    const { isLoading, auth, error } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();
    
   useEffect(() => {
        if(auth.isAuthenticated) navigate(next);
    }, [auth.isAuthenticated, next])
return (<>


    <main className="bg-[url('/images/bg-main-dark.svg')] bg-cover min-h-screen flex items-center justify-center p-4">
        <div className="gradient-border shadow-2xl">
        <section className="flex flex-col gap-6 rounded-2xl p-10 max-w-md w-full">
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gradient">Welcome Back</h1>
                        <h2 className="text-gray-300 text-base">Sign in to continue your resume journey</h2>
                    </div>
                    
                    {error && (
                        <div className="text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-lg border border-red-800">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-center">
                    {isLoading ? (
                        <button className="auth-button">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <p>Signing you in...</p>
                            </div>
                        </button>
                    ) : (
                        <>
                            {auth.isAuthenticated ? (
                                <button 
                                    className="auth-button hover:scale-105 transition-transform duration-300"
                                    onClick={auth.signOut}
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <p>Log Out</p>
                                    </div>
                                </button>
                            ) : (
                                <button 
                                    className="auth-button hover:scale-105 transition-transform duration-300"
                                    onClick={auth.signIn}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        <p>Sign In with Puter</p>
                                    </div>
                                </button>
                            )}
                            
                        </>
                        
                    )}
                </div>
                <div className="flex justify-center pt-2">
                    <button 
                        onClick={() => navigate('/')}
                        className="px-8 py-3 text-lg font-semibold text-gray-300 hover:text-white border-2 border-gray-600 hover:border-gray-500 rounded-full transition-all duration-300 hover:bg-gray-700/50"
                        >
                        ← Return to Home
                    </button>
                </div>
                
              
                
               
                <div className="text-center text-gray-400 text-xs">
                    <p>Secure authentication powered by Puter</p>
                </div>
            </section>
        </div>
    </main>
    </>
)

}
export default Auth;