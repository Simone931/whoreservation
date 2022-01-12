const { formatResponse, getSmsData, sms, getReservationData } = require("../utils/common");
const { updateOneItemDynamo, putInDynamo } = require("../utils/dynamo.helper");
const { v4: uuidv4 } = require('uuid');

const sendSms = (fastifyInstance) => {
    fastifyInstance.post('/send-sms', async (req, res) => {

        // Get structure
        let data = req.body;
        let result = formatResponse(200, 'OK', 'OK');
        const allowed = ['reservation', 'review', 'today'];

        if (
            data.phone &&
            data.type &&
            data.id
        ) {
            if (allowed.includes(data.type) && /^\d{10}$/.test(data.phone)) {
                let smsData = await getSmsData(data.type)
                let resData = await getReservationData(data.id)

                if (resData.phone == data.phone) {

                    let response = await sms(data.phone, smsData.name, smsData.text, resData);
                    if (!response) {
                        result = formatResponse(500, 'ERRORSMS', 'There\'s been a problem with SMS')
                    }
                } else {
                    result = formatResponse(400, 'INVALIDPHONE', 'Phone number does not coincide with the reservation')
                }
            } else {
                result = formatResponse(400, 'INVALID', 'Invalid data');
            }
        }

        res.status(result.status).send({
            code: result.code,
            message: result.message
        });
    });
};

module.exports = {
    sendSms
};


