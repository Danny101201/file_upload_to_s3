import express, { Request, Response } from 'express'
import multer, { MulterError } from 'multer'
import cors from 'cors'
import 'dotenv/config'
import { s3UploadVersion2, s3UploadMutiVersion2, s3GetFile } from './s3Service'

const app = express()
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname + '-' + Date.now())
//   }
// })
app.use(express.json())
app.use(cors())

const storage = multer.memoryStorage()
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10000000, files: 2 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      // cb(new Error('please upload image file'))
      cb(new MulterError("LIMIT_UNEXPECTED_FILE"))
      return
    }
    cb(null, true)
  },
  storage
})
app.get('/', (req, res) => {
  return res.json('filer loader api')
})
app.post('/upload/single', upload.single('image'), async (req, res) => {
  const result = await s3UploadVersion2(req.file!)

  res.json({ status: 'Success', result, body: req.body })
})
// 接收 form 欄位名叫 image 最多接收 12個檔案
app.post('/upload/array', upload.array('image', 12), async (req, res) => {
  try {

    const results = await s3UploadMutiVersion2(req.files as Express.Multer.File[])
    res.json({ status: 'Success', buffer: req.file, results })
  } catch (e) {
    console.log(e)
  }
})
// 接收 form 欄位名叫 avatar跟gallery ，分別接收最多 1 個跟 8 個檔案
app.post('/upload/fields', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]), (req, res) => {
  if (!Object.keys(req?.files as {}).length) {
    return res.status(400).json({ message: "please upload avatar || gallery in form data" })
  }
  res.json({ status: 'Success' })
})
app.get('/profile', async (req, res) => {
  try {

    const { name } = req.query as { name: string }
    const result = await s3GetFile(name)
    res.json({ status: 'Success', result })
  } catch (e) {
    console.log(e)
  }
})


app.use((err, req: Request, res: Response) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'file is to large'
      })
    }
    if (err.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({
        message: 'limit field count'
      })
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'file must be image'
      })
    }
  }
})


app.listen(4000, () => {
  console.log('server run on port: 4000')
})

