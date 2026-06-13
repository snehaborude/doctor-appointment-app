/**
 * Helper to retrieve the correct avatar URL.
 * If the user has uploaded a custom avatar, it returns that.
 * Otherwise, it constructs the dynamic ImageKit URL mapping for the specific specialization
 * using the exact files uploaded to the /doctorpatient/ folder on your account.
 */
export const getAvatarUrl = (avatar, specialization, role) => {
  if (avatar) return avatar;

  const endpoint = 'https://ik.imagekit.io/nvuw0cip5/doctorpatient';

  if (role === 'doctor' || specialization) {
    const mapping = {
      'General Physician': 'physian.webp',
      'Cardiology': 'cardiology1.avif',
      'Dermatology': 'dermatologist.jpg',
      'Pediatrics': 'peditrics.avif',
      'Neurology': 'neurologist.avif',
      'Orthopedics': 'orthopedics.webp',
    };
    
    // Fallback normalization logic in case of spelling differences
    const normalizedSpec = specialization || '';
    if (normalizedSpec.toLowerCase().includes('dermatology')) {
      return `${endpoint}/dermatologist.jpg`;
    }
    if (normalizedSpec.toLowerCase().includes('neurology')) {
      return `${endpoint}/neurologist.avif`;
    }
    if (normalizedSpec.toLowerCase().includes('physician')) {
      return `${endpoint}/physian.webp`;
    }
    if (normalizedSpec.toLowerCase().includes('cardio')) {
      return `${endpoint}/cardiology1.avif`;
    }
    if (normalizedSpec.toLowerCase().includes('pediatric')) {
      return `${endpoint}/peditrics.avif`;
    }
    if (normalizedSpec.toLowerCase().includes('ortho')) {
      return `${endpoint}/orthopedics.webp`;
    }

    const filename = mapping[specialization] || 'doctor.webp';
    return `${endpoint}/${filename}`;
  }

  // Fallback for patients and other generic roles
  return `${endpoint}/doctor.webp`;
};
