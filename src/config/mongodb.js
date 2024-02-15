

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'
// Khởi tạo một đối tượng trelloDatabaseInstance ban đầu là null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null

// KHởi tạo một đối tượng mongoClientInstance để connect tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Lưu ý: serverApi có từ phiên bản MongoDB 5.0.0 trở lên, có thể không cần dùng nó, còn nếu dùng nó chúng ta sẽ chỉ định một cái Stable API Version của MongoDB
  // Đọc thêm ở  http://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

//Kết nối tới Database
export const CONECT_DB = async () => {
  // Kết nối tơi một MongoDB Atlas với URI đã khai báo trong thân mongoClientInstance
  await mongoClientInstance.connect()
  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến  trelloDatasbaseInstance ở trên của chúng ta
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)

}
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Musr connect to Database first!')
  return trelloDatabaseInstance
}
// Đóng kết nói mongoDB
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}
