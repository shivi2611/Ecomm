function isNameValid(name) {
    const nameRegex = /^[a-zA-Z ]{2,30}$/;
    return nameRegex.test(name);
};
function isMailIdValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

function isPhoneValid(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    for(let num of phone){
        if(num.length !=10 || !phoneRegex.test(num)){
            return false;
        } 
    }
    return true;
};

function isDateOfBirthValid(dateOfBirth) {
    return dateOfBirth <= new Date();
};

// Validate password (at least 8 characters, including uppercase, lowercase, digits, and special characters)
function isPasswordValid(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};


export { isMailIdValid, isPhoneValid, isDateOfBirthValid, isPasswordValid, isNameValid };