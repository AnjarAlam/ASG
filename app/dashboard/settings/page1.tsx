// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Settings,
//   Database,
//   Users,
//   KeyRound,
//   Save,
//   X,
//   Plus,
//   Pencil,
//   Trash2,
//   ChevronRight,
//   AlertCircle,
// } from "lucide-react";

// const INITIAL_GRADES = ["E", "F", "B"] as const;
// const INITIAL_TYPES = ["ROM", "Steam", "Boulders", "Rejected"] as const;
// const INITIAL_SIZES = ["0-10", "10-20", "20-50", "50-80", "80-175"] as const;
// const INITIAL_AREAS = ["A", "B", "C", "D", "E", "F", "G"] as const;

// type MasterType = "grades" | "types" | "sizes" | "areas";

// type MasterData = {
//   grades: string[];
//   types: string[];
//   sizes: string[];
//   areas: string[];
// };

// export default function SettingsPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState<"master" | "users" | "system">("master");

//   const [masterData, setMasterData] = useState<MasterData>({
//     grades: [...INITIAL_GRADES],
//     types: [...INITIAL_TYPES],
//     sizes: [...INITIAL_SIZES],
//     areas: [...INITIAL_AREAS],
//   });

//   const [editing, setEditing] = useState<{ type: MasterType; index: number; value: string } | null>(null);
//   const [newItem, setNewItem] = useState<{ type: MasterType; value: string } | null>(null);

//   const [systemSettings, setSystemSettings] = useState({
//     weighbridgeApiUrl: "",
//     enableANPR: true,
//     enableRFID: false,
//     enableChatNotifications: true,
//   });

//   const [isSaving, setIsSaving] = useState(false);

//   // ── Handlers ────────────────────────────────────────────────────────────────
//   const handleSaveAll = async () => {
//     setIsSaving(true);
//     await new Promise((r) => setTimeout(r, 1400));
//     alert("Settings saved successfully!");
//     setIsSaving(false);
//   };

//   const startEdit = (type: MasterType, index: number, value: string) => {
//     setEditing({ type, index, value });
//     setNewItem(null);
//   };

//   const saveEdit = () => {
//     if (!editing || !editing.value.trim()) return;
//     setMasterData((prev) => ({
//       ...prev,
//       [editing.type]: prev[editing.type].map((v, i) => (i === editing.index ? editing.value.trim() : v)),
//     }));
//     setEditing(null);
//   };

//   const addNew = (type: MasterType) => setNewItem({ type, value: "" });

//   const saveNew = () => {
//     if (!newItem || !newItem.value.trim()) return;
//     setMasterData((prev) => ({
//       ...prev,
//       [newItem.type]: [...prev[newItem.type], newItem.value.trim()],
//     }));
//     setNewItem(null);
//   };

//   const deleteItem = (type: MasterType, index: number) => {
//     if (!confirm("Delete this item? This action cannot be undone.")) return;
//     setMasterData((prev) => ({
//       ...prev,
//       [type]: prev[type].filter((_, i) => i !== index),
//     }));
//   };

//   // ── Components ──────────────────────────────────────────────────────────────
//   const MasterItem = ({
//     item,
//     index,
//     type,
//   }: {
//     item: string;
//     index: number;
//     type: MasterType;
//   }) => (
//     <div className="group flex items-center gap-4 px-5 py-3.5 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl transition-all border border-slate-700/50">
//       {editing?.type === type && editing.index === index ? (
//         <input
//           autoFocus
//           value={editing.value}
//           onChange={(e) => setEditing({ ...editing, value: e.target.value })}
//           onBlur={saveEdit}
//           onKeyDown={(e) => e.key === "Enter" && saveEdit()}
//           className="flex-1 bg-transparent border-b-2 border-indigo-500 focus:border-indigo-400 outline-none text-white text-lg font-medium"
//         />
//       ) : (
//         <span className="flex-1 text-lg font-medium text-slate-200">{item}</span>
//       )}

//       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//         <button
//           onClick={() => startEdit(type, index, item)}
//           className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-lg transition-colors"
//         >
//           <Pencil size={18} />
//         </button>
//         <button
//           onClick={() => deleteItem(type, index)}
//           className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
//         >
//           <Trash2 size={18} />
//         </button>
//       </div>
//     </div>
//   );

//   const MasterSection = ({ title, type }: { title: string; type: MasterType }) => {
//     const items = masterData[type];

//     return (
//       <div className="space-y-5">
//         <div className="flex items-center justify-between">
//           <h3 className="text-xl font-semibold text-indigo-300/90">{title}</h3>
//           <button
//             onClick={() => addNew(type)}
//             className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 rounded-lg transition-colors border border-indigo-500/30"
//           >
//             <Plus size={18} />
//             <span>Add New</span>
//           </button>
//         </div>

//         <div className="space-y-3">
//           {items.map((item, i) => (
//             <MasterItem key={i} item={item} index={i} type={type} />
//           ))}

//           {newItem?.type === type && (
//             <div className="flex items-center gap-4 px-5 py-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
//               <input
//                 autoFocus
//                 placeholder="New value..."
//                 value={newItem.value}
//                 onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
//                 onBlur={saveNew}
//                 onKeyDown={(e) => e.key === "Enter" && saveNew()}
//                 className="flex-1 bg-transparent border-b-2 border-emerald-500 focus:border-emerald-400 outline-none text-white text-lg font-medium"
//               />
//               <button
//                 onClick={saveNew}
//                 className="p-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-lg transition-colors"
//               >
//                 <Save size={20} />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-slate-100">
//       {/* Top Bar */}
//       <div className="border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-lg sticky top-0 z-20">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-900/30">
//               <Settings className="w-6 h-6" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
//               <p className="text-sm text-slate-400">Configure your system preferences</p>
//             </div>
//           </div>

