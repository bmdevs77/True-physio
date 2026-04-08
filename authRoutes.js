const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

function generateToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function normalizePhone(phone) {
  return phone.replace(/\s+/g, "");
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    let { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "كل البيانات مطلوبة" });
    }

    phone = normalizePhone(phone);

    if (!/^01[0-9]{9}$/.test(phone)) {
      return res.status(400).json({ message: "رقم الموبايل غير صحيح" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "كلمة المرور لازم تكون 6 أحرف أو أكثر" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "الرقم مسجل بالفعل" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    let { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "رقم الموبايل وكلمة المرور مطلوبين" });
    }

    phone = normalizePhone(phone);

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "البيانات غير صحيحة" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "البيانات غير صحيحة" });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
});

// PROFILE
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
});

module.exports = router;