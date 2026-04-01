import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botcheck, setBotcheck] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Message is required');
      return false;
    }
    if (formData.message.length < 10) {
      setError('Message must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    // Honeypot: bots often fill hidden fields; real users never touch this.
    if (botcheck.trim()) {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setBotcheck('');
      return;
    }

    if (!web3FormsAccessKey) {
      const envError = 'Contact form is not configured yet. Missing VITE_WEB3FORMS_ACCESS_KEY.';
      setError(envError);
      toast.error(envError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: web3FormsAccessKey,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          botcheck,
          from_name: 'NeoToons Website Contact Form',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
      toast.success('Message sent successfully!');

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setBotcheck('');

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-white/60 text-lg">
            Have a question or feedback? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>

        {/* Success Message */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-emerald-400 font-medium">Message sent successfully!</p>
              <p className="text-emerald-300/70 text-sm">
                We'll get back to you as soon as possible.
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-indigo-500 focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-indigo-500 focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-white mb-2">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="How can we help?"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-indigo-500 focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message here... (minimum 10 characters)"
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
              disabled={loading}
            />
          </div>

          {/* Honeypot anti-spam field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="botcheck">Leave this field empty</label>
            <input
              id="botcheck"
              name="botcheck"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={botcheck}
              onChange={(e) => setBotcheck(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </>
            )}
          </motion.button>

          <p className="text-center text-white/50 text-xs">
            We typically respond within 24-48 hours. All information is kept confidential.
          </p>
        </motion.form>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            ← Back
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
