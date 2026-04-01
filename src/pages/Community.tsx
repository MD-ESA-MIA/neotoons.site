import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, MessageCircle, Github, Slack } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Community: React.FC = () => {
  const communityChannels = [
    {
      name: 'Discord Server',
      description: 'Join our active Discord community to chat with creators and get real-time support.',
      icon: Slack,
      link: '#',
      members: '2.5K+'
    },
    {
      name: 'GitHub Discussions',
      description: 'Discuss features, share ideas, and contribute to the project on GitHub.',
      icon: Github,
      link: '#',
      members: '1.2K+'
    },
    {
      name: 'Community Forum',
      description: 'Ask questions, share projects, and connect with other NeoToons users.',
      icon: MessageCircle,
      link: '#',
      members: '5K+'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Link to="/" className="text-primary hover:text-primary/80 flex items-center gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
              Community
            </h1>
            <p className="text-text-secondary text-lg">
              Join thousands of creators making amazing things with NeoToons
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <p className="text-text-secondary">Active Members</p>
            </div>
            <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <p className="text-text-secondary">Projects Created</p>
            </div>
            <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-text-secondary">Community Support</p>
            </div>
          </div>

          {/* Community Channels */}
          <h2 className="text-2xl font-bold text-text-primary mb-8">Join the Conversation</h2>
          <div className="space-y-6 mb-12">
            {communityChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.name}
                  href={channel.link}
                  className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors block group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {channel.name}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {channel.members} Members
                    </span>
                  </div>
                  <p className="text-text-secondary">{channel.description}</p>
                </a>
              );
            })}
          </div>

          {/* Guidelines */}
          <div className="p-8 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Community Guidelines
            </h3>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                Be respectful and inclusive to all community members
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                Share knowledge and help others grow
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                No spam or self-promotion without context
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                Report inappropriate behavior to moderators
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
