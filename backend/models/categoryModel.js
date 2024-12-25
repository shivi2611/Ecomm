import mongoose from 'mongoose';
import { isCategoryValid } from '../utils/validators.js';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Reference to parent category
    image :{type: String},
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.pre('save', async function (next) {
    const { result, message } = await isCategoryValid(this);
    if(!result){
        return next(new Error(message));
    }
    next();
});
categorySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    await deleteDescendants(this._id);
    next();
});
async function deleteDescendants(categoryId) {
    const descendants = await mongoose.model('Category').find({ parentCategory: categoryId });
    if (descendants.length > 0) {
        const descendantIds = descendants.map(descendant => descendant._id);
        await mongoose.model('Category').deleteMany({ _id: { $in: descendantIds } });
        for (const descendantId of descendantIds) {
            await deleteDescendants(descendantId);
        }
    }
}
const categoryModel = mongoose.model('Category', categorySchema);

export default categoryModel;

