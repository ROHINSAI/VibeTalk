import { useContext, useState } from "react";
import assets from "../assets/assets.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

function LoginPage() {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    
    setIsLoading(true);
    try {
        await login(currState === "Sign Up" ? "signup" : "login", {
          fullName,
          email,
          password,
          bio,
        });
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden">
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
             animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px]"
          />
          <motion.div 
             animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
             transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
             className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
          />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8">
            <div className="flex flex-col items-center mb-8">
                <motion.img 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    src={assets.logo_big} 
                    alt="Logo" 
                    className="w-40 mb-2 drop-shadow-lg" 
                />
                <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white tracking-wide"
                >
                    {currState}
                </motion.h2>
                <motion.p 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.4 }}
                     className="text-gray-400 text-sm mt-1"
                >
                    {currState === "Sign Up" ? "Create your account to get started" : "Welcome back! Please enter your details"}
                </motion.p>
            </div>

            <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
                <AnimatePresence mode="popLayout">
                    {currState === "Sign Up" && !isDataSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: "auto" }}
                            exit={{ opacity: 0, x: -20, height: 0 }}
                            className="relative"
                        >
                             <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                             <input
                                onChange={(e) => setFullName(e.target.value)}
                                value={fullName}
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all"
                                placeholder="Full Name"
                                required
                            />
                        </motion.div>
                    )}

                    {!isDataSubmitted && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="relative"
                            >
                                <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all"
                                />
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="relative"
                            >
                                <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    type="password"
                                    placeholder="Password"
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all"
                                />
                            </motion.div>
                        </>
                    )}

                    {currState === "Sign Up" && isDataSubmitted && (
                        <motion.div
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="space-y-4"
                        >
                            <div className="flex items-center gap-2 mb-2 text-gray-300 cursor-pointer hover:text-white transition-colors" onClick={() => setIsDataSubmitted(false)}>
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Back to details</span>
                            </div>
                            <textarea
                                onChange={(e) => setBio(e.target.value)}
                                value={bio}
                                rows={4}
                                placeholder="Tell us a bit about yourself..."
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all resize-none"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-violet-900/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {currState === "Sign Up" ? (isDataSubmitted ? "Create Account" : "Continue") : "Log In"}
                            {!isDataSubmitted && currState === "Sign Up" && <ArrowRight className="w-4 h-4" />}
                        </>
                    )}
                </motion.button>
            </form>

            <div className="mt-6 text-center">
                 {currState === "Sign Up" ? (
                    <p className="text-gray-400 text-sm">
                        Already have an account?{" "}
                        <button
                            onClick={() => {
                                setCurrState("Login");
                                setIsDataSubmitted(false);
                            }}
                            className="text-white font-medium hover:text-violet-300 transition-colors ml-1"
                        >
                            Log In
                        </button>
                    </p>
                ) : (
                    <p className="text-gray-400 text-sm">
                        Don't have an account?{" "}
                        <button
                            onClick={() => setCurrState("Sign Up")}
                            className="text-white font-medium hover:text-violet-300 transition-colors ml-1"
                        >
                            Sign Up
                        </button>
                    </p>
                )}
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
