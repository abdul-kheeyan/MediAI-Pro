const Product = require('../models/Product');

// @desc Get all products (public) or own products (pharmacy owner)
// @route GET /api/pharmacy/products
exports.getProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };

        if (category && category !== 'All') {
            query.category = category;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).populate('shopOwner', 'name shopName');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get products owned by the logged-in pharmacy
// @route GET /api/pharmacy/my-products
exports.getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ shopOwner: req.user._id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get single product
// @route GET /api/pharmacy/products/:id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('shopOwner', 'name shopName');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Add a new product (pharmacy owner only)
// @route POST /api/pharmacy/products
exports.addProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, prescriptionRequired, manufacturer, expiryDate } = req.body;

        if (!name || !description || !price || !stock) {
            return res.status(400).json({ message: 'Name, description, price and stock are required.' });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category: category || 'OTC',
            stock,
            prescriptionRequired: prescriptionRequired || false,
            manufacturer,
            expiryDate,
            shopOwner: req.user._id,
            isActive: true
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update a product (pharmacy owner only - their own products)
// @route PUT /api/pharmacy/products/:id
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ensure the pharmacy owner can only edit their own products
        if (product.shopOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this product' });
        }

        const { name, description, price, category, stock, prescriptionRequired, manufacturer, expiryDate, isActive } = req.body;

        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.stock = stock ?? product.stock;
        product.prescriptionRequired = prescriptionRequired ?? product.prescriptionRequired;
        product.manufacturer = manufacturer ?? product.manufacturer;
        product.expiryDate = expiryDate ?? product.expiryDate;
        product.isActive = isActive ?? product.isActive;

        const updated = await product.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete a product (pharmacy owner only - their own products)
// @route DELETE /api/pharmacy/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.shopOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Seed Products (Internal/Admin)
exports.seedProducts = async (req, res) => {
    try {
        const products = [
            { name: 'Paracetamol 500mg', description: 'Used for pain relief and fever.', price: 45, category: 'OTC', stock: 100, manufacturer: 'HealthCorp' },
            { name: 'Amoxicillin 250mg', description: 'Antibiotic for bacterial infections.', price: 120, category: 'Clinical', stock: 50, prescriptionRequired: true, manufacturer: 'MediLife' },
            { name: 'Multivitamin Gold', description: 'Daily essential nutrients for vitality.', price: 550, category: 'Supplements', stock: 200, manufacturer: 'NutriBio' },
            { name: 'Digital Thermometer', description: 'High precision digital readings.', price: 299, category: 'Equipment', stock: 30, manufacturer: 'TechMed' }
        ];

        await Product.deleteMany({ shopOwner: null });
        await Product.insertMany(products);
        res.json({ message: 'Products seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
