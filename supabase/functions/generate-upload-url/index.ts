import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/hash/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Contabo S3 Configuration
const S3_ENDPOINT = 'https://usc1.contabostorage.com'
const BUCKET_NAME = 'chilenerosvideos'
const ACCESS_KEY = '9a7502ab125ec9cd8ea93d255d4a3a5d'
const SECRET_KEY = '167cedf5ddbdacf3ee04ceccac7f87dc'
const REGION = 'us-central'

interface RequestBody {
  fileName: string
  fileType: string
  userId: string
}

function generateSignature(stringToSign: string, date: string): string {
  const dateKey = createHmac('sha256', `AWS4${SECRET_KEY}`, date).toString('hex')
  const dateRegionKey = createHmac('sha256', dateKey, REGION).toString('hex')
  const dateRegionServiceKey = createHmac('sha256', dateRegionKey, 's3').toString('hex')
  const signingKey = createHmac('sha256', dateRegionServiceKey, 'aws4_request').toString('hex')
  
  return createHmac('sha256', signingKey, stringToSign).toString('hex')
}

function generatePresignedUrl(method: string, key: string, contentType: string, expires: number = 3600): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  
  const credential = `${ACCESS_KEY}/${date}/${REGION}/s3/aws4_request`
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
  
  const canonicalRequest = [
    method,
    `/${key}`,
    '',
    `host:${BUCKET_NAME}.${S3_ENDPOINT.replace('https://', '')}`,
    `x-amz-content-sha256:UNSIGNED-PAYLOAD`,
    `x-amz-date:${date}T000000Z`,
    '',
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n')
  
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    `${date}T000000Z`,
    `${date}/${REGION}/s3/aws4_request`,
    createHmac('sha256', '', canonicalRequest).toString('hex')
  ].join('\n')
  
  const signature = generateSignature(stringToSign, date)
  
  const queryParams = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': credential,
    'X-Amz-Date': `${date}T000000Z`,
    'X-Amz-Expires': expires.toString(),
    'X-Amz-SignedHeaders': signedHeaders,
    'X-Amz-Signature': signature
  })
  
  return `${S3_ENDPOINT}/${BUCKET_NAME}/${key}?${queryParams.toString()}`
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileName, fileType, userId }: RequestBody = await req.json()
    
    if (!fileName || !fileType || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileName, fileType, userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate unique key for the file
    const fileExt = fileName.split('.').pop()
    const key = `${userId}/${Date.now()}.${fileExt}`
    
    // Generate presigned URL for PUT request
    const uploadUrl = generatePresignedUrl('PUT', key, fileType, 3600) // 1 hour expiry
    
    // Generate public URL for the file
    const publicUrl = `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`
    
    return new Response(
      JSON.stringify({
        uploadUrl,
        publicUrl,
        key
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
