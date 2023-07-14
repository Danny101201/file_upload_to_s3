import { Upload } from "@aws-sdk/lib-storage";
import { GetObjectCommand, PutObjectCommandInput, S3 } from "@aws-sdk/client-s3";
import { uuid } from 'uuidv4';
import { error } from "console";
const s3 = new S3({})
export const s3UploadVersion2 = async (file: Express.Multer.File) => {
  console.log(`upload/${uuid()}-${file.originalname}`)
  const params: PutObjectCommandInput = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `upload/${uuid()}-${file.originalname}`,
    // buffer object
    Body: file.buffer
  }
  return await new Upload({
    client: s3,
    params
  }).done();
}

export const s3UploadMutiVersion2 = async (files: Express.Multer.File[]) => {

  const params = files.map(file => ({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `upload/${uuid()}-${file.originalname}`,
    // buffer object
    Body: file.buffer
  })) as PutObjectCommandInput[]
  const results = await Promise.all(params.map(param => new Upload({
    client: s3,
    params: param
  }).done()))
  return results
}
export const s3GetFile = async (name: string) => {
  try {

    const resultCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: name
    })
    const response = await s3.send(resultCommand)
    console.log(response)
    return response.Body?.transformToString()
  } catch (e) {
    console.log(e)
  }
}