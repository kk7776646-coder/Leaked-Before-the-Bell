import React from 'react';
import { Send, Camera, MessageCircle, MessageSquare, AtSign, MessageSquareText, Globe2, Share2, LucideIcon } from 'lucide-react';

interface SocialPlatformIconProps {
  platform?: string;
  size?: number;
  className?: string;
}

export const SocialPlatformIcon: React.FC<SocialPlatformIconProps> = ({ platform = '', size = 16, className = '' }) => {
  const norm = (platform || '').toLowerCase().trim();

  if (norm.includes('telegram')) {
    return <Send size={size} className={`text-sky-500 ${className}`} aria-label="Telegram" />;
  }
  if (norm.includes('instagram')) {
    return <Camera size={size} className={`text-pink-500 ${className}`} aria-label="Instagram" />;
  }
  if (norm.includes('whatsapp')) {
    return <MessageCircle size={size} className={`text-emerald-500 ${className}`} aria-label="WhatsApp" />;
  }
  if (norm.includes('facebook')) {
    return <MessageSquare size={size} className={`text-blue-600 ${className}`} aria-label="Facebook" />;
  }
  if (norm.includes('x') || norm.includes('twitter')) {
    return <AtSign size={size} className={`text-slate-800 dark:text-slate-200 ${className}`} aria-label="X / Twitter" />;
  }
  if (norm.includes('reddit')) {
    return <MessageSquareText size={size} className={`text-orange-600 ${className}`} aria-label="Reddit" />;
  }

  return <Globe2 size={size} className={`text-slate-400 ${className}`} aria-label="Other Platform" />;
};
