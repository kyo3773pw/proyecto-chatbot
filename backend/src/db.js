import mongoose from 'mongoose';

export async function connectDb(uri) {
    if (!uri) throw new Error('Falta la URI de MongoDB');
    await mongoose.connect(uri);
}

export async function disconnectDb() {
    await mongoose.disconnect();
}
