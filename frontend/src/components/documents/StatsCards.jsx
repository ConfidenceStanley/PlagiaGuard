// src/components/documents/StatsCards.jsx
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from "lucide-react";

const StatsCards = ({ stats }) => {
  const cards = [
    {
      label: "Total Documents",
      value: stats?.totalDocuments || 0,
      icon: FileText,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Checked",
      value: stats?.checkedCount || 0,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "High Risk",
      value: stats?.highRiskCount || 0,
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-600",
      bg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      label: "Storage Used",
      value: stats?.totalSizeFormatted || "0 KB",
      icon: HardDrive,
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsCards;