import mongoose from 'mongoose';
const { Schema } = mongoose;

export default mongoose.model('traffico', new Schema({ 
	strada: String,
    kilometri: Int32Array,
    data:Date, 
    totale: Int32Array
}));