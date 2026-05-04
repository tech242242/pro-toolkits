import fs from 'fs';

const filePath = 'src/pages/admin-dashboard/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const patches = [
  // 1. Tool Modal
  {
    target: `    } else {
      setEditingTool(null);
      setToolForm({
        name: "",
        slug: "",
        link_url: "",
        image_url: "",
        category: uniqueCategories[0] || "Tools",
        is_media: false,
        is_locked: false,
        password: "",
        is_gated: false,
        gate_url: "",
        gate_text: "Subscribe first to unlock",
        gate_icon: "youtube",
        video_urls: [] as string[],
      });
    }`,
    replacement: `    } else {
      setEditingTool(null);
      const draft = localStorage.getItem("draft_toolForm");
      if (draft) {
        try { setToolForm(JSON.parse(draft)); } catch(e) {}
      } else {
        setToolForm({
          name: "",
          slug: "",
          link_url: "",
          image_url: "",
          category: uniqueCategories[0] || "Tools",
          is_media: false,
          is_locked: false,
          password: "",
          is_gated: false,
          gate_url: "",
          gate_text: "Subscribe first to unlock",
          gate_icon: "youtube",
          video_urls: [] as string[],
        });
      }
    }`
  },
  // 2. Clear tool draft on save
  {
    target: `        setIsModalOpen(false);
        fetchDashboardData();`,
    replacement: `        localStorage.removeItem("draft_toolForm");
        setIsModalOpen(false);
        fetchDashboardData();`
  },
  
  // 3. Store tool draft on change using an effect (to be injected)
  // Let's just find where `const saveTool` is, and insert the effect right above it.
  {
    target: `  const saveTool = async (e: React.FormEvent) => {`,
    replacement: `  React.useEffect(() => {
    if (isModalOpen && !editingTool) {
      localStorage.setItem("draft_toolForm", JSON.stringify(toolForm));
    }
  }, [toolForm, isModalOpen, editingTool]);

  const saveTool = async (e: React.FormEvent) => {`
  }
];

let successCount = 0;
for (const patch of patches) {
  if (content.includes(patch.target)) {
    content = content.replace(patch.target, patch.replacement);
    successCount++;
  } else {
    console.error("Failed to apply patch length: " + patch.target.length);
  }
}

console.log("Patches applied: " + successCount + " / " + patches.length);
fs.writeFileSync(filePath, content);
