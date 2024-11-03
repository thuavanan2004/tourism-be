module.exports.validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

module.exports.validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

module.exports.validatePhoneNumber = (phone) => {
  const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
  return phoneRegex.test(phone);
}