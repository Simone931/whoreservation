exports.formatResponse = (status, code, message, ...data) => {
    return {status, code, message, ...data};
};