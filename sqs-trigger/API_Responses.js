const Responses = {
    _200(data = {}) {
        return {
            headers: {
                'Content-Type': 'application/json',
            },
            statusCode: 200,
            body: JSON.stringify(data),
        };
    },

    _400(data = {}) {
        return {
            headers: {
                'Content-Type': 'application/json',
            },
            statusCode: 400,
            body: JSON.stringify(data),
        };
    },
};

module.exports = Responses;
