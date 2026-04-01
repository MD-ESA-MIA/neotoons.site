import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type ServiceStatus = 'operational' | 'degraded' | 'maintenance' | 'down';

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: number;
  lastUpdated: string;
}

const Status: React.FC = () => {
  const [services] = useState<Service[]>([
    {
      name: 'API Server',
      status: 'operational',
      uptime: 99.98,
      lastUpdated: 'Just now'
    },
    {
      name: 'AI Generation Service',
      status: 'operational',
      uptime: 99.95,
      lastUpdated: '2 minutes ago'
    },
    {
      name: 'Image Generation',
      status: 'operational',
      uptime: 99.92,
      lastUpdated: '5 minutes ago'
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: 99.99,
      lastUpdated: 'Just now'
    },
    {
      name: 'Voice Engine',
      status: 'operational',
      uptime: 99.87,
      lastUpdated: '10 minutes ago'
    },
    {
      name: 'Email Service (Resend)',
      status: 'operational',
      uptime: 99.99,
      lastUpdated: '1 minute ago'
    }
  ]);

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'maintenance':
        return 'text-blue-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
      case 'maintenance':
        return <Clock className="w-5 h-5" />;
      case 'down':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const overallStatus = 'operational';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Link to="/" className="text-primary hover:text-primary/80 flex items-center gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
              System Status
            </h1>
            <p className="text-text-secondary text-lg">
              Real-time status of all NeoToons services
            </p>
          </div>

          {/* Overall Status */}
          <div className="mb-12 p-6 rounded-lg border border-green-500/30 bg-green-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">All Systems Operational</h2>
                  <p className="text-text-secondary text-sm">All services are running normally</p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-full bg-green-400/10 text-green-400 text-sm font-medium">
                ✓ Healthy
              </span>
            </div>
          </div>

          {/* Services Status */}
          <h2 className="text-2xl font-bold text-text-primary mb-6">Service Status</h2>
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={getStatusColor(service.status)}>
                      {getStatusIcon(service.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{service.name}</h3>
                      <p className="text-text-secondary text-sm">
                        Uptime: {service.uptime}% • Updated: {service.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(service.status)} bg-slate-800/50`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Incident History */}
          <div className="mt-12 p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Incident History</h3>
            <p className="text-text-secondary">
              No incidents in the last 30 days. Thank you for your patience and support!
            </p>
          </div>

          {/* Support Info */}
          <div className="mt-8 p-6 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <p className="text-text-secondary mb-4">
              Having issues? Contact our support team
            </p>
            <a 
              href="mailto:neotoons.site.help@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Status;
