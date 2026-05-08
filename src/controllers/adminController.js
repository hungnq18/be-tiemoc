const { categoryService, menuItemService, buffetService, shopConfigService } = require('../services/contentService');

// ── Categories ──────────────────────────────────────────────────────────────
exports.createCategory = async (req, res, next) => {
  try {
    const data = await categoryService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const data = await categoryService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.delete(req.params.id);
    res.json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (err) { next(err); }
};

// ── Menu Items ──────────────────────────────────────────────────────────────
exports.createMenuItem = async (req, res, next) => {
  try {
    const data = await menuItemService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    const data = await menuItemService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    await menuItemService.delete(req.params.id);
    res.json({ success: true, message: 'Xóa món ăn thành công' });
  } catch (err) { next(err); }
};

exports.reorderMenuItems = async (req, res, next) => {
  try {
    await menuItemService.reorder(req.body.orderedIds);
    res.json({ success: true, message: 'Sắp xếp thành công' });
  } catch (err) { next(err); }
};

// ── Buffet & Config ──────────────────────────────────────────────────────────
exports.updateBuffet = async (req, res, next) => {
  try {
    const data = await buffetService.update(req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.updateShopConfig = async (req, res, next) => {
  try {
    const data = await shopConfigService.update(req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
