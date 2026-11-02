import mongoose from 'mongoose';

export const ROLES = ['user', 'admin'];

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        // select: false -> nunca sale en consultas salvo que se pida explícitamente.
        passwordHash: { type: String, required: true, select: false },
        role: { type: String, enum: ROLES, default: 'user' },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                delete ret.passwordHash;
                return ret;
            },
        },
    },
);

export const User = mongoose.model('User', userSchema);
