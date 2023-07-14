declare global {
  namespace NodeJS {
    interface ProcessEnv {
      S3_BUCKET_NAME: string
      AWS_ACCESS_KEY_ID: string
      AWS_SECRET_ACCESS_KEY: string
      AWS_REGION: string
    }
  }
}

export { }