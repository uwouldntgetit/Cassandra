import mongoose from 'mongoose';
const { Schema } = mongoose;

export default mongoose.model('traffico', new Schema({ 
	area: String,
    data: Date, 
    totale: Number
}));