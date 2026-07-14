import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema({
  placa: { type: String, required: true },
  chassi: { type: String, default: '' },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  ano: { type: String, default: '' },
  cor: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Veiculo', veiculoSchema);
