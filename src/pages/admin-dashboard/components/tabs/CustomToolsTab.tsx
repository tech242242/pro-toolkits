import React from "react";
import { Copy, Edit, ExternalLink, FileCode, Plus, Trash2 } from "lucide-react";
import { SimDatabase } from "../../types";

interface CustomToolsTabProps {
  simDatabases: SimDatabase[];
  openSimDbModal: (dbRow?: SimDatabase) => void;
  deleteSimDb: (id: string, e: React.MouseEvent) => void;
  handleCopyLink: (text: string) => void;
}

export const CustomToolsTab: React.FC<CustomToolsTabProps> = ({
  simDatabases,
  openSimDbModal,
  deleteSimDb,
  handleCopyLink,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Custom Tools Creator
          </h3>
          <p className="text-zinc-400 text-sm">
            Create standalone databases and customized tools.
          </p>
        </div>
        <button
          onClick={() => openSimDbModal()}
          className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Sim Database
        </button>
      </div>

      {simDatabases.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl border-dashed">
          <FileCode className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-500">
            No custom tools created yet
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {simDatabases.map((dbRow) => (
            <div
              key={dbRow.id}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-3xl p-5 backdrop-blur-xl transition-all hover:translate-y-[-4px]"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold text-lg">
                      {dbRow.name}
                    </h4>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                      Sim DB
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
                      Admin Route
                    </p>
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
                      <code className="text-[11px] font-mono text-zinc-400">
                        /db/{dbRow.admin_username}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                  <button
                    onClick={() => handleCopyLink(`/db/${dbRow.admin_username}`)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`/db/${dbRow.admin_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-zinc-400 hover:text-cyan-400 transition-all border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => openSimDbModal(dbRow)}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteSimDb(dbRow.id, e)}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
