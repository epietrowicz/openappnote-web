const { S3Client } = require('@aws-sdk/client-s3')

export const s3Client = new S3Client({
  region: 'sfo3', // Replace with your region (e.g., 'sfo3' for DigitalOcean or AWS region like 'us-east-1')
  endpoint: 'https://sfo3.digitaloceanspaces.com', // Replace with your region's endpoint for DigitalOcean or omit for AWS
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY, // Replace with your DigitalOcean Spaces access key
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY // Replace with your DigitalOcean Spaces secret key
  }
})

export const bucketName = 'openappnote-bucket'
