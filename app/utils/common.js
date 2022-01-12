const { default: axios } = require('axios');
const { getFromDynamo, formatDynamoResult, scanAll } = require("../utils/dynamo.helper");

export function formatResponse(status, code, message, ...data) {
    return { status, code, message, ...data };
};

export async function getSmsData(type) {
    let uri = process.env.ADMIN_URI;

    let res = await axios({
        method: 'GET',
        url: uri + 'getSmsData',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    let data = { name: res.data.name, text: res.data[type] };

    return data;
};

export async function getReservationData(id) {
    let reservation = await getFromDynamo('reservations', { id: { S: id } });
    if (reservation) {
        let data = formatDynamoResult(reservation);
        return data;
    } else {
        return false;
    }
}

export async function getAllReservationData() {
    let reservations = await scanAll('reservations');
    if (reservations) {
        let data = formatDynamoResult(reservations, true);
        return data;
    } else {
        return false;
    }
}

export async function sms(phone, name, text, data) {
    try {

        // Process text
        let date = (data.date).split("-").reverse().join("/");
        text = text.replace('[[HOUR]]', data.hour);
        text = text.replace('[[DATE]]', date);
        text = text.replace('[[LOCATION]]', data.location);
        text = text.replace('[[NAME]]', (data.fullname).split(' ')[0]);
        text = text.replace('[[SURNAME]]', (data.fullname).split(' ')[1]);

        let method = 'POST';
        let url = process.env.SMS_URI
        let headers = {
            'Authorization': 'App ' + process.env.SMS_KEY,
            'Content-Type': 'application/json'
        };
        let payload = {
            messages: [
                {
                    from: name,
                    destinations: [
                        { to: '39' + phone }
                    ],
                    text: text
                }
            ]
        }
        payload = JSON.stringify(payload);
        return true;
        let res = await axios({
            method,
            url: url + '/sms/2/text/advanced',
            data: payload,
            headers,
        });

        return res.data;
    } catch (e) {
        console.log('RESPONSE', e.response.data)
        console.log('MESSAGE', e.message)
        return false;
    }
}

export async function clear() {
    // let result = scanDynamo('reservations', 'done', { S: '1' })
}