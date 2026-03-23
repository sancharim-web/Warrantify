import { useState, useRef } from 'react'

export interface AttachmentFile {
  id: string
  name: string
  size: string
  type: 'image' | 'document'
  dataUrl: string
}

interface AttachmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAttach: (files: AttachmentFile[]) => void
  existingFiles?: AttachmentFile[]
}

export function AttachmentModal({ open, onOpenChange, onAttach, existingFiles = [] }: AttachmentModalProps) {
  const [files, setFiles] = useState<AttachmentFile[]>(existingFiles)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function getFileType(file: File): 'image' | 'document' {
    return file.type.startsWith('image/') ? 'image' : 'document'
  }

  function addFiles(fileList: FileList) {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const attachment: AttachmentFile = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          size: formatSize(file.size),
          type: getFileType(file),
          dataUrl: reader.result as string,
        }
        setFiles((prev) => [...prev, attachment])
      }
      reader.readAsDataURL(file)
    })
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  function handleAttach() {
    onAttach(files)
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[rgba(244,244,244,0.05)] backdrop-blur-[10px]"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative bg-white rounded-[20px] w-[520px] max-h-[90vh] overflow-y-auto p-[24px] shadow-[0px_4px_31.8px_0px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col gap-[24px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[24px] text-black tracking-[-0.48px]">Attachments</p>
            <button
              onClick={() => onOpenChange(false)}
              className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center hover:bg-inner transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="#706478" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[12px] flex flex-col items-center gap-[12px] py-[40px] px-[24px] transition-colors ${
              dragOver ? 'border-btn-primary bg-btn-primary/5' : 'border-[#d4d0ca]'
            }`}
          >
            <div className="w-[48px] h-[48px] rounded-full bg-inner flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#706478" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 16.5V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16.5" stroke="#706478" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex flex-col items-center gap-[4px]">
              <p className="font-medium text-[16px] text-text-body tracking-[-0.32px]">
                Drag and drop files here
              </p>
              <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
                or click below to browse
              </p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-inner px-[16px] py-[8px] rounded-[8px] text-[13px] font-medium text-text-body tracking-[-0.26px] hover:opacity-80 transition-opacity"
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">
              Supports: JPEG, PNG, PDF, DOC (max 10MB)
            </p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
                {files.length} {files.length === 1 ? 'file' : 'files'} attached
              </p>
              {files.map((f) => (
                <div
                  key={f.id}
                  className="bg-inner rounded-[8px] px-[12px] py-[10px] flex items-center gap-[10px]"
                >
                  {f.type === 'image' ? (
                    <img src={f.dataUrl} alt="" className="w-[32px] h-[32px] rounded-[6px] object-cover shrink-0" />
                  ) : (
                    <div className="w-[32px] h-[32px] rounded-[6px] bg-panel flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2H9L12 5V14H4V2Z" stroke="#706478" strokeWidth="1.2" strokeLinejoin="round"/>
                        <path d="M9 2V5H12" stroke="#706478" strokeWidth="1.2" strokeLinejoin="round"/>
                        <path d="M6 8H10M6 10.5H10" stroke="#706478" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="font-medium text-[13px] text-text-body tracking-[-0.26px] truncate">{f.name}</p>
                    <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">{f.size}</p>
                  </div>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center hover:bg-panel transition-colors shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3L9 9M9 3L3 9" stroke="#706478" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-[12px]">
            <button
              type="button"
              onClick={() => { setFiles([]); onOpenChange(false) }}
              className="p-[12px] rounded-[12px] text-text-muted text-[16px] font-medium tracking-[-0.32px] hover:opacity-80"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAttach}
              disabled={files.length === 0}
              className="bg-btn-primary px-[16px] py-[12px] rounded-[12px] text-white text-[16px] font-medium tracking-[-0.32px] hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Attach {files.length > 0 ? `(${files.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
