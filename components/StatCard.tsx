
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, textColor }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={24} className={textColor} />
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-serif font-bold text-[#2D3748] leading-tight">{value}</span>
        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{label}</span>
      </div>
    </div>
  );
};

export default StatCard;
