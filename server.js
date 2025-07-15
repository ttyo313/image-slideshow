const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 📌 Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 📌 MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB 연결 성공'))
.catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 📌 이미지 모델 정의
const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  uploadedAt: { type: Date, default: Date.now }
});
const Image = mongoose.model('Image', imageSchema);

// 📌 미들웨어 설정
const upload = multer();
app.use(express.static('public'));
app.use(express.json());

// 📌 이미지 업로드 → Cloudinary + MongoDB 저장
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'slides' },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // DB에 저장
    const newImage = new Image({
      url: result.secure_url,
      public_id: result.public_id
    });
    await newImage.save();

    res.send('✅ 이미지 업로드 성공! <a href="/">돌아가기</a>');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ 업로드 실패');
  }
});

// 📌 이미지 목록 요청 → DB에서 가져옴
app.get('/images/list', async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadedAt: 1 });
    res.json(images);
  } catch (err) {
    res.status(500).send('❌ 이미지 목록 불러오기 실패');
  }
});

// 📌 이미지 삭제 → Cloudinary + DB 삭제
app.delete('/delete/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).send('이미지를 찾을 수 없습니다');

    // Cloudinary 삭제
    await cloudinary.uploader.destroy(image.public_id);

    // MongoDB 삭제
    await image.deleteOne();

    res.send('🗑️ 이미지 삭제 완료');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ 이미지 삭제 실패');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