//           <button
//             onClick={() => router.back()}
//             className="p-2.5 hover:bg-slate-800 rounded-lg transition-colors"
//           >
//             <X size={24} className="text-slate-400 hover:text-slate-200" />
//           </button>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-10">
//         {/* Navigation Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
//           {[
//             { id: "master", label: "Master Data", icon: Database, desc: "Grades, Types, Sizes, Areas" },
//             { id: "users", label: "Users & Roles", icon: Users, desc: "Manage team members" },
//             { id: "system", label: "System Config", icon: KeyRound, desc: "Integrations & features" },
//           ].map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveTab(item.id as typeof activeTab)}
//               className={`
//                 group p-6 rounded-2xl border transition-all duration-300 text-left
//                 ${
//                   activeTab === item.id
//                     ? "bg-gradient-to-br from-indigo-950/70 to-violet-950/40 border-indigo-600/50 shadow-lg shadow-indigo-900/20"
//                     : "bg-slate-900/60 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/80"
//                 }
//               `}
//             >
//               <div className="flex items-start justify-between">
//                 <div>
//                   <item.icon
//                     className={`mb-4 ${
//                       activeTab === item.id ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"
//                     }`}
//                     size={28}
//                   />
//                   <h3 className="text-xl font-semibold mb-1.5">{item.label}</h3>
//                   <p className="text-sm text-slate-400">{item.desc}</p>
//                 </div>
//                 <ChevronRight
//                   className={`mt-1.5 transition-transform ${
//                     activeTab === item.id ? "text-indigo-400 translate-x-1" : "text-slate-600 group-hover:text-slate-400"
//                   }`}
//                 />
//               </div>
//             </button>
//           ))}
//         </div>

//         {/* Content Area */}
//         <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 backdrop-blur-sm">
//           {activeTab === "master" && (
//             <div className="grid lg:grid-cols-2 gap-x-12 gap-y-14">
//               <MasterSection title="Coal Grades" type="grades" />
//               <MasterSection title="Coal Types" type="types" />
//               <MasterSection title="Coal Sizes (mm)" type="sizes" />
//               <MasterSection title="Stock Areas" type="areas" />
//             </div>
//           )}

//           {activeTab === "users" && (
//             <div className="py-16 text-center">
//               <div className="inline-block p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 mb-6">
//                 <Users size={48} className="mx-auto mb-6 text-indigo-400/70" />
//                 <h3 className="text-2xl font-semibold mb-3">User Management</h3>
//                 <p className="text-slate-400 max-w-md mx-auto mb-8">
//                   Full user & role management system will be available in the next major update
//                 </p>
//                 <button className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors font-medium">
//                   Notify me when ready
//                 </button>
//               </div>
//             </div>
//           )}

//           {activeTab === "system" && (
//             <div className="max-w-2xl space-y-10">
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-3">
//                   Weighbridge API Endpoint
//                 </label>
//                 <input
//                   type="url"
//                   value={systemSettings.weighbridgeApiUrl}
//                   onChange={(e) =>
//                     setSystemSettings((s) => ({ ...s, weighbridgeApiUrl: e.target.value }))
//                   }
//                   placeholder="https://api.weighbridge.yourcompany.com"
//                   className="w-full px-5 py-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:border-indigo-600 outline-none transition-colors"
//                 />
//               </div>

//               <div className="space-y-6 pt-4">
//                 <h4 className="text-lg font-medium text-slate-200 border-b border-slate-700/50 pb-3">
//                   Features & Integrations
//                 </h4>

//                 {[
//                   { id: "anpr", label: "Enable ANPR Camera Integration", key: "enableANPR" },
//                   { id: "rfid", label: "Enable RFID Vehicle Tracking", key: "enableRFID" },
//                   {
//                     id: "chat",
//                     label: "Enable Real-time Chat Notifications",
//                     key: "enableChatNotifications",
//                   },
//                 ].map((feature) => (
//                   <div key={feature.id} className="flex items-center justify-between">
//                     <label htmlFor={feature.id} className="text-slate-200 cursor-pointer">
//                       {feature.label}
//                     </label>
//                     <input
//                       type="checkbox"
//                       id={feature.id}
//                       checked={systemSettings[feature.key as keyof typeof systemSettings] as boolean}
//                       onChange={(e) =>
//                         setSystemSettings((s) => ({
//                           ...s,
//                           [feature.key]: e.target.checked,
//                         }))
//                       }
//                       className="w-6 h-6 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-slate-900"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Floating Save Button */}
//       <div className="fixed bottom-8 right-8 z-30">
//         <button
//           onClick={handleSaveAll}
//           disabled={isSaving}
//           className={`
//             flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl shadow-indigo-900/40 transition-all duration-300
//             ${
//               isSaving
//                 ? "bg-slate-700 cursor-not-allowed"
//                 : "bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 hover:shadow-indigo-800/40"
//             }
//           `}
//         >
//           <Save size={20} />
//           <span className="font-medium">{isSaving ? "Saving..." : "Save Changes"}</span>
//         </button>
//       </div>
//     </div>
//   );
// }