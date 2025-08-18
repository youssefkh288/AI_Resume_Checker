import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useNavigate, Link, useLocation, useParams } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { create } from "zustand";
import { useEffect, useState, useCallback, createContext, useContext, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const getPuter = () => typeof window !== "undefined" && window.puter ? window.puter : null;
const usePuterStore = create((set, get) => {
  const setError = (msg) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        user: null,
        isAuthenticated: false,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: get().auth.getUser
      }
    });
  };
  const checkAuthStatus = async () => {
    console.log("checkAuthStatus: Starting auth check...");
    const puter = getPuter();
    if (!puter) {
      console.error("checkAuthStatus: Puter.js not available");
      setError("Puter.js not available");
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      console.log("checkAuthStatus: Checking if user is signed in...");
      const isSignedIn = await puter.auth.isSignedIn();
      console.log("checkAuthStatus: isSignedIn result:", isSignedIn);
      if (isSignedIn) {
        console.log("checkAuthStatus: User is signed in, getting user data...");
        const user = await puter.auth.getUser();
        console.log("checkAuthStatus: User data:", user);
        set({
          auth: {
            user,
            isAuthenticated: true,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => user
          },
          isLoading: false
        });
        console.log("checkAuthStatus: Auth state updated - authenticated");
        return true;
      } else {
        console.log("checkAuthStatus: User is not signed in");
        set({
          auth: {
            user: null,
            isAuthenticated: false,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => null
          },
          isLoading: false
        });
        console.log("checkAuthStatus: Auth state updated - not authenticated");
        return false;
      }
    } catch (err) {
      console.error("checkAuthStatus: Error during auth check:", err);
      const msg = err instanceof Error ? err.message : "Failed to check auth status";
      setError(msg);
      return false;
    }
  };
  const signIn = async () => {
    console.log("signIn: Starting sign in process...");
    const puter = getPuter();
    if (!puter) {
      console.error("signIn: Puter.js not available");
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      console.log("signIn: Calling puter.auth.signIn()...");
      await puter.auth.signIn();
      console.log("signIn: Sign in successful, checking auth status...");
      await checkAuthStatus();
    } catch (err) {
      console.error("signIn: Error during sign in:", err);
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    }
  };
  const signOut = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await puter.auth.signOut();
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null
        },
        isLoading: false
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign out failed";
      setError(msg);
    }
  };
  const refreshUser = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const user = await puter.auth.getUser();
      set({
        auth: {
          user,
          isAuthenticated: true,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => user
        },
        isLoading: false
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to refresh user";
      setError(msg);
    }
  };
  const init = () => {
    console.log("Puter init: Starting initialization...");
    const puter = getPuter();
    if (puter) {
      console.log("Puter init: Puter.js already available");
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }
    console.log("Puter init: Puter.js not available, starting polling...");
    const interval = setInterval(() => {
      if (getPuter()) {
        console.log("Puter init: Puter.js loaded successfully");
        clearInterval(interval);
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      if (!getPuter()) {
        console.error("Puter init: Failed to load Puter.js within 10 seconds");
        setError("Puter.js failed to load within 10 seconds");
      }
    }, 1e4);
  };
  const write = async (path, data) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.write(path, data);
  };
  const readDir = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.readdir(path);
  };
  const readFile = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.read(path);
  };
  const upload2 = async (files) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.upload(files);
  };
  const deleteFile = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.delete(path);
  };
  const chat = async (prompt, imageURL, testMode, options) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.chat(prompt, imageURL, testMode, options);
  };
  const feedback = async (path, message) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.chat(
      [
        {
          role: "user",
          content: [
            {
              type: "file",
              puter_path: path
            },
            {
              type: "text",
              text: message
            }
          ]
        }
      ],
      { model: "claude-3-7-sonnet" }
    );
  };
  const img2txt = async (image, testMode) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.img2txt(image, testMode);
  };
  const getKV = async (key) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.get(key);
  };
  const setKV = async (key, value) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.set(key, value);
  };
  const deleteKV = async (key) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.delete(key);
  };
  const listKV = async (pattern, returnValues) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    if (returnValues === void 0) {
      returnValues = false;
    }
    return puter.kv.list(pattern, returnValues);
  };
  const flushKV = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.flush();
  };
  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user
    },
    fs: {
      write: (path, data) => write(path, data),
      read: (path) => readFile(path),
      readDir: (path) => readDir(path),
      upload: (files) => upload2(files),
      delete: (path) => deleteFile(path)
    },
    ai: {
      chat: (prompt, imageURL, testMode, options) => chat(prompt, imageURL, testMode, options),
      feedback: (path, message) => feedback(path, message),
      img2txt: (image, testMode) => img2txt(image, testMode)
    },
    kv: {
      get: (key) => getKV(key),
      set: (key, value) => setKV(key, value),
      delete: (key) => deleteKV(key),
      list: (pattern, returnValues) => listKV(pattern, returnValues),
      flush: () => flushKV()
    },
    init,
    clearError: () => set({ error: null })
  };
});
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  const {
    init
  } = usePuterStore();
  useEffect(() => {
    init();
  }, [init]);
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    className: "dark",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx("script", {
        src: "https://js.puter.com/v2/"
      }), children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "text-white",
      children: message
    }), /* @__PURE__ */ jsx("p", {
      className: "text-gray-300",
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const Navbar = () => {
  var _a;
  const { auth: auth2, isLoading } = usePuterStore();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs("nav", { className: "navbar", children: [
    /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gradient", children: "RESUMIFY" }) }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: !isLoading && (auth2.isAuthenticated ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-green-400 text-sm font-medium", children: ((_a = auth2.user) == null ? void 0 : _a.username) || "User" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: auth2.signOut,
          className: "px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105",
          children: "Log Out"
        }
      )
    ] }) : /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => navigate("/auth"),
        className: "px-6 py-3 primary-gradient hover:primary-gradient-hover text-white rounded-full transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105",
        children: "Login"
      }
    )) })
  ] });
};
const ScoreCircle = ({ score = 75 }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-[100px] h-[100px]", children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        height: "100%",
        width: "100%",
        viewBox: "0 0 100 100",
        className: "transform -rotate-90",
        children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "50",
              cy: "50",
              r: normalizedRadius,
              stroke: "#4B5563",
              strokeWidth: stroke,
              fill: "transparent"
            }
          ),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "grad", x1: "1", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#6366f1" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#8b5cf6" })
          ] }) }),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "50",
              cy: "50",
              r: normalizedRadius,
              stroke: "url(#grad)",
              strokeWidth: stroke,
              fill: "transparent",
              strokeDasharray: circumference,
              strokeDashoffset,
              strokeLinecap: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-white", children: `${score}/100` }) })
  ] });
};
const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");
  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResume();
  }, [imagePath]);
  return /* @__PURE__ */ jsxs(Link, { to: `/resume/${id}`, className: "resume-card animate-in fade-in duration-1000 hover:scale-105 transition-transform duration-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "resume-card-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        companyName && /* @__PURE__ */ jsx("h2", { className: "!text-white font-bold break-words", children: companyName }),
        jobTitle && /* @__PURE__ */ jsx("h3", { className: "text-lg break-words text-gray-400", children: jobTitle }),
        !companyName && !jobTitle && /* @__PURE__ */ jsx("h2", { className: "!text-white font-bold", children: "Resume" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(ScoreCircle, { score: feedback.overallScore }) })
    ] }),
    resumeUrl && /* @__PURE__ */ jsx("div", { className: "gradient-border animate-in fade-in duration-1000", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full", children: /* @__PURE__ */ jsx("img", { src: resumeUrl, alt: "resume", className: "w-full h-[350px] max-sm:h-[200px] object-cover object-top rounded-lg" }) }) })
  ] });
};
function meta$2({}) {
  return [{
    title: "Resumify"
  }, {
    name: "description",
    content: "AI-powered resume analysis for your career success"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  const {
    auth: auth2,
    isLoading,
    fs,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes2 = await kv.list("resume:*", true);
      const parsedResumes = resumes2 == null ? void 0 : resumes2.map((resume2) => JSON.parse(resume2.value));
      console.log("ParsedResumes", parsedResumes);
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  }, []);
  useEffect(() => {
    if (!auth2.isAuthenticated) navigate("/auth?next=/");
  }, [auth2.isAuthenticated]);
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main-dark.svg')] bg-cover",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("section", {
      className: "main-section",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "page-heading py-16",
        children: [/* @__PURE__ */ jsx("h1", {
          children: "Transform Your Resume with AI Intelligence"
        }), !loadingResumes && (resumes == null ? void 0 : resumes.length) === 0 ? /* @__PURE__ */ jsx("h2", {
          children: "No resumes found. Upload your first resume to get feedback."
        }) : /* @__PURE__ */ jsx("h2", {
          children: "Review your submissions and check AI-Powered feedback."
        }), loadingResumes && /* @__PURE__ */ jsx("div", {
          className: "flex flex-col items-center justify-center",
          children: /* @__PURE__ */ jsx("img", {
            src: "/images/resume-scan-2.gif",
            className: "w-[200px]"
          })
        }), /* @__PURE__ */ jsx("h2", {
          children: "Get instant feedback and optimize your applications for success"
        }), /* @__PURE__ */ jsx(Link, {
          to: "/upload",
          className: "w-fit px-6 py-3 rounded-xl \r\n           bg-gradient-to-r from-indigo-600 to-indigo-700 \r\n           text-white font-semibold shadow-md \r\n           hover:from-indigo-700 hover:to-purple-600 \r\n           hover:scale-105 hover:shadow-xl \r\n           transition-all duration-300 ease-out \r\n           text-sm sm:text-base md:text-lg",
          children: "Upload Resume"
        })]
      }), !loadingResumes && resumes.length > 0 && /* @__PURE__ */ jsx("div", {
        className: "resumes-section my-20",
        children: resumes.map((resume2) => /* @__PURE__ */ jsx(ResumeCard, {
          resume: resume2
        }, resume2.id))
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const meta$1 = () => [{
  title: "Resumify | Auth"
}, {
  name: "description",
  content: "Log into your account"
}];
const Auth = () => {
  const {
    isLoading,
    auth: auth2,
    error
  } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();
  useEffect(() => {
    if (auth2.isAuthenticated) navigate(next);
  }, [auth2.isAuthenticated, next]);
  return /* @__PURE__ */ jsx(Fragment, {
    children: /* @__PURE__ */ jsx("main", {
      className: "bg-[url('/images/bg-main-dark.svg')] bg-cover min-h-screen flex items-center justify-center p-4",
      children: /* @__PURE__ */ jsx("div", {
        className: "gradient-border shadow-2xl",
        children: /* @__PURE__ */ jsxs("section", {
          className: "flex flex-col gap-6 rounded-2xl p-10 max-w-md w-full",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex flex-col items-center gap-6 text-center",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg",
              children: /* @__PURE__ */ jsx("svg", {
                className: "w-8 h-8 text-white",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                })
              })
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-3xl font-bold text-gradient",
                children: "Welcome Back"
              }), /* @__PURE__ */ jsx("h2", {
                className: "text-gray-300 text-base",
                children: "Sign in to continue your resume journey"
              })]
            }), error && /* @__PURE__ */ jsx("div", {
              className: "text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-lg border border-red-800",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2",
                children: [/* @__PURE__ */ jsx("svg", {
                  className: "w-4 h-4",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  })
                }), error]
              })
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "flex justify-center",
            children: isLoading ? /* @__PURE__ */ jsx("button", {
              className: "auth-button",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex items-center justify-center gap-3",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                }), /* @__PURE__ */ jsx("p", {
                  children: "Signing you in..."
                })]
              })
            }) : /* @__PURE__ */ jsx(Fragment, {
              children: auth2.isAuthenticated ? /* @__PURE__ */ jsx("button", {
                className: "auth-button hover:scale-105 transition-transform duration-300",
                onClick: auth2.signOut,
                children: /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center justify-center gap-3",
                  children: [/* @__PURE__ */ jsx("svg", {
                    className: "w-6 h-6",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    })
                  }), /* @__PURE__ */ jsx("p", {
                    children: "Log Out"
                  })]
                })
              }) : /* @__PURE__ */ jsx("button", {
                className: "auth-button hover:scale-105 transition-transform duration-300",
                onClick: auth2.signIn,
                children: /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center justify-center gap-2",
                  children: [/* @__PURE__ */ jsx("svg", {
                    className: "w-6 h-6",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    })
                  }), /* @__PURE__ */ jsx("p", {
                    children: "Sign In with Puter"
                  })]
                })
              })
            })
          }), /* @__PURE__ */ jsx("div", {
            className: "flex justify-center pt-2",
            children: /* @__PURE__ */ jsx("button", {
              onClick: () => navigate("/"),
              className: "px-8 py-3 text-lg font-semibold text-gray-300 hover:text-white border-2 border-gray-600 hover:border-gray-500 rounded-full transition-all duration-300 hover:bg-gray-700/50",
              children: "← Return to Home"
            })
          }), /* @__PURE__ */ jsx("div", {
            className: "text-center text-gray-400 text-xs",
            children: /* @__PURE__ */ jsx("p", {
              children: "Secure authentication powered by Puter"
            })
          })]
        })
      })
    })
  });
};
const auth = UNSAFE_withComponentProps(Auth);
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: auth,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
const generateUUID = () => crypto.randomUUID();
const FileUploader = ({ onFileSelect }) => {
  const onDrop = useCallback((acceptedFiles2) => {
    const file2 = acceptedFiles2[0] || null;
    onFileSelect == null ? void 0 : onFileSelect(file2);
  }, [onFileSelect]);
  const maxFileSize = 20 * 1024 * 1024;
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxFileSize
  });
  const file = acceptedFiles[0] || null;
  return /* @__PURE__ */ jsx("div", { className: "w-full gradient-border", children: /* @__PURE__ */ jsxs("div", { ...getRootProps(), children: [
    /* @__PURE__ */ jsx("input", { ...getInputProps() }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4 cursor-pointer", children: file ? /* @__PURE__ */ jsxs("div", { className: "uploader-selected-file", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("img", { src: "/images/pdf.png", alt: "pdf", className: "size-10" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-3", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 truncate max-w-xs", children: file.name }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: formatSize(file.size) })
      ] }) }),
      /* @__PURE__ */ jsx("button", { className: "p-2 cursor-pointer", onClick: (e) => {
        onFileSelect == null ? void 0 : onFileSelect(null);
      }, children: /* @__PURE__ */ jsx("img", { src: "/icons/cross.svg", alt: "remove", className: "w-4 h-4" }) })
    ] }) : /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto w-16 h-16 flex items-center justify-center mb-2", children: /* @__PURE__ */ jsx("img", { src: "/icons/info.svg", alt: "upload", className: "size-20" }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-500", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Click to upload" }),
        " or drag and drop"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-500", children: [
        "PDF (max ",
        formatSize(maxFileSize),
        ")"
      ] })
    ] }) })
  ] }) });
};
let pdfjsLib = null;
let loadPromise = null;
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    return lib;
  });
  return loadPromise;
}
async function convertPdfToImage(file) {
  try {
    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }
    await page.render({ canvasContext: context, viewport }).promise;
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png"
            });
            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob"
            });
          }
        },
        "image/png",
        1
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`
    };
  }
}
const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;
const prepareInstructions = ({
  jobTitle,
  jobDescription,
  AIResponseFormat: AIResponseFormat2
}) => `You are an expert resume analyst and career coach with deep knowledge of modern hiring practices and ATS (Applicant Tracking System) optimization.

