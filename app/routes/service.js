const { formatResponse } = require("../utils/common");
const { updateOneItemDynamo, putInDynamo } = require("../utils/dynamo.helper");
const { v4: uuidv4 } = require('uuid');

const service = (fastifyInstance) => {
    fastifyInstance.post('/service-action', async (req, res) => {

        // Get structure
        let data = req.body;
        let result = formatResponse(200, 'OK', 'OK');
        let id = data.id ? data.id : null;
        const allowed = ['paid', 'done'];

        if (
            data.id &&
            data.action &&
            typeof data.value != 'undefined'
        ) {
            if (allowed.includes(data.action)) {

                // Edit value
                await updateOneItemDynamo('reservations', { id: { S: id } }, data.action, { S: data.value });

                switch (data.action) {
                    case 'paid':
                        break;
                    case 'done':
                        break;
                }
            } else {
                result = formatResponse(400, 'NOTVALID', 'One or more fields are not valid');
            }
        } else {
            result = formatResponse(400, 'DATAMISSING', 'One or more fields are empty');
        }

        res.status(result.status).send({
            code: result.code,
            message: result.message,
            reservationid: id
        });
    });
};

module.exports = {
    service
};
