import mongoose from 'mongoose';

const vendaSchema = new mongoose.Schema({
  data: { type: String, required: true }, // ISO String like '2026-07-13T...'
  itens: [{
    id: { type: String },
    nome: { type: String },
    qtd: { type: Number },
    preco: { type: Number },
    subtotal: { type: Number }
  }],
  total: { type: Number, required: true },
  desconto: { type: Number, default: 0 },
  metodo: { type: String, default: 'Dinheiro' },
  cliente: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Venda', vendaSchema);
