import { supabase } from '@/integrations/supabase/client'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export const uploadToContabo = async (
  file: File, 
  userId: string
): Promise<UploadResult> => {
  try {
    // Get presigned URL from Edge Function
    const { data: presignedData, error: presignedError } = await supabase.functions.invoke(
      'generate-upload-url',
      {
        body: {
          fileName: file.name,
          fileType: file.type,
          userId: userId
        }
      }
    )

    if (presignedError || !presignedData) {
      console.error('Error getting presigned URL:', presignedError)
      return {
        success: false,
        error: 'No se pudo generar la URL de subida'
      }
    }

    const { uploadUrl, publicUrl } = presignedData

    // Upload file directly to Contabo using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      }
    })

    if (!uploadResponse.ok) {
      console.error('Upload failed:', uploadResponse.status, uploadResponse.statusText)
      return {
        success: false,
        error: 'Error al subir el archivo'
      }
    }

    return {
      success: true,
      url: publicUrl
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'Error inesperado durante la subida'
    }
  }
}

export const uploadMultipleToContabo = async (
  files: File[], 
  userId: string
): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToContabo(file, userId))
  const results = await Promise.all(uploadPromises)
  
  const successfulUploads = results
    .filter(result => result.success && result.url)
    .map(result => result.url!)
  
  if (successfulUploads.length !== files.length) {
    console.warn(`Only ${successfulUploads.length}/${files.length} files uploaded successfully`)
  }
  
  return successfulUploads
}
