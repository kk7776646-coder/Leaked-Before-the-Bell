import React from 'react';
import {
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Code2,
  Cpu,
  Cog,
  Stethoscope,
  Users,
  Landmark,
  ScrollText,
  Globe2,
  Map,
  TrendingUp,
  BriefcaseBusiness,
  Brain,
  Scale,
  BookOpen,
  BookOpenText,
  Leaf,
  LucideIcon
} from 'lucide-react';

interface SubjectIconProps {
  subject?: string;
  size?: number;
  className?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ subject = '', size = 16, className = '' }) => {
  const normalize = (name: string): string => {
    if (!name) return 'other';
    const lower = name.toLowerCase().trim();
    if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra')) return 'math';
    if (lower.includes('chem')) return 'chem';
    if (lower.includes('bio')) return 'bio';
    if (lower.includes('phys')) return 'physics';
    if (lower.includes('computer') || lower.includes('cse') || lower.includes('coding') || lower.includes('cs')) return 'cs';
    if (lower.includes('engineer')) return 'engineering';
    if (lower.includes('medic') || lower.includes('health')) return 'medicine';
    if (lower.includes('social') || lower.includes('sociology')) return 'social';
    if (lower.includes('history')) return 'history';
    if (lower.includes('geograph')) return 'geography';
    if (lower.includes('econ')) return 'economics';
    if (lower.includes('psychol')) return 'psychology';
    if (lower.includes('law') || lower.includes('legal')) return 'law';
    if (lower.includes('business') || lower.includes('management')) return 'business';
    if (lower.includes('account') || lower.includes('finance')) return 'accounting';
    if (lower.includes('stat')) return 'statistics';
    if (lower.includes('environment') || lower.includes('evs')) return 'environment';
    if (lower.includes('english') || lower.includes('language')) return 'english';
    if (lower.includes('lit')) return 'literature';
    return 'other';
  };

  const key = normalize(subject);

  const iconMap: Record<string, LucideIcon> = {
    math: Calculator,
    chem: FlaskConical,
    bio: Dna,
    physics: Atom,
    cs: Code2,
    engineering: Cog,
    medicine: Stethoscope,
    social: Users,
    history: Landmark,
    geography: Globe2,
    economics: TrendingUp,
    psychology: Brain,
    law: Scale,
    business: BriefcaseBusiness,
    accounting: Calculator,
    statistics: Calculator,
    environment: Leaf,
    english: BookOpen,
    literature: BookOpenText,
    other: BookOpen,
  };

  const IconComponent = iconMap[key] || BookOpen;

  return <IconComponent size={size} className={className} aria-hidden="true" />;
};
