import React, { useState } from 'react';
import { storage } from '@/src/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  path: string;
  onUpload: (url: string) => void;
  label?: string;
  currentUrl?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ path, onUpload, label, currentUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("الملف كبير جداً (الحد الأقصى 5 ميجابايت)");
      return;
    }

    setUploading(true);
    setProgress(0);

    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (err) => {
        setUploading(false);
        setError(err.message);
        toast.error("فشل الرفع: " + err.message);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onUpload(url);
        setUploading(false);
        toast.success("تم رفع الصورة بنجاح");
      }
    );
  };

  return (
    <div className="space-y-4 text-right">
      {label && <label className="text-sm font-black uppercase tracking-widest text-gray-400">{label}</label>}
      <div className="relative group border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:border-orange-500 hover:bg-orange-50/30 transition-all flex flex-col items-center justify-center text-center">
        {currentUrl && !uploading ? (
          <div className="relative h-40 w-full rounded-2xl overflow-hidden group">
            <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-xl font-bold flex flex-row-reverse items-center gap-2">
                 <Upload size={18} /> تغيير
                 <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
               </label>
            </div>
          </div>
        ) : (
          <>
            {uploading ? (
              <div className="w-full max-w-xs space-y-4">
                <Progress value={progress} className="h-2 bg-orange-100" />
                <p className="font-bold text-orange-600 animate-pulse uppercase tracking-widest text-[10px]">جاري الرفع {Math.round(progress)}%</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-orange-100/50 rounded-2xl text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                   <ImageIcon size={32} />
                </div>
                <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm mb-1">انقر للرفع</h4>
                <p className="text-xs text-gray-400 font-medium">SVG, PNG, JPG (الحد الأقصى 5 ميجابايت)</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
