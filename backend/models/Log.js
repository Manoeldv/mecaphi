import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true
  },
  acao: {
    type: String,
    required: true
  },
  detalhes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Log = mongoose.model('Log', logSchema);

export default Log;
