import multer from 'multer'
import cloudinary from '~/config/cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Tên thư mục lưu trữ trên Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg']
  }
})

const upload = multer({ storage: storage })

const uploadImage = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    // Nếu tệp tin đã được tải lên thành công, thông tin về tệp sẽ có trong req.file
    if (req.file) {
      console.log('File uploaded:', req.file)
      req.newLogo = req.file.path // Đường dẫn tệp tin
      req.workspaceId = req.body.workspaceId
      next()
    } else {
      return res.status(400).json({ error: 'No file uploaded' })
    }
  })
}
export const uploadController = {
  uploadImage
}
