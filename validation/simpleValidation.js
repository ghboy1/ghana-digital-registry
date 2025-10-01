// Simple validation as backup
function validateBirthRegistration(data) {
  const errors = [];
  
  // Required fields
  if (!data.child_first_name) errors.push('Child first name is required');
  if (!data.child_last_name) errors.push('Child last name is required');
  if (!data.date_of_birth) errors.push('Date of birth is required');
  if (!data.place_of_birth) errors.push('Place of birth is required');
  if (!data.gender) errors.push('Gender is required');
  if (!data.mother_first_name) errors.push('Mother first name is required');
  if (!data.mother_last_name) errors.push('Mother last name is required');
  if (!data.father_first_name) errors.push('Father first name is required');
  if (!data.father_last_name) errors.push('Father last name is required');
  
  // Date validation
  if (data.date_of_birth) {
    const birthDate = new Date(data.date_of_birth);
    const today = new Date();
    if (birthDate > today) errors.push('Birth date cannot be in the future');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateDeathRegistration(data) {
  const errors = [];
  
  // Required fields
  if (!data.deceased_first_name) errors.push('Deceased first name is required');
  if (!data.deceased_last_name) errors.push('Deceased last name is required');
  if (!data.date_of_death) errors.push('Date of death is required');
  if (!data.place_of_death) errors.push('Place of death is required');
  if (!data.gender) errors.push('Gender is required');
  
  // Date validation
  if (data.date_of_death) {
    const deathDate = new Date(data.date_of_death);
    const today = new Date();
    if (deathDate > today) errors.push('Death date cannot be in the future');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateBirthRegistration,
  validateDeathRegistration
};