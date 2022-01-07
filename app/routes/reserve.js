const { formatResponse } = require("../utils/common");
const { putInDynamo, getFromDynamo, formatDynamoResult, multipleScanDynamo } = require("../utils/dynamo.helper");
const { v4: uuidv4 } = require('uuid');

const reserve = (fastifyInstance) => {
  fastifyInstance.post('/reserve', async (req, res) => {

    // Get structure
    let data = req.body;
    let check = await verify(data);
    let result = formatResponse(500, 'JSONERROR', 'JSON Structure not accepted.');
    let id = null;

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
      let reservation = await getFromDynamo('reservations', { id: { S: id } });

      if (reservation) {
        let data = formatDynamoResult(reservation);
        result.data = data;
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

  // Check if phone is correct
  if(!/^\d{10}$/.test(data.phone)){
    return formatResponse(400, 'DATAERROR_PHONE', 'Phone not valid');
  }

  // Check if mail is correct
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)){
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
  get
};
