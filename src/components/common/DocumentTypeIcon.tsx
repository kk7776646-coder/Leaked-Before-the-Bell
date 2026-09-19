import React from 'react';
import { FileText, Image, Images, FileQuestion, BadgeCheck, Archive, FileCog, LucideIcon } from 'lucide-react';

interface DocumentTypeIconProps {
  type?: string;
  size?: number;
  className?: string;
}

export const DocumentTypeIcon: React.FC<DocumentTypeIconProps> = ({ type = 'pdf', size = 16, className = '' }) => {
  const norm = (type || '').toLowerCase().trim();

  if (norm.includes('image') || norm.includes('png') || norm.includes('jpg')) {
    return <Image size={size} className={className} aria-label="Image Document" />;
  }
  if (norm.includes('images') || norm.includes('multi')) {
    return <Images size={size} className={className} aria-label="Multiple Images" />;
  }
  if (norm.includes('question') || norm.includes('qp')) {
    return <FileQuestion size={size} className={className} aria-label="Question Paper" />;
  }
  if (norm.includes('real') || norm.includes('verified')) {
    return <BadgeCheck size={size} className={className} aria-label="Verified Real Paper" />;
  }
  if (norm.includes('historical') || norm.includes('archive')) {
    return <Archive size={size} className={className} aria-label="Historical Document" />;
  }
  if (norm.includes('process') || norm.includes('ocr')) {
    return <FileCog size={size} className={className} aria-label="Processing Document" />;
  }

  return <FileText size={size} className={className} aria-label="Document PDF" />;
};
