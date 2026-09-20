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
  code?: string;
  size?: number;
  className?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ subject = '', code = '', size = 16, className = '' }) => {
  const normalize = (name: string, codeStr: string): string => {
    const combined = `${name} ${codeStr}`.toLowerCase().trim();
    if (!combined) return 'other';
    if (combined.includes('math') || combined.includes('calculus') || combined.includes('algebra')) return 'math';
    if (combined.includes('chem')) return 'chem';
    if (combined.includes('bio')) return 'bio';
    if (combined.includes('phys')) return 'physics';
    if (combined.includes('computer') || combined.includes('cse') || combined.includes('coding') || combined.includes('cs')) return 'cs';
    if (combined.includes('engineer')) return 'engineering';
    if (combined.includes('medic') || combined.includes('health')) return 'medicine';
    if (combined.includes('social') || combined.includes('sociology')) return 'social';
    if (combined.includes('history')) return 'history';
    if (combined.includes('geograph')) return 'geography';
    if (combined.includes('econ')) return 'economics';
    if (combined.includes('psychol')) return 'psychology';
    if (combined.includes('law') || combined.includes('legal')) return 'law';
    if (combined.includes('business') || combined.includes('management')) return 'business';
    if (combined.includes('account') || combined.includes('finance')) return 'accounting';
    if (combined.includes('stat')) return 'statistics';
    if (combined.includes('environment') || combined.includes('evs')) return 'environment';
    if (combined.includes('english') || combined.includes('language')) return 'english';
    if (combined.includes('lit')) return 'literature';
    return 'other';
  };

  const key = normalize(subject, code);

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