Please provide a comprehensive analysis of this resume, focusing on its effectiveness for the target position. Be thorough and constructive in your feedback.

Key Analysis Areas:
- ATS Compatibility: How well the resume will perform in automated screening systems
- Content Quality: Relevance, impact, and clarity of achievements and experiences
- Structure & Format: Organization, readability, and professional presentation
- Skills Alignment: Match between candidate skills and job requirements
- Tone & Style: Professional voice and appropriate language for the industry

Rating Guidelines:
- 90-100: Exceptional resume that stands out significantly
- 80-89: Strong resume with minor areas for improvement
- 70-79: Good resume with several improvement opportunities
- 60-69: Average resume requiring substantial enhancements
- Below 60: Resume needs significant restructuring and improvement

Target Position: ${jobTitle}
Job Description: ${jobDescription}

Provide detailed, actionable feedback using this format: ${AIResponseFormat2}

Return the analysis as a clean JSON object without any additional text or formatting.`;
const Upload = () => {
  const {
    auth: auth2,
    isLoading,
    fs,
    ai,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState(null);
  const handleFileSelect = (file2) => {
    setFile(file2);
  };
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file: file2
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file2]);
    if (!uploadedFile) return setStatusText("Error: Failed to upload file");
    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file2);
    if (!imageFile.file) return setStatusText("Error: Failed to convert PDF to image");
    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Error: Failed to upload image");
    setStatusText("Preparing data...");
    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: ""
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analyzing...");
    const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({
      jobTitle,
      jobDescription,
      AIResponseFormat
    }));
    if (!feedback) return setStatusText("Error: Failed to analyze resume");
    let feedbackText = typeof feedback.message.content === "string" ? feedback.message.content : feedback.message.content[0].text;
    if (feedbackText.includes("```json")) {
      feedbackText = feedbackText.replace(/```json|```/g, "").trim();
    }
    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis complete, redirecting...");
    console.log(data);
    navigate(`/resume/${uuid}`);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name");
    const jobTitle = formData.get("job-title");
    const jobDescription = formData.get("job-description");
    if (!file) return;
    handleAnalyze({
      companyName,
      jobTitle,
      jobDescription,
      file
    });
  };
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main-dark.svg')] bg-cover",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("section", {
      className: "main-section",
      children: /* @__PURE__ */ jsxs("div", {
        className: "page-heading py-16",
        children: [/* @__PURE__ */ jsx("h1", {
          children: "Smart feedback for your dream job"
        }), isProcessing ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx("h2", {
            children: statusText
          }), /* @__PURE__ */ jsx("img", {
            src: "/images/resume-scan.gif",
            className: "w-full"
          })]
        }) : /* @__PURE__ */ jsx("h2", {
          children: "Drop your resume for an ATS score and improvement tips"
        }), !isProcessing && /* @__PURE__ */ jsxs("form", {
          id: "upload-form",
          onSubmit: handleSubmit,
          className: "flex flex-col gap-4 mt-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "company-name",
              children: "Company Name"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              name: "company-name",
              placeholder: "Company Name",
              id: "company-name"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "job-title",
              children: "Job Title"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              name: "job-title",
              placeholder: "Job Title",
              id: "job-title"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "job-description",
              children: "Job Description"
            }), /* @__PURE__ */ jsx("textarea", {
              rows: 5,
              name: "job-description",
              placeholder: "Job Description",
              id: "job-description"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "uploader",
              children: "Upload Resume"
            }), /* @__PURE__ */ jsx(FileUploader, {
              onFileSelect: handleFileSelect
            })]
          }), /* @__PURE__ */ jsx("button", {
            className: "primary-button",
            type: "submit",
            children: "Analyze Resume"
          })]
        })]
      })
    })]
  });
};
const upload = UNSAFE_withComponentProps(Upload);
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: upload
}, Symbol.toStringTag, { value: "Module" }));
const ATS = ({ score, suggestions }) => {
  const iconSrc = score > 69 ? "/icons/ats-good.svg" : score > 49 ? "/icons/ats-warning.svg" : "/icons/ats-bad.svg";
  const subtitle = score > 69 ? "Great Job!" : score > 49 ? "Good Start" : "Needs Improvement";
  return /* @__PURE__ */ jsxs("div", { className: "bg-blue-500/10 backdrop-blur-xl\r\n      border border-blue-400/20 \r\n      rounded-2xl shadow-lg w-full p-6\r\n      text-gray-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsx("img", { src: iconSrc, alt: "ATS Score Icon", className: "w-12 h-12" }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold", children: [
        "ATS Score - ",
        score,
        "/100"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: subtitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-200/80 mb-4", children: "This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers." }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: suggestions.map((suggestion, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
            alt: suggestion.type === "good" ? "Check" : "Warning",
            className: "w-5 h-5 mt-1 opacity-90"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: suggestion.type === "good" ? "text-gray-100" : "text-red-300", children: suggestion.tip })
      ] }, index)) })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-200/70 italic", children: "Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters." })
  ] });
};
const AccordionContext = createContext(
  void 0
);
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};
const Accordion = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = ""
}) => {
  const [activeItems, setActiveItems] = useState(
    defaultOpen ? [defaultOpen] : []
  );
  const toggleItem = (id) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };
  const isItemActive = (id) => activeItems.includes(id);
  return /* @__PURE__ */ jsx(
    AccordionContext.Provider,
    {
      value: { activeItems, toggleItem, isItemActive },
      children: /* @__PURE__ */ jsx("div", { className: `space-y-2 ${className}`, children })
    }
  );
};
const AccordionItem = ({
  id,
  children,
  className = ""
}) => {
  return /* @__PURE__ */ jsx("div", { className: `overflow-hidden border-b border-gray-200 ${className}`, children });
};
const AccordionHeader = ({
  itemId,
  children,
  className = "",
  icon,
  iconPosition = "right"
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  const defaultIcon = /* @__PURE__ */ jsx(
    "svg",
    {
      className: cn("w-5 h-5 transition-transform duration-200", {
        "rotate-180": isActive
      }),
      fill: "none",
      stroke: "#98A2B3",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M19 9l-7 7-7-7"
        }
      )
    }
  );
  const handleClick = () => {
    toggleItem(itemId);
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: handleClick,
      className: `
        w-full px-4 py-3 text-left
        focus:outline-none
        transition-colors duration-200 flex items-center justify-between cursor-pointer
        ${className}
      `,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          iconPosition === "left" && (icon || defaultIcon),
          /* @__PURE__ */ jsx("div", { className: "flex-1", children })
        ] }),
        iconPosition === "right" && (icon || defaultIcon)
      ]
    }
  );
};
const AccordionContent = ({
  itemId,
  children,
  className = ""
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `
        overflow-hidden transition-all duration-300 ease-in-out
        ${isActive ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}
        ${className}
      `,
      children: /* @__PURE__ */ jsx("div", { className: "px-4 py-3 ", children })
    }
  );
};
const ScoreBadge$1 = ({ score }) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px] border backdrop-blur-md",
        score > 69 ? "bg-blue-100/70 border-blue-200 text-blue-800" : score > 39 ? "bg-indigo-100/70 border-indigo-200 text-indigo-800" : "bg-slate-200/70 border-slate-300 text-slate-800"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: score > 69 ? "/icons/check.svg" : "/icons/warning.svg",
            alt: "score",
            className: "size-4"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
          score,
          "/100"
        ] })
      ]
    }
  );
};
const CategoryHeader = ({
  title,
  categoryScore
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-4 items-center py-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: title }),
    /* @__PURE__ */ jsx(ScoreBadge$1, { score: categoryScore })
  ] });
};
const CategoryContent = ({
  tips
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-gray-900/80 w-full rounded-xl p-1 grid grid-cols-2 gap-3 border border-gray-800", children: tips.map((tip, index) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `flex flex-col gap-2 rounded-xl p-3 
              ${tip.type === "good" ? "bg-emerald-600/30 border border-emerald-400" : "bg-red-400/30 border border-red-300"}
              transition-all hover:bg-opacity-70 hover:shadow-lg`,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
              alt: "score",
              className: "size-4 filter brightness-0 invert opacity-90"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: tip.tip })
        ] })
      },
      index + tip.tip
    )) }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3 w-full bg-gray-900/50 p-4 rounded-xl border border-gray-800", children: tips.map((tip, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex flex-col gap-3 rounded-xl p-4 border transition-all hover:shadow-lg
              ${tip.type === "good" ? "bg-emerald-700/40 border-emerald-500 hover:bg-emerald-700/60" : "bg-red-400/40 border-red-300 hover:bg-red-400/60"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: `p-2 rounded-lg ${tip.type === "good" ? "bg-emerald-600" : "bg-red-400"}`, children: /* @__PURE__ */ jsx(
              "img",
              {
                src: tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
                alt: "score",
                className: "size-5 filter brightness-0 invert"
              }
            ) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900", children: tip.tip })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-base  leading-relaxed pl-[52px]", children: tip.explanation })
        ]
      },
      index + tip.tip
    )) })
  ] });
};
const Details = ({ feedback }) => {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 w-full", children: /* @__PURE__ */ jsxs(Accordion, { children: [
    /* @__PURE__ */ jsxs(AccordionItem, { id: "tone-style", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "tone-style", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Tone & Style",
          categoryScore: feedback.toneAndStyle.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "tone-style", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.toneAndStyle.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "content", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "content", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Content",
          categoryScore: feedback.content.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "content", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.content.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "structure", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "structure", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Structure",
          categoryScore: feedback.structure.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "structure", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.structure.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "skills", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "skills", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Skills",
          categoryScore: feedback.skills.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "skills", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.skills.tips }) })
    ] })
  ] }) });
};
const ScoreGauge = ({ score = 75 }) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef(null);
  const percentage = score / 100;
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-40 h-20", children: [
    /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 50", className: "w-full h-full", children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs(
        "linearGradient",
        {
          id: "gaugeGradient",
          x1: "0%",
          y1: "0%",
          x2: "100%",
          y2: "0%",
          children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#a78bfa" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#fca5a5" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M10,50 A40,40 0 0,1 90,50",
          fill: "none",
          stroke: "#e5e7eb",
          strokeWidth: "10",
          strokeLinecap: "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          ref: pathRef,
          d: "M10,50 A40,40 0 0,1 90,50",
          fill: "none",
          stroke: "url(#gaugeGradient)",
          strokeWidth: "10",
          strokeLinecap: "round",
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength * (1 - percentage)
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center pt-2", children: /* @__PURE__ */ jsxs("div", { className: "text-xl font-semibold pt-4", children: [
      score,
      "/100"
    ] }) })
  ] }) });
};
const ScoreBadge = ({ score }) => {
  let badgeColor = "";
  let badgeText = "";
  if (score > 70) {
    badgeColor = "bg-badge-green text-green-600";
    badgeText = "Strong";
  } else if (score > 49) {
    badgeColor = "bg-badge-yellow text-yellow-600";
    badgeText = "Good Start";
  } else {
    badgeColor = "bg-badge-red text-red-600";
    badgeText = "Needs Work";
  }
  return /* @__PURE__ */ jsx("div", { className: `px-3 py-1 rounded-full ${badgeColor}`, children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: badgeText }) });
};
const Category = ({ title, score }) => {
  const textColor = score > 70 ? "text-blue-400" : score > 49 ? "text-indigo-400" : "text-rose-400";
  const bgColor = score > 70 ? "bg-blue-500/10" : score > 49 ? "bg-indigo-500/10" : "bg-rose-500/10";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex items-center justify-between px-5 py-4 rounded-xl ${bgColor} transition-all hover:scale-[1.02] hover:shadow-md`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-2 items-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-gray-100", children: title }),
          /* @__PURE__ */ jsx(ScoreBadge, { score })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold", children: [
          /* @__PURE__ */ jsx("span", { className: textColor, children: score }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "/100" })
        ] })
      ]
    }
  );
};
const Summary = ({ feedback }) => {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl w-full overflow-hidden \r\n                    bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 \r\n                    shadow-2xl border border-gray-700", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center p-6 gap-6 border-b border-gray-700", children: [
      /* @__PURE__ */ jsx(ScoreGauge, { score: feedback.overallScore }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-extrabold text-white tracking-tight", children: "Your Resume Score" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-2", children: "This score is calculated based on the categories below." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsx(Category, { title: "Tone & Style", score: feedback.toneAndStyle.score }),
      /* @__PURE__ */ jsx(Category, { title: "Content", score: feedback.content.score }),
      /* @__PURE__ */ jsx(Category, { title: "Structure", score: feedback.structure.score }),
      /* @__PURE__ */ jsx(Category, { title: "Skills", score: feedback.skills.score })
    ] })
  ] });
};
const meta = () => [{
  title: "Resumify | Review"
}, {
  name: "description",
  content: "Resume review and feedback"
}];
const Resume = () => {
  const {
    auth: auth2,
    isLoading,
    fs,
    kv
  } = usePuterStore();
  const {
    id
  } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !auth2.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);
  useEffect(() => {
    const loadResume = async () => {
      const resume2 = await kv.get(`resume:${id}`);
      if (!resume2) return;
      const data = JSON.parse(resume2);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;
      const pdfBlob = new Blob([resumeBlob], {
        type: "application/pdf"
      });
      const resumeUrl2 = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl2);
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl2 = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl2);
      setFeedback(data.feedback);
      console.log({
        resumeUrl: resumeUrl2,
        imageUrl: imageUrl2,
        feedback: data.feedback
      });
    };
    loadResume();
  }, [id]);
  return /* @__PURE__ */ jsxs("main", {
    className: "!pt-0",
    children: [/* @__PURE__ */ jsx("nav", {
      className: "resume-nav",
      children: /* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "back-button",
        children: [/* @__PURE__ */ jsx("img", {
          src: "/icons/back.svg",
          alt: "logo",
          className: "w2.5 h2.5 invert brightness-0 "
        }), /* @__PURE__ */ jsx("span", {
          className: "text-white text-sm font-semibold",
          children: " Back to Homepage"
        })]
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-row w-full max-lg:flex-col-reverse",
      children: [/* @__PURE__ */ jsx("section", {
        className: "feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center]",
        children: imageUrl && resumeUrl && /* @__PURE__ */ jsx("div", {
          className: "animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit",
          children: /* @__PURE__ */ jsx("a", {
            href: resumeUrl,
            target: "_blank",
            children: /* @__PURE__ */ jsx("img", {
              src: imageUrl,
              className: "w-full h-full object-contain rounded-2xl",
              title: "resume"
            })
          })
        })
      }), /* @__PURE__ */ jsxs("section", {
        className: "feedback-section",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-4xl !text-white font-bold",
          children: "Resume Analysis"
        }), feedback ? /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-8 animate-in fade-in duration-1000 text-white",
          children: [/* @__PURE__ */ jsx(Summary, {
            feedback
          }), /* @__PURE__ */ jsx(ATS, {
            score: feedback.ATS.score || 0,
            suggestions: feedback.ATS.tips || []
          }), /* @__PURE__ */ jsx(Details, {
            feedback
          })]
        }) : /* @__PURE__ */ jsx("img", {
          src: "/images/resume-scan-2.gif",
          className: "w-full",
          alt: "img loading"
        })]
      })]
    })]
  });
};
const resume = UNSAFE_withComponentProps(Resume);
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: resume,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const WipeApp = () => {
  var _a;
  const {
    auth: auth2,
    isLoading,
    error,
    clearError,
    fs,
    ai,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const loadFiles = async () => {
    const files2 = await fs.readDir("./");
    setFiles(files2);
  };
  useEffect(() => {
    loadFiles();
  }, []);
  useEffect(() => {
    if (!isLoading && !auth2.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);
  const handleDelete = async () => {
    files.forEach(async (file) => {
      await fs.delete(file.path);
    });
    await kv.flush();
    loadFiles();
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", {
      children: "Loading..."
    });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", {
      children: ["Error ", error]
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    children: ["Authenticated as: ", (_a = auth2.user) == null ? void 0 : _a.username, /* @__PURE__ */ jsx("div", {
      children: "Existing files:"
    }), /* @__PURE__ */ jsx("div", {
      className: "flex flex-col gap-4",
      children: files.map((file) => /* @__PURE__ */ jsx("div", {
        className: "flex flex-row gap-4",
        children: /* @__PURE__ */ jsx("p", {
          className: "!text-white",
          children: file.name
        })
      }, file.id))
    }), /* @__PURE__ */ jsx("div", {
      children: /* @__PURE__ */ jsx("button", {
        className: "bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer",
        onClick: () => handleDelete(),
        children: "Wipe App Data"
      })
    })]
  });
};
const wipe = UNSAFE_withComponentProps(WipeApp);
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: wipe
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DQFzWzMJ.js", "imports": ["/assets/chunk-QMGIS6GS-DX0VMMAr.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-D3ci4F_4.js", "imports": ["/assets/chunk-QMGIS6GS-DX0VMMAr.js", "/assets/puter-D5fpqPPq.js"], "css": ["/assets/root-DJVWB3_r.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-CuLauwPQ.js", "imports": ["/assets/chunk-QMGIS6GS-DX0VMMAr.js", "/assets/Navbar-ieTI-AXj.js", "/assets/puter-D5fpqPPq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth": { "id": "routes/auth", "parentId": "root", "path": "/auth", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth-BOu81Hqc.js", "imports": ["/assets/chunk-QMGIS6GS-DX0VMMAr.js", "/assets/puter-D5fpqPPq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/upload": { "id": "routes/upload", "parentId": "root", "path": "/upload", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/upload-GeXIeYyN.js", "imports": ["/assets/chunk-QMGIS6GS-DX0VMMAr.js", "/assets/Navbar-ieTI-AXj.js", "/assets/utils-CLdLQqWL.js", "/assets/puter-D5fpqPPq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/resume": { "id": "routes/resume", "parentId": "root", "path": "/resume/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/resume-Bq1_SMNg.js", "imports": ["/assets/chunk-QMGIS6GS-DX0VMMAr.js", "/assets/puter-D5fpqPPq.js", "/assets/utils-CLdLQqWL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/wipe": { "id": "routes/wipe", "parentId": "root", "path": "/wipe", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/wipe-CLvp3xym.js", "imports": ["/assets/chunk-QMGIS6GS-DX0VMMAr.js", "/assets/puter-D5fpqPPq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-cfbfae8f.js", "version": "cfbfae8f", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/auth": {
    id: "routes/auth",
    parentId: "root",
    path: "/auth",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/upload": {
    id: "routes/upload",
    parentId: "root",
    path: "/upload",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/resume": {
    id: "routes/resume",
    parentId: "root",
    path: "/resume/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/wipe": {
    id: "routes/wipe",
    parentId: "root",
    path: "/wipe",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
