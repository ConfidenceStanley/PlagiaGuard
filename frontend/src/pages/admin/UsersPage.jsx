import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Shield,
  GraduationCap,
  BookOpen,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

// ─── Role Badge ────────────────────────────────────────────────
function RoleBadge({ role }) {
  const styles = {
    student: "bg-blue-100 text-blue-700",
    lecturer: "bg-violet-100 text-violet-700",
    admin: "bg-rose-100 text-rose-700",
  };
  const icons = {
    student: GraduationCap,
    lecturer: BookOpen,
    admin: Shield,
  };
  const Icon = icons[role] || Shield;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
                  text-xs font-semibold capitalize ${styles[role] || "bg-slate-100 text-slate-600"}`}
    >
      <Icon size={11} />
      {role}
    </span>
  );
}

// ─── Status Badge ──────────────────────────────────────────────
function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
                  text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isActive ? "Active" : "Disabled"}
    </span>
  );
}

// ─── Safe Date Formatter ───────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Action Menu (fixed positioning, no overflow clipping) ────
function ActionMenu({ user, currentUserId, onRoleChange, onToggle, onDelete }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const isSelf = user._id === currentUserId;

  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.right - 210,
    });
    setOpen(!open);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <MoreVertical size={16} className="text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.1 }}
              style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed z-50 w-52 bg-white rounded-2xl 
                         border border-slate-200 shadow-xl overflow-hidden"
            >
              {/* Change Role */}
              <div className="p-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase 
                              tracking-wider px-2 py-1">
                  Change Role
                </p>
                {["student", "lecturer", "admin"].map((role) => (
                  <button
                    key={role}
                    disabled={isSelf || user.role === role}
                    onClick={() => {
                      onRoleChange(user._id, role);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm 
                                capitalize transition-colors
                                ${
                                  user.role === role
                                    ? "text-slate-300 cursor-default"
                                    : "text-slate-700 hover:bg-slate-50"
                                }
                                disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {user.role === role ? `✓ ${role}` : role}
                  </button>
                ))}
              </div>

              {/* Toggle + Delete */}
              <div className="p-2">
                <button
                  disabled={isSelf}
                  onClick={() => {
                    onToggle(user._id, user.is_active);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm 
                             flex items-center gap-2 transition-colors
                             text-slate-700 hover:bg-slate-50
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {user.is_active !== false ? (
                    <>
                      <UserX size={14} className="text-amber-500" />
                      Disable Account
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} className="text-emerald-500" />
                      Enable Account
                    </>
                  )}
                </button>

                <button
                  disabled={isSelf}
                  onClick={() => {
                    onDelete(user._id, user.full_name);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm 
                             flex items-center gap-2 transition-colors
                             text-rose-600 hover:bg-rose-50
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  Delete User
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Confirm Delete Modal ──────────────────────────────────────
function DeleteModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100"
        >
          <X size={16} className="text-slate-400" />
        </button>

        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center 
                        justify-center mb-4">
          <Trash2 size={22} className="text-rose-600" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete User</h3>
        <p className="text-slate-500 text-sm mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">{user?.full_name}</span>
          ? This will also delete all their documents and checks.
          <span className="block mt-1 text-rose-500 font-medium">
            This action cannot be undone.
          </span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 
                       text-slate-700 font-semibold text-sm hover:bg-slate-50 
                       transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white 
                       font-semibold text-sm hover:bg-rose-700 transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?._id;
    } catch {
      return null;
    }
  })();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/users", {
        params: { search, role: roleFilter, page, limit: 15 },
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/admin/users/${userId}`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleToggle = async (userId, currentStatus) => {
    try {
      await api.patch(`/api/admin/users/${userId}/toggle`);
      toast.success(`User ${currentStatus !== false ? "disabled" : "enabled"}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/admin/users/${deleteTarget._id}`);
      toast.success("User deleted successfully");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const getAvatar = (name) => name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl">
              <Users size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          </div>
          <p className="text-slate-500 ml-12">
            Manage all registered users — {total} total
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 
                         bg-white text-sm text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                         focus:border-blue-400 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {["", "student", "lecturer", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium 
                            capitalize transition-all border
                            ${
                              roleFilter === role
                                ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white border-transparent shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
              >
                {role === "" ? "All" : role}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent 
                              rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["User", "Role", "Status", "Documents", "Joined", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-semibold text-slate-500 
                                     uppercase tracking-wider px-5 py-3.5"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user, i) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full bg-gradient-to-br 
                                        from-blue-400 to-violet-500 flex items-center 
                                        justify-center text-white text-sm font-bold shrink-0"
                          >
                            {getAvatar(user.full_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {user.full_name}
                              {user._id === currentUserId && (
                                <span className="ml-2 text-xs text-blue-500 font-normal">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge isActive={user.is_active !== false} />
                      </td>

                      {/* Documents */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {user.documentCount ?? 0}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">docs</span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-500">
                          {formatDate(user.created_at || user.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <ActionMenu
                          user={user}
                          currentUserId={currentUserId}
                          onRoleChange={handleRoleChange}
                          onToggle={handleToggle}
                          onDelete={(id, name) =>
                            setDeleteTarget({ _id: id, full_name: name })
                          }
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 
                            border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages} · {total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 
                             hover:bg-slate-50 disabled:opacity-40 
                             disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 
                             hover:bg-slate-50 disabled:opacity-40 
                             disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            user={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}