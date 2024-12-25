import categoryModel from '../models/categoryModel.js';
const getAllCategory = async (req, res) => {
    try{
    // First get all categories
    let allCategories = [];
    if(req.params.filter === 'Active'){
        allCategories = await categoryModel.find({isActive: true}).lean();
    }
    else{
        allCategories = await categoryModel.find({}).lean();
    }
    
    // Helper function to build tree structure
    const buildTree = (categories) => {
        const categoryMap = new Map();
        categories.forEach(category => {
          const parentId = category.parentCategory?.toString() || null;
          if (!categoryMap.has(parentId)) {
            categoryMap.set(parentId, []);
          }
          categoryMap.get(parentId).push(category);
        });
        console.log(categoryMap);
        // Recursive function to build the tree
        const Tree = (parentId = null) => {
          return (categoryMap.get(parentId) || []).map(cat => ({
            ...cat,
            children: Tree(cat._id.toString())
          }));
        };
      
        return Tree();
      };

      const categoryTree = buildTree(allCategories);
    
    res.json({
        success: true,
        data: categoryTree
      });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }

};

const getCategory = async (req, res) => {
    const categoryId = req.params.id;
    try{
        const category = await categoryModel.findById(categoryId);
        if(!category){
            return res.status(404).json({message: 'Category not found'});
        }
        return res.status(200).json(category);
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};
const addCategory = async (req, res) => {
    const newCategory = await categoryModel(req.body);
    try{
        await newCategory.save();
        return res.status(201).json({message: 'Category added successfully', data: newCategory});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const updateCategory = async (req, res) => {
    const category = await categoryModel.findById(req.params.id);
    if(!category){
        return res.status(404).json({message: 'Category not found'});
    }
    const newCategory = req.body;
    Object.keys(newCategory).forEach((key) => {
        category[key] = newCategory[key];
    });
    try{
        await category.save();
        return res.status(200).json({message: 'Category updated successfully', data: category});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const deleteCategory = async (req, res) => {
    console.log('boom');
    const category = await categoryModel.findById(req.params.id);
    if(!category){
        return res.status(404).json({message: 'Category not found'});
    }
    try{
        console.log('hey');
        await category.deleteOne();
        return res.status(200).json({message: 'Category deleted successfully'});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

export { getAllCategory, getCategory, addCategory, updateCategory, deleteCategory };
