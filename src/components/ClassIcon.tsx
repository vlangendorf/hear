import React from 'react';
import {
  Crosshair,
  Swords,
  Music,
  Sparkles,
  ShieldPlus,
  Shield,
  ShieldCheck,
  Flame,
  BookOpen,
  Zap,
  FlaskConical,
  Hammer,
  Target,
  Ghost,
  User,
} from 'lucide-react';

interface ClassIconProps {
  className?: string;
  name?: string;
  size?: number;
}

export const ClassIcon: React.FC<ClassIconProps> = ({ className = 'w-4 h-4', name = '', size = 16 }) => {
  const normalized = name.toLowerCase();

  if (normalized.includes('atirador') || normalized.includes('sniper') || normalized.includes('arqueiro')) {
    return <Crosshair size={size} className={className} />;
  }
  if (normalized.includes('algoz') || normalized.includes('assassino') || normalized.includes('sinx')) {
    return <Swords size={size} className={className} />;
  }
  if (normalized.includes('menestrel') || normalized.includes('trovador') || normalized.includes('bardo')) {
    return <Music size={size} className={className} />;
  }
  if (normalized.includes('cigana') || normalized.includes('dançarina')) {
    return <Sparkles size={size} className={className} />;
  }
  if (normalized.includes('sacerdote') || normalized.includes('priest') || normalized.includes('bispo')) {
    return <ShieldPlus size={size} className={className} />;
  }
  if (normalized.includes('lorde') || normalized.includes('cavaleiro') || normalized.includes('knight')) {
    return <Shield size={size} className={className} />;
  }
  if (normalized.includes('paladino') || normalized.includes('templário')) {
    return <ShieldCheck size={size} className={className} />;
  }
  if (normalized.includes('mago') || normalized.includes('arquimago') || normalized.includes('bruxo')) {
    return <Flame size={size} className={className} />;
  }
  if (normalized.includes('professor') || normalized.includes('sábio') || normalized.includes('sage')) {
    return <BookOpen size={size} className={className} />;
  }
  if (normalized.includes('monge') || normalized.includes('mestre') || normalized.includes('champ')) {
    return <Zap size={size} className={className} />;
  }
  if (normalized.includes('criador') || normalized.includes('alquimista') || normalized.includes('creator')) {
    return <FlaskConical size={size} className={className} />;
  }
  if (normalized.includes('ferreiro') || normalized.includes('whitesmith') || normalized.includes('blacksmith')) {
    return <Hammer size={size} className={className} />;
  }
  if (normalized.includes('desordeiro') || normalized.includes('stalker') || normalized.includes('gatuno')) {
    return <Target size={size} className={className} />;
  }
  if (normalized.includes('espiritualista') || normalized.includes('soul')) {
    return <Ghost size={size} className={className} />;
  }

  return <User size={size} className={className} />;
};
