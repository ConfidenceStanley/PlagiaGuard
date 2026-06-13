// src/components/common/EmptyState.jsx
import { motion } from "framer-motion";

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="p-4 bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl mb-4">
          <Icon className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-600 max-w-md mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  );
};

export default EmptyState;