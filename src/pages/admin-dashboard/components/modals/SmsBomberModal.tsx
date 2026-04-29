import React from "react";
import { SmsBomber } from "../../types";
import { X } from "lucide-react";

interface SmsBomberModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: any;
  setForm: any;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  message: { text: string; type: "error" | "success" } | null;
  isEditing: boolean;
}

export const SmsBomberModal: React.FC<SmsBomberModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  message,
  isEditing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "Edit SMS Bomber" : "New SMS Bomber"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Admin Username</label>
            <input
              required
              value={form.admin_username}
              onChange={(e) => setForm({ ...form, admin_username: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Channel Link</label>
            <input
              value={form.channel_link}
              onChange={(e) => setForm({ ...form, channel_link: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">WhatsApp Number</label>
            <input
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Theme Color</label>
            <input
              type="color"
              value={form.theme_color}
              onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
              className="w-full h-10 bg-white/5 border border-white/10 rounded-xl"
            />
          </div>
          {message && (
            <p className={`text-xs ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          )}
          <button
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-2xl transition-all"
          >
            {loading ? "Saving..." : isEditing ? "Update Bomber" : "Create Bomber"}
          </button>
        </form>
      </div>
    </div>
  );
};
