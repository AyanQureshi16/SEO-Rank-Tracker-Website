import mongoose from 'mongoose';

const rankEntrySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    ranking: { type: Number, default: null },
    position: { type: Number, default: null },
    page: { type: Number, default: null },
    title: { type: String, default: '' },
    snippet: { type: String, default: '' },
}, { _id: false });


const competitorSchema = new mongoose.Schema({
    position: { type: Number, default: null },
    domain: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    title: { type: String, default: '' },
    snippet: { type: String, default: '' },
} ,{ _id: false })

const keywordTrackingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    keyword: { type: String, required: true, trinm: true, lowercase: true },
    url: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    currenranking: { type: Number, default: null },
    currentposition: { type: Number, default: null },
    bestposition: { type: Number, default: null },
    positionchange: { type: Number, default: 0 },
    rankHistory: [rankEntrySchema],
    competitors: [competitorSchema],
    active: { type: Boolean, default: true },
    lastChecked: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'checking', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });


keywordTrackingSchema.index({ userId: 1, keyword: 1, domain: 1 }, { unique: true });

const KeywordTracking = mongoose.model('KeywordTracking', keywordTrackingSchema);

export default KeywordTracking;