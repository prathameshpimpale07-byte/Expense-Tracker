import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { User, Shield, LogOut, X, Camera, Check, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";

// Utility function to crop and resize the image
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = 250;
  canvas.height = 250;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, 250, 250
  );

  return canvas.toDataURL("image/jpeg", 0.7); // Tighter compression for reliability
};

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profileImage: user?.profileImage || ""
  });

  // Cropping State
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const fileInputRef = useRef(null);

  // Sync with Global User
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || ""
      });
    }
  }, [user]);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAndUpload = async () => {
    if (!croppedAreaPixels) return toast.error("Please crop the image first.");
    setLoading(true);
    try {
      const croppedResult = await getCroppedImg(tempImage, croppedAreaPixels);
      
      const { data } = await API.put("/auth/profile", {
        name: profileData.name,
        email: profileData.email,
        profileImage: croppedResult
      });
      
      const updatedUser = { 
        ...data.user, 
        profileImage: data.user.profileImage || "" 
      };
      
      setUser(updatedUser);
      setProfileData(prev => ({ ...prev, profileImage: updatedUser.profileImage }));
      toast.success("Profile photo updated!");
      setShowCropModal(false);
      setTempImage(null);
    } catch (e) {
      toast.error("Photo update failed. Try a smaller file.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put("/auth/profile", {
        name: profileData.name,
        email: profileData.email,
        profileImage: profileData.profileImage
      });
      setUser(data.user);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const isStrongPassword = (pass) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Passwords do not match");
    if (!isStrongPassword(passwords.new)) {
      return toast.error("Password must be at least 8 chars long with uppercase, lowercase, number & symbol.");
    }
    setPassLoading(true);
    try {
      await API.put("/auth/change-password", { currentPassword: passwords.current, newPassword: passwords.new });
      toast.success("Password updated successfully");
      setShowPasswordModal(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
        
        {/* Profile Header Image Display */}
        <div className="glass-card rounded-[2rem] p-6 sm:p-12 py-10 sm:py-16 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border-none">
           {/* Decorative bg element */}
           <div className="absolute inset-0 bg-teal-600/10 pointer-events-none"></div>
           
           <div className="relative flex flex-col items-center gap-4 sm:gap-5 z-10 text-center">
              <div 
                className="relative group/avatar cursor-pointer outline-none"
                onClick={() => fileInputRef.current?.click()}
              >
                 <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-teal-500/20 shadow-xl overflow-hidden ring-4 ring-white/5 group-hover/avatar:ring-teal-500/30 transition-all">
                    {user?.profileImage ? (
                       <img 
                         key={user.profileImage}
                         src={user.profileImage} 
                         alt="Profile" 
                         className="w-full h-full object-cover animate-in fade-in transition-opacity duration-300" 
                        />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-black bg-teal-600 text-teal-50">
                          {user?.name?.charAt(0).toUpperCase() || "H"}
                       </div>
                    )}
                 </div>
                 <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-full opacity-100 sm:opacity-0 sm:group-hover/avatar:opacity-100 transition-all pointer-events-none">
                    <Camera className="text-white mb-1" size={20} sm:size={24} />
                    <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest">Change</span>
                 </div>
                 <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} onClick={(e) => e.target.value = null} />
              </div>
              <div className="space-y-1">
                 <h2 className="text-2xl sm:text-3xl font-black text-heading tracking-tight capitalize">{user?.name || "User"}</h2>
                 <p className="text-muted font-bold text-xs sm:text-sm tracking-wide break-all max-w-[250px] sm:max-w-none">{user?.email || "user@example.com"}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Section 1 - Profile Details */}
           <div className="glass-card p-8 sm:p-12 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-lg transition-all border-none">
              <div className="flex items-center justify-between mb-8 sm:mb-10">
                 <h3 className="text-sm font-black text-heading flex items-center gap-3 uppercase tracking-widest">
                    <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500"><User size={20} /></div>
                    Personal Info
                 </h3>
                 {!isEditing && (
                   <button onClick={() => setIsEditing(true)} className="text-[10px] font-black text-teal-500 uppercase tracking-widest hover:underline px-4 py-2 glass-pill rounded-xl">Edit</button>
                 )}
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Full Name</label>
                    {isEditing ? (
                       <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full h-12 sm:h-14 px-5 glass-pill border-none rounded-2xl text-sm font-black text-heading outline-none focus:ring-2 focus:ring-teal-500/30 transition-all" required />
                    ) : (
                       <div className="h-12 sm:h-14 flex items-center px-5 glass-pill rounded-2xl text-sm font-black text-heading tracking-tight">{user?.name}</div>
                    )}
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Email Address</label>
                    {isEditing ? (
                       <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full h-12 sm:h-14 px-5 glass-pill border-none rounded-2xl text-sm font-black text-heading outline-none focus:ring-2 focus:ring-teal-500/30 transition-all" required />
                    ) : (
                       <div className="h-12 sm:h-14 flex items-center px-5 glass-pill rounded-2xl text-sm font-black text-heading tracking-tight break-all">{user?.email}</div>
                    )}
                 </div>
                 {isEditing && (
                    <div className="flex gap-4 pt-4">
                       <button type="submit" disabled={loading} className="flex-1 h-12 sm:h-14 bg-teal-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-teal-600/20 active:scale-95 transition-all">Save</button>
                       <button type="button" onClick={() => setIsEditing(false)} className="flex-1 h-12 sm:h-14 glass-pill text-muted hover:text-heading rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">Cancel</button>
                    </div>
                 )}
              </form>
           </div>

           {/* Section 2 - Security */}
           <div className="glass-card p-8 sm:p-12 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-lg transition-all border-none">
              <div>
                 <h3 className="text-sm font-black text-heading flex items-center gap-3 mb-8 sm:mb-10 uppercase tracking-widest">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500"><Shield size={20} /></div>
                    Account Security
                 </h3>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Current Password</label>
                    <div className="flex items-center justify-between h-12 sm:h-14 px-5 glass-pill rounded-2xl gap-2">
                       <p className="text-lg font-black text-muted tracking-[0.3em] pt-2 truncate overflow-hidden">••••••••</p>
                       <button onClick={() => setShowPasswordModal(true)} className="text-[9px] sm:text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline px-3 sm:px-4 py-2 bg-orange-500/10 rounded-xl whitespace-nowrap">Change</button>
                    </div>
                 </div>
              </div>
              <button 
                onClick={logout} 
                className="w-full h-12 sm:h-14 mt-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2.5 active:scale-95"
              >
                 <LogOut size={16} sm:size={18} /> Logout Account
              </button>
           </div>
        </div>

      {/* Cropping Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-200/50 dark:bg-slate-900/80 backdrop-blur-xl animate-in fade-in transition-all">
           <div className="glass-card bg-white/80 dark:bg-slate-900/80 w-full max-w-lg rounded-[3rem] shadow-2xl relative border border-white/20 dark:border-slate-700/50 overflow-hidden flex flex-col scale-in-center">
              <div className="h-[400px] relative w-full bg-black flex items-center justify-center">
                 <Cropper
                    image={tempImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                 />
              </div>
              <div className="p-10 space-y-10 glass-card bg-white/80 dark:bg-slate-900/80 rounded-t-none border-none text-center">
                 <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Pinch or Scroll to zoom</p>
                    <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 glass-pill" />
                 </div>
                 <div className="flex gap-4">
                    <button onClick={handleApplyAndUpload} disabled={loading} className="flex-1 h-14 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-teal-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                       {loading ? "SAVING..." : <><Check size={18} /> APPLY</>}
                    </button>
                    {!loading && <button onClick={() => setShowCropModal(false)} className="flex-1 h-14 glass-pill text-muted hover:text-heading rounded-2xl font-black text-xs uppercase tracking-widest transition-all">CANCEL</button>}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-200/50 dark:bg-slate-900/80 backdrop-blur-xl animate-in fade-in transition-all">
          <div className="glass-card bg-white/80 dark:bg-slate-900/80 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-700/50 relative p-10 space-y-10 scale-in-center">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-heading flex-1 ml-2 tracking-tight uppercase">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="w-10 h-10 glass-pill rounded-xl flex items-center justify-center text-muted hover:text-heading transition-all"><X size={20} /></button>
             </div>
             <form onSubmit={handleChangePassword} className="space-y-6">
                {[
                  { label: "Current Password", key: "current" },
                  { label: "New Password", key: "new" },
                  { label: "Confirm Password", key: "confirm" }
                ].map(f => (
                   <div key={f.key} className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">{f.label}</label>
                      <div className="relative">
                         <input type={showPass[f.key] ? "text" : "password"} value={passwords[f.key]} onChange={(e) => setPasswords({...passwords, [f.key]: e.target.value})} className="w-full h-14 px-5 glass-pill border-none rounded-2xl text-sm font-black text-heading outline-none focus:ring-2 focus:ring-orange-500/30 pr-12 transition-all" required />
                         <button type="button" onClick={() => setShowPass({...showPass, [f.key]: !showPass[f.key]})} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-all">
                            {showPass[f.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                      </div>
                   </div>
                ))}
                <div className="flex flex-col gap-4 pt-6">
                   <button type="submit" disabled={passLoading} className="w-full h-14 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-500/30 active:scale-95 transition-all">Update</button>
                   <button type="button" onClick={() => setShowPasswordModal(false)} className="w-full h-14 glass-pill text-muted hover:text-heading rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
