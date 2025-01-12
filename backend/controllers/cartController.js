import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

const calculateItemPrice = (product, quantity) => {
    return product.price*quantity;
};
const getCart = async (req, res) => {
    const userId = req.params.userId;
    try{
        const cart = await cartModel.findOne({userId: userId});
        if(!cart){
            return res.status(404).json({message: 'No items in cart.'});
        }
        return res.status(200).json(cart);
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const addToCart = async (req, res) => {
    const userId = req.params.userId;
    const cartItem = req.body;
  
    const product = await productModel.findById(cartItem.productId).lean();
    if (!product) {
      return res.status(400).json({message : 'Product not found'})
    }
    product.variants = product.variants.filter(
      variant => variant._id == cartItem.variantId //see
    );

    if (!product.variants.length) {
      return res.status(400).json({message : 'Variant not found'})
    }

    const cart = await cartModel.findOne({ userId: userId });
    const itemPrice = calculateItemPrice(product, cartItem.quantity);
    console.log('itemPrice-------------------------' , itemPrice);
    if (!cart) {
        const newCart = new cartModel({
            userId: userId,
            items: [
            {
                productId: cartItem.productId,
                variant: cartItem.variantId,
                quantity: cartItem.quantity,
                price : itemPrice,
            },
            ],
        });
        await newCart.save();
        return res.status(201).json(newCart);
    }
    else{
        const itemIndex = cart.items.findIndex(item => item.productId == cartItem.productId && cartItem.variantId == item.variant);
        
        if(itemIndex !== -1){
            cart.items[itemIndex].quantity += Number(cartItem.quantity);
        }
        else{
            const itemPrice = calculateItemPrice(product, product.variants[0], cartItem.quantity);
            cart.items.push({
                productId: cartItem.productId,
                variant: cartItem.variantId,
                quantity: cartItem.quantity,
                price : itemPrice,
            });
        }
        await cart.save();
        return res.status(201).json(cart);
    }
  };
  

const updateQuantity = async (req, res) => {
    const userId = req.params.userId;
    const cartItem = req.body;
    try{
        const cart = await cartModel.findOne({userId: userId});
        if(!cart){
            return res.status(404).json({message: 'No items in cart.'});
        }
        const itemIndex = cart.items.findIndex(item =>item.productId == cartItem.productId && cartItem.variantId == item.variant);
        if(itemIndex === -1){
            return res.status(404).json({message: 'Item not found in cart.'});
        }
        const product = await productModel.findById(cartItem.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Find the specific variant
        const variant = product.variants.find(
            v => v._id == cartItem.variantId
        );
        if (!variant) {
            return res.status(404).json({ message: 'Product variant not found.' });
        }
        const totalQuantity = cart.items[itemIndex].quantity + Number(cartItem.quantity);

        if (totalQuantity> variant.stock) {
            return res.status(400).json({
                message: `Only ${variant.stock} items are available for this variant.`,
                availableStock: variant.stock
            });
        }

        cart.items[itemIndex].quantity = totalQuantity;
        cart.items[itemIndex].price = calculateItemPrice(product, totalQuantity);

        await cart.save();
        return res.status(200).json({message: 'Item quantity updated successfully', data: cart});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const removeFromCart = async (req, res) => {
    const userId = req.params.userId;
    const cartItemId = req.params.cartItemId;
    try{
        const cart = await cartModel.findOne({userId: userId});
        if(!cart){
            return res.status(404).json({message: 'No items in cart.'});
        }
        const itemIndex = cart.items.findIndex(item => item._id == cartItemId);
        if(itemIndex === -1){
            return res.status(404).json({message: 'Item not found in cart.'});
        }
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return res.status(200).json({message: 'Item removed from cart successfully', data: cart});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

const clearCart = async (req, res) => {
    const userId = req.params.userId;
    try{
        const cart = await cartModel.findOne({userId: userId});
        if(!cart){
            return res.status(404).json({message: 'No items in cart.'});
        }
        cart.items = [];
        await cart.save();
        return res.status(200).json({message: 'Cart cleared successfully', data: cart});
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
};

export { getCart, addToCart, updateQuantity, removeFromCart, clearCart };
