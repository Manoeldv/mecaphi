import mongoose from 'mongoose';

const pedidoSchema = new mongoose.Schema({
  idPersonalizado: { type: String, required: true },
  data: { type: String, required: true },
  fornecedor: { type: String, default: '' },
  itens: [{
    id: { type: String },
    nome: { type: String },
    oem: { type: String },
    qtdPedida: { type: Number }
  }]
}, { timestamps: true });

export default mongoose.model('Pedido', pedidoSchema);
