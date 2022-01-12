const { formatResponse, sms, getSmsData, getReservationData, getAllReservationData } = require("../utils/common");
const { putInDynamo, getFromDynamo, formatDynamoResult, multipleScanDynamo, updateItemDynamo } = require("../utils/dynamo.helper");
const { v4: uuidv4 } = require('uuid');

const reserve = (fastifyInstance) => {
  fastifyInstance.post('/reserve', async (req, res) => {

    // Get structure
    let data = req.body;
    let check = await verify(data);
    let result = formatResponse(500, 'JSONERROR', 'JSON Structure not accepted.');
    let id = null;
    let phone = data.phone;

    if (check.code == 'OK') {

      id = uuidv4();

      // Format data
      data = {
        id: { S: id },
        fullname: { S: data.fullname },
        date: { S: data.date },
        hour: { S: data.hour },
        location: { S: data.location },
        email: { S: data.email },
        phone: { S: data.phone },
        paid: { S: '0' },
        done: { S: '0' }
      };

      // Insert in Dynamo
      await putInDynamo('reservations', data);
      let formatData = formatDynamoResult(data);

      // Send SMS
      let smsData = await getSmsData('reservation');
      let response = await sms(phone, smsData.name, smsData.text, formatData);

      if (!response) {
        result = formatResponse(500, 'ERRORSMS', 'There\'s been a problem with SMS')
      }
    }

    result = check;

    res.status(result.status).send({
      code: result.code,
      message: result.message,
      reservationid: id
    });

  });
};

const update = (fastifyInstance) => {
  fastifyInstance.post('/update-reservation', async (req, res) => {

    // Get structure
    let data = req.body;
    let params = data.data;
    const id = data.id || null;
    const allowed = ['fullname', 'date', 'hour', 'location'];
    let result = formatResponse(200, 'OK', 'OK');

    if (id) {
      let check = await getFromDynamo('reservations', { id: { S: id } });
      if (check) {

        let objUpdate = {};
        for (const key in params) {
          if (allowed.includes(key)) {
            objUpdate[key] = { S: params[key] };
          }
        }

        await updateItemDynamo('reservations',
          { id: { S: id } },
          objUpdate
        );

        // Send update SMS
        let formatData = formatDynamoResult(check);
        let smsData = await getSmsData('update');
        let response = await sms(formatData.phone, smsData.name, smsData.text, formatData);

        if (!response) {
          result = formatResponse(500, 'ERRORSMS', 'There\'s been a problem with SMS')
        }

      } else {
        result = formatResponse(404, 'NOTFOUND', 'Reservation not found');
      }
    } else {
      result = formatResponse(400, 'MISSINGID', 'ID Field is required');
    }

    res.status(result.status).send({
      code: result.code,
      message: result.message,
      reservationid: id,
    });

  });
};

const get = (fastifyInstance) => {
  fastifyInstance.get('/get-reservation', async (req, res) => {

    // Get ID
    const id = req.query.id;
    let result = formatResponse(200, 'OK', 'OK');
    result.data = {};

    if (id) {

      // Get reservation
      let reservation = await getReservationData(id);

      if (reservation) {
        result.data = reservation;
      } else {
        result = formatResponse(404, 'NOTFOUND', 'Reservation not found');
      }
    } else {
      result = formatResponse(400, 'IDEMPTY', 'ID field empty');
    }

    res.status(result.status).send({
      code: result.code,
      message: result.message,
      reservationid: id,
      data: result.data
    });

  });
};

const all = (fastifyInstance) => {
  fastifyInstance.get('/get-all', async (req, res) => {

    let result = formatResponse(200, 'OK', 'OK');

    // Get reservations
    let reservations = await getAllReservationData();

    res.status(result.status).send({
      code: result.code,
      message: result.message,
      data: reservations
    });

  });
};

const verify = async (data) => {

  // Check if all required data exists
  if (
    !data.fullname ||
    !data.date ||
    !data.hour ||
    !data.location ||
    !data.email ||
    !data.phone
  ) {
    return formatResponse(400, 'DATAMISSING', 'One or more fields are empty');
  }

  // Check if date is future
  const today = new Date();
  const date = new Date(data.date);
  if (date < today) {
    return formatResponse(400, 'DATAERROR_DATE', 'Date cannot be in the past');
  }

  // Check if phone is correct
  if (!/^\d{10}$/.test(data.phone)) {
    return formatResponse(400, 'DATAERROR_PHONE', 'Phone not valid');
  }

  // Check if mail is correct
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    return formatResponse(400, 'DATAERROR_EMAIL', 'Email not valid');
  }

  // Check if phone or email already present
  let what = 'phone';
  let batch = await multipleScanDynamo('reservations', {
    phone: data.phone,
    done: 0
  });
  if (!batch || !batch.length) {
    what = 'email';
    batch = await multipleScanDynamo('reservations', {
      email: data.email,
      done: 0
    });
  }
  if (batch && batch.length) {
    return formatResponse(200, 'ALREADYEXISTS', 'Reservation for this ' + what + ' already exists');
  }

  return formatResponse(200, 'OK', 'OK');
}

module.exports = {
  reserve,
  get,
  update,
  all
};
