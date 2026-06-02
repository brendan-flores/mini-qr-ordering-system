import { listProducts } from "../services/products.service.js";

export async function getProducts(req, res, next) {
  try {
    const products = await listProducts();
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
}

