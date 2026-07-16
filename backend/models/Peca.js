import mongoose from 'mongoose';

const pecaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  oem: { type: String, default: '-' },
  qtd: { type: Number, required: true, default: 0 },
  preco: { type: Number, required: true, default: 0 },
  local: { type: String, default: 'Não definido' },
  status: { type: String, default: 'Em estoque' },
  categoria: { type: String, default: 'Não categorizado' },
  condicao: { type: String, default: 'Usada (Bom Estado)' },
  foto: { type: String, default: null }, // Base64 or URL
  veiculoId: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Peca', pecaSchema);
