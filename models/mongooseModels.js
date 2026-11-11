import mongoose from 'mongoose';

/**
 * User Schema (Teachers, Students, Super-Admins)
 */
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true, index: true },
  username: { type: String, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['TEACHER', 'STUDENT', 'SUPER_ADMIN'], 
    required: true,
    index: true 
  },
  tuitionId: { type: String, index: true },
  tuitionName: { type: String },
  upiId: { type: String, trim: true },
  registrationJoinCode: { type: String, index: true },
  tenants: { type: Array, default: [] },
  enrolledBatches: { type: Array, default: [] },
  feeStatus: { type: String, default: 'PENDING' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

/**
 * Tuition Center Tenant Schema
 */
const TuitionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, index: true },
  joinCode: { type: String, required: true, index: true },
  phone: { type: String, trim: true },
  ownerId: { type: String, index: true },
  upiId: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

/**
 * Batch Schema
 */
const BatchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  tuitionId: { type: String, required: true, index: true },
  teacherId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  subject: { type: String, trim: true },
  joinCode: { type: String, required: true, index: true },
  monthlyFee: { type: Number, default: 0 },
  schedule: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

/**
 * Payment / Receipt Schema
 */
const PaymentSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String },
  batchId: { type: String, required: true, index: true },
  batchName: { type: String },
  amount: { type: Number, required: true },
  feeStatus: { type: String, default: 'PAID' },
  paymentMethod: { type: String, default: 'UPI Bharat-QR / Instant Ledger' },
  verifiedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const TuitionModel = mongoose.models.Tuition || mongoose.model('Tuition', TuitionSchema);
export const BatchModel = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default {
  UserModel,
  TuitionModel,
  BatchModel,
  PaymentModel
};
