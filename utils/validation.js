// Ghana-specific validation utilities
const ghanaValidation = {
  // Validate Ghana Card Number (Ghana Card format)
  validateGhanaCard: function(cardNumber) {
    if (!cardNumber) return { isValid: true, message: '' }; // Optional field
    
    // Ghana Card format: GHA-{3 letters}-{4 numbers}-{1 letter}
    const ghanaCardRegex = /^GHA-[A-Z]{3}-\d{4}-[A-Z]$/;
    const isValid = ghanaCardRegex.test(cardNumber);
    
    return {
      isValid,
      message: isValid ? '' : 'Ghana Card must be in format: GHA-XXX-0000-X'
    };
  },

  // Validate Ghana Phone Number
  validatePhone: function(phone) {
    if (!phone) return { isValid: true, message: '' }; // Optional field
    
    // Ghana phone numbers: +233XXXXXXXXX or 0XXXXXXXXX
    const phoneRegex = /^(?:\+233|0)[235]\d{8}$/;
    const isValid = phoneRegex.test(phone.replace(/\s/g, ''));
    
    return {
      isValid,
      message: isValid ? '' : 'Phone must be in format: 0201234567 or +233201234567'
    };
  },

  // Validate Date (not in future)
  validateDateNotFuture: function(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    const isValid = inputDate <= today;
    
    return {
      isValid,
      message: isValid ? '' : 'Date cannot be in the future'
    };
  },

  // Validate Birth Date (reasonable range: not older than 120 years and not in future)
  validateBirthDate: function(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120); // 120 years ago
    
    const isValid = birthDate >= minDate && birthDate <= today;
    
    return {
      isValid,
      message: isValid ? '' : 'Birth date must be within the last 120 years and not in future'
    };
  },

  // Validate Death Date (reasonable range)
  validateDeathDate: function(dateString) {
    const deathDate = new Date(dateString);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 150); // 150 years ago
    
    const isValid = deathDate >= minDate && deathDate <= today;
    
    return {
      isValid,
      message: isValid ? '' : 'Death date must be within reasonable range and not in future'
    };
  },

  // Validate Age at Death
  validateAgeAtDeath: function(age) {
    if (!age) return { isValid: true, message: '' }; // Optional field
    
    const ageNum = parseInt(age);
    const isValid = ageNum >= 0 && ageNum <= 150;
    
    return {
      isValid,
      message: isValid ? '' : 'Age at death must be between 0 and 150 years'
    };
  },

  // Validate Weight at Birth (kg)
  validateBirthWeight: function(weight) {
    if (!weight) return { isValid: true, message: '' }; // Optional field
    
    const weightNum = parseFloat(weight);
    const isValid = weightNum >= 0.5 && weightNum <= 6.0;
    
    return {
      isValid,
      message: isValid ? '' : 'Birth weight must be between 0.5kg and 6.0kg'
    };
  },

  // Validate Ghanaian Name (allows Ghanaian characters and common formats)
  validateName: function(name) {
    if (!name) return { isValid: false, message: 'Name is required' };
    
    // Allows letters, spaces, hyphens, and apostrophes (for names like Kwame, Nkrumah, O'Brien, etc.)
    const nameRegex = /^[A-Za-zÀ-ÿ\s\-']+$/;
    const isValid = nameRegex.test(name) && name.length >= 2 && name.length <= 50;
    
    return {
      isValid,
      message: isValid ? '' : 'Name must contain only letters, spaces, hyphens, or apostrophes (2-50 characters)'
    };
  },

  // Validate Place of Birth/Death (Ghanaian locations)
  validateLocation: function(location) {
    if (!location) return { isValid: false, message: 'Location is required' };
    
    const isValid = location.length >= 3 && location.length <= 100;
    
    return {
      isValid,
      message: isValid ? '' : 'Location must be between 3 and 100 characters'
    };
  },

  // Validate Cause of Death
  validateCauseOfDeath: function(cause) {
    if (!cause) return { isValid: true, message: '' }; // Optional field
    
    const isValid = cause.length >= 3 && cause.length <= 200;
    
    return {
      isValid,
      message: isValid ? '' : 'Cause of death must be between 3 and 200 characters'
    };
  },

  // Validate Occupation
  validateOccupation: function(occupation) {
    if (!occupation) return { isValid: true, message: '' }; // Optional field
    
    const isValid = occupation.length >= 2 && occupation.length <= 50;
    
    return {
      isValid,
      message: isValid ? '' : 'Occupation must be between 2 and 50 characters'
    };
  },

  // Comprehensive birth registration validation
  validateBirthRegistration: function(data) {
    const errors = [];

    // Child information
    const childFirstName = this.validateName(data.child_first_name);
    if (!childFirstName.isValid) errors.push(`Child First Name: ${childFirstName.message}`);
    
    const childLastName = this.validateName(data.child_last_name);
    if (!childLastName.isValid) errors.push(`Child Last Name: ${childLastName.message}`);

    // Birth date
    const birthDate = this.validateBirthDate(data.date_of_birth);
    if (!birthDate.isValid) errors.push(`Date of Birth: ${birthDate.message}`);

    // Place of birth
    const place = this.validateLocation(data.place_of_birth);
    if (!place.isValid) errors.push(`Place of Birth: ${place.message}`);

    // Gender
    if (!['Male', 'Female'].includes(data.gender)) {
      errors.push('Gender must be Male or Female');
    }

    // Parents' information
    const motherFirstName = this.validateName(data.mother_first_name);
    if (!motherFirstName.isValid) errors.push(`Mother's First Name: ${motherFirstName.message}`);
    
    const motherLastName = this.validateName(data.mother_last_name);
    if (!motherLastName.isValid) errors.push(`Mother's Last Name: ${motherLastName.message}`);

    const fatherFirstName = this.validateName(data.father_first_name);
    if (!fatherFirstName.isValid) errors.push(`Father's First Name: ${fatherFirstName.message}`);
    
    const fatherLastName = this.validateName(data.father_last_name);
    if (!fatherLastName.isValid) errors.push(`Father's Last Name: ${fatherLastName.message}`);

    // Ghana Card validation
    if (data.mother_national_id) {
      const motherCard = this.validateGhanaCard(data.mother_national_id);
      if (!motherCard.isValid) errors.push(`Mother's Ghana Card: ${motherCard.message}`);
    }

    if (data.father_national_id) {
      const fatherCard = this.validateGhanaCard(data.father_national_id);
      if (!fatherCard.isValid) errors.push(`Father's Ghana Card: ${fatherCard.message}`);
    }

    // Phone validation
    if (data.informant_contact) {
      const phone = this.validatePhone(data.informant_contact);
      if (!phone.isValid) errors.push(`Contact Phone: ${phone.message}`);
    }

    // Weight validation
    if (data.weight_kg) {
      const weight = this.validateBirthWeight(data.weight_kg);
      if (!weight.isValid) errors.push(`Birth Weight: ${weight.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Comprehensive death registration validation
  validateDeathRegistration: function(data) {
    const errors = [];

    // Deceased information
    const deceasedFirstName = this.validateName(data.deceased_first_name);
    if (!deceasedFirstName.isValid) errors.push(`Deceased First Name: ${deceasedFirstName.message}`);
    
    const deceasedLastName = this.validateName(data.deceased_last_name);
    if (!deceasedLastName.isValid) errors.push(`Deceased Last Name: ${deceasedLastName.message}`);

    // Death date
    const deathDate = this.validateDeathDate(data.date_of_death);
    if (!deathDate.isValid) errors.push(`Date of Death: ${deathDate.message}`);

    // Place of death
    const place = this.validateLocation(data.place_of_death);
    if (!place.isValid) errors.push(`Place of Death: ${place.message}`);

    // Gender
    if (!['Male', 'Female'].includes(data.gender)) {
      errors.push('Gender must be Male or Female');
    }

    // Age at death
    if (data.age_at_death) {
      const age = this.validateAgeAtDeath(data.age_at_death);
      if (!age.isValid) errors.push(`Age at Death: ${age.message}`);
    }

    // Cause of death
    if (data.cause_of_death) {
      const cause = this.validateCauseOfDeath(data.cause_of_death);
      if (!cause.isValid) errors.push(`Cause of Death: ${cause.message}`);
    }

    // Occupation
    if (data.occupation) {
      const occupation = this.validateOccupation(data.occupation);
      if (!occupation.isValid) errors.push(`Occupation: ${occupation.message}`);
    }

    // Phone validation
    if (data.informant_contact) {
      const phone = this.validatePhone(data.informant_contact);
      if (!phone.isValid) errors.push(`Contact Phone: ${phone.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Export the object
module.exports = ghanaValidation;