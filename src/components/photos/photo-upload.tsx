'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Upload, X, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  projectId: string
  onUploadComplete?: () => void
}

const photoTypes = [
  { value: 'before', label: 'Before' },
  { value: 'during', label: 'During' },
  { value: 'after', label: 'After' },
  { value: 'damage', label: 'Damage' },
  { value: 'material', label: 'Material' },
  { value: 'other', label: 'Other' },
]

export function PhotoUpload({ projectId, onUploadComplete }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [photoType, setPhotoType] = useState('other')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    // Create previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    
    setFiles(prev => [...prev, ...selectedFiles])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('project-photos')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-photos')
          .getPublicUrl(fileName)

        // Save to database
        await supabase
          .from('crm_photos')
          .insert({
            project_id: projectId,
            url: publicUrl,
            photo_type: photoType,
            tags: [photoType],
          })

        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      }

      // Clear files
      previews.forEach(url => URL.revokeObjectURL(url))
      setFiles([])
      setPreviews([])
      
      onUploadComplete?.()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      {files.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Upload Photos</p>
          <p className="text-sm text-muted-foreground">
            Click to select or drag and drop
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Photo Type Selector */}
          <div className="flex gap-2 flex-wrap">
            {photoTypes.map(type => (
              <Button
                key={type.value}
                variant={photoType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhotoType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Preview Grid */}
          <div className="grid grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </CardContent>
              </Card>
            ))}
            
            {/* Add More Button */}
            <Card
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer hover:border-primary/50 transition-colors"
            >
              <CardContent className="flex items-center justify-center aspect-square p-0">
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Add More</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} Photo{files.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                previews.forEach(url => URL.revokeObjectURL(url))
                setFiles([])
                setPreviews([])
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
