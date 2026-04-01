import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles, Wand2, LayoutDashboard, Library } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

const steps: Step[] = [
  {
    title: "Welcome to NeoToons",
    description: "Your all-in-one AI creative studio. Let's walk through the essentials to get you creating in minutes.",
    icon: <Sparkles className="w-8 h-8 text-accent" />
  },
  {
    title: "Explore Your Creative Tools",
    description: "Access writing, social media, and video tools here. Collapse categories to keep your workspace clean and focused.",
    icon: <LayoutDashboard className="w-8 h-8 text-rose-500" />,
    target: "sidebar"
  },
  {
    title: "Pick the Right Tool for Your Task",
    description: "Each tool solves a specific problem. Start with 'Story Generator' or 'Viral Hooks' – your choice!",
    icon: <Wand2 className="w-8 h-8 text-cyan" />,
    target: "tools"
  },
  {
    title: "Your Creative Library",
    description: "Every creation is saved here. Edit, download, share, or use as inspiration for your next masterpiece.",
    icon: <Library className="w-8 h-8 text-emerald-500" />,
    target: "library"
  }
];

const OnboardingTour: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_seen_${currentUser?.id}`);
    if (!hasSeenTour && currentUser) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, [currentUser]);

  const handleClose = () => {
    setIsVisible(false);
    if (currentUser) {
      localStorage.setItem(`tour_seen_${currentUser.id}`, 'true');
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 text-text-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center shadow-xl border border-border">
                {steps[currentStep].icon}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">{steps[currentStep].title}</h2>
                <p className="text-text-muted leading-relaxed">{steps[currentStep].description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-8 bg-accent' : 'w-2 bg-white/10'}`}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="p-3 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="btn-primary py-3 px-8 flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? "Let's Create!" : "Continue"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
