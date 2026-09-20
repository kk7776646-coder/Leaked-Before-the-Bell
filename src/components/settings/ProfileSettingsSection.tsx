import React, { useState, useRef, useEffect, DragEvent } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle, Shield, Building2, User, Mail, Calendar, Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const ProfileSettingsSection: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop / Adjustment States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [imageError, setImageError] = useState(false);
  const [cacheBuster, setCacheBuster] = useState<number>(Date.now());
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
    setCacheBuster(Date.now());
  }, [user?.avatarUrl]);

  // Construct authenticated and cache-busted URL for standard img tags inside the sandboxed iframe
  const getAuthenticatedAvatarUrl = (url?: string) => {
    if (!url) return '';
    if (!url.startsWith('/api/')) return url;
    const token = localStorage.getItem('leaklens_token');
    const separator = url.includes('?') ? '&' : '?';
    const queryParts = [];
    if (token) queryParts.push(`token=${encodeURIComponent(token)}`);
    queryParts.push(`t=${cacheBuster}`);
    return `${url}${separator}${queryParts.join('&')}`;
  };

  if (!user) return null;

  // Calculate initials safely
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LK';

  const roleLabel =
    user.role === 'ADMIN'
      ? 'Administrator'
      : user.role === 'SECURITY_OFFICER'
      ? 'Security Officer'
      : user.role === 'REVIEWER'
      ? 'Document Reviewer'
      : user.role === 'VIEWER'
      ? 'System Observer / Viewer'
      : 'Operations Operator';

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    setSuccess(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processAndPrepareFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    if (e.target.files && e.target.files[0]) {
      await processAndPrepareFile(e.target.files[0]);
    }
  };

  const processAndPrepareFile = async (file: File) => {
    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file format. Please upload JPEG, PNG, GIF, or WEBP images.');
      return;
    }

    // Validate size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size too large. Maximum file size allowed is 5MB.');
      return;
    }

    // Read file for adjustment preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      setSelectedFile(file);
      // Reset defaults
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  // Drag interaction logic inside modal crop view
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    dragStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage) return;
    setPanX(e.clientX - dragStartRef.current.x);
    setPanY(e.clientY - dragStartRef.current.y);
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  // Touch support for mobile dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDraggingImage(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingImage || !e.touches[0]) return;
    setPanX(e.touches[0].clientX - dragStartRef.current.x);
    setPanY(e.touches[0].clientY - dragStartRef.current.y);
  };

  // Client-side canvas cropping and saving logic
  const handleSaveAndUpload = () => {
    if (!selectedFile || !previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill transparent background with clean white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);

      // Translate to center point for rotation and scaling
      ctx.translate(150, 150);
      ctx.rotate((rotation * Math.PI) / 180);

      const imgWidth = img.width;
      const imgHeight = img.height;
      const minSide = Math.min(imgWidth, imgHeight);

      // Scale to cover canvas area
      const baseScale = 300 / minSide;
      const drawWidth = imgWidth * baseScale * zoom;
      const drawHeight = imgHeight * baseScale * zoom;

      // Draw the image with translation offsets applied relative to zoom
      ctx.drawImage(
        img,
        -drawWidth / 2 + panX,
        -drawHeight / 2 + panY,
        drawWidth,
        drawHeight
      );

      // Export canvas to secure JPEG blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setError('Failed to process and crop image.');
            return;
          }

          const croppedFile = new File([blob], selectedFile.name, {
            type: selectedFile.type || 'image/jpeg',
            lastModified: Date.now(),
          });

          // Close modal and initiate actual api upload
          setSelectedFile(null);
          setPreviewUrl(null);
          setIsUploading(true);
          setError(null);

          try {
            await api.uploadAvatar(croppedFile);
            await refreshUser();
            setImageError(false);
            setCacheBuster(Date.now());
            setSuccess('Profile photo updated and adjusted successfully!');
            setTimeout(() => setSuccess(null), 4000);
          } catch (err: any) {
            setError(err.message || 'An error occurred while uploading your profile photo.');
          } finally {
            setIsUploading(false);
          }
        },
        selectedFile.type || 'image/jpeg',
        0.92
      );
    };
    img.src = previewUrl;
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Profile Info & Avatar Upload Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Circular Avatar View & Drag Drop Upload */}
        <div className="lg:col-span-1">
          <Card
            title="Profile Photo"
            subtitle="Manage your visual account identifier."
            className="border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 shadow-xs rounded-2xl"
          >
            <div className="flex flex-col items-center pt-2">
              {/* Avatar View Block */}
              <div className="relative group mb-8">
                <div className="relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-md bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
                  {user.avatarUrl && !imageError ? (
                    <img
                      src={getAuthenticatedAvatarUrl(user.avatarUrl)}
                      alt={user.fullName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-4xl font-extrabold select-none tracking-tight">
                      {initials}
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-900/65 flex items-center justify-center backdrop-blur-xs">
                      <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  disabled={isUploading}
                  className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-400 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 cursor-pointer transition-all duration-150 hover:shadow-xl"
                  title="Upload profile photo"
                >
                  <Camera className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Drag and Drop Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={isUploading ? undefined : triggerFileSelect}
                className={`w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                  isUploading
                    ? 'border-blue-400 bg-blue-50/10 dark:bg-blue-950/5 animate-pulse pointer-events-none'
                    : success
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/10 dark:bg-emerald-950/5'
                    : error
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/10 dark:bg-rose-950/5'
                    : dragActive
                    ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs scale-[1.01]'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 hover:border-blue-500/50 dark:hover:border-blue-500/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Uploading...
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Processing profile photo
                    </p>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3 animate-bounce" />
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Upload Completed!
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      Your avatar is updated successfully
                    </p>
                  </>
                ) : error ? (
                  <>
                    <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 mb-3" />
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      Upload Failed
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      Click here to try again
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-3 group-hover:text-blue-500 transition-colors" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {dragActive ? 'Drop image here' : 'Drag & drop profile image'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed max-w-[220px]">
                      Or click to browse from files (JPEG, PNG, WEBP, GIF. Max 5MB)
                    </p>
                  </>
                )}
              </div>

              {/* Success and Error Messages */}
              {success && (
                <div className="w-full mt-4 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in slide-in-from-top-1 duration-150">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="w-full mt-4 p-3.5 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

            </div>
          </Card>
        </div>

        {/* Right Cards: Profile Metadata Details & Static Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card
            title="Profile & Session Details"
            subtitle="Secure metadata mapped to your verified authentication identity."
            className="border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 shadow-xs rounded-2xl"
          >
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Display Name</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                      {user.fullName}
                    </span>
                  </div>
                </div>

                {/* Email Address */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assigned Role</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                      {roleLabel}
                    </span>
                  </div>
                </div>

                {/* Organization */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Organization</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                      {user.organization || 'Central Board of Examination'}
                    </span>
                  </div>
                </div>

                {/* Account Created */}
                {user.createdAt && (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Enrolled</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Last Active */}
                {user.lastLoginAt && (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                      <Eye className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Active Session</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                        {new Date(user.lastLoginAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Technical Warning Box */}
              <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/60 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-300 leading-relaxed flex items-start gap-3">
                <Shield className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-blue-900 dark:text-blue-200">Identity Integrity Verification:</strong> All details, organizational mappings, and cryptographic keys are security-locked to guarantee an immutable log. Any adjustments must go through forensic governance pipelines.
                </span>
              </div>

            </div>
          </Card>
        </div>

      </div>

      {/* Photo Adjustment Modal */}
      {selectedFile && previewUrl && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/85 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Adjust Profile Photo
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Drag the photo inside the circle to position it, and use the sliders below to scale or rotate your image perfectly.
            </p>

            {/* Viewport Crop Circle */}
            <div className="flex justify-center mb-8">
              <div 
                className="relative w-52 h-52 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 shadow-inner cursor-move select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <img
                  src={previewUrl}
                  alt="Adjustment Preview"
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out',
                  }}
                  className="w-full h-full object-contain pointer-events-none"
                />
                
                {/* Circular Mask Overlay Outline */}
                <div className="absolute inset-0 pointer-events-none border border-blue-600/35 rounded-full" />
              </div>
            </div>

            {/* Slider Controls */}
            <div className="space-y-5 mb-8 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              {/* Zoom Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Zoom / Scale</span>
                  <span className="text-blue-600 dark:text-blue-400">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
              </div>

              {/* Rotation Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Rotate</span>
                  <span className="text-blue-600 dark:text-blue-400">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndUpload}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
              >
                Apply & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
