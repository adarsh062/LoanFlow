'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [checking, setChecking] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Guard: BRE must be approved before this page
  useEffect(() => {
    api.get('/api/borrower/profile').then(({ data }) => {
      if (!data.data || !data.data.breApproved) {
        toast.error('Please complete profile and BRE validation first');
        router.replace('/borrower/profile');
      }
    }).catch(() => {
      router.replace('/borrower/profile');
    }).finally(() => setChecking(false));
  }, [router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(selected.type)) {
      toast.error('Only PDF, PNG, JPG files are allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5 MB');
      return;
    }
    setFile(selected);
    setUploadedUrl(null);
  }

  async function handleUpload() {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append('salarySlip', file);
    try {
      const { data } = await api.post('/api/borrower/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedUrl(data.data.url);
      toast.success('Salary slip uploaded successfully');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  if (checking) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Upload Salary Slip</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload your latest salary slip. Supported: PDF, PNG, JPG (max 5 MB).</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
          <span className="text-green-700 font-medium">Profile & BRE</span>
        </span>
        <span className="flex-1 h-px bg-gray-200" />
        <span className="flex items-center gap-1.5 font-medium text-gray-900">
          <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">2</span>
          Upload
        </span>
        <span className="flex-1 h-px bg-gray-200" />
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">3</span>
          Apply
        </span>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-gray-900">Salary Slip Document</h2>
        </CardHeader>
        <CardBody>
          <div
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              id="salary-slip-input"
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="space-y-1">
                <svg className="w-8 h-8 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB — click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm text-gray-600">Click to select file</p>
                <p className="text-xs text-gray-400">PDF, PNG, JPG up to 5 MB</p>
              </div>
            )}
          </div>

          {uploadedUrl && (
            <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-green-800">Uploaded successfully. You can now apply for a loan.</p>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Button onClick={handleUpload} loading={uploading} disabled={!file}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
            {uploadedUrl && (
              <Button
                variant="secondary"
                onClick={() => router.push(`/borrower/apply?slipUrl=${encodeURIComponent(uploadedUrl)}`)}
              >
                Continue to Apply
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
