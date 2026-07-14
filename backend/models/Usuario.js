import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['boss', 'balcao'],
    default: 'balcao'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastLogout: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
