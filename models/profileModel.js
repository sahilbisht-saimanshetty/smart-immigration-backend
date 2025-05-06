
import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  basicDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
    },
    linkedin: {
      type: String
    }
  },
  generalDetails: {
    purpose: {
      type: String
    },
    fieldOfWork: {
      type: String
    },
    qualifications: {
      selected: {
        type: [String]
      },
      other: {
        type: String
      }
    },
    service: {
      type: String
    },
    visaInfo: {
      visaApplied: {
        type: String
      },
      visaStatus: {
        type: String
      }
    },
    foundUs: {
      type: String
    },
    consent: {
      type: Boolean,
      default: false
    }
  }
});

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;