import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Caminhos para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do armazenamento
const storage = multer.memoryStorage();

// Filtro de arquivo para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png)'));
};

// Configuração do upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter: fileFilter
});

// Middleware de tratamento de erros
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erros do multer
    return res.status(400).json({ 
      success: false, 
      error: `Erro no upload: ${err.message}` 
    });
  } else if (err) {
    // Outros erros
    return res.status(400).json({ 
      success: false, 
      error: err.message || 'Erro ao processar o upload da imagem' 
    });
  }
  next();
};

export { upload, handleUploadErrors };
