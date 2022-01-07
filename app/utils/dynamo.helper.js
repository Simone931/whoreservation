const ddb = require('./ddb');

const generateUpdateQuery = (fields) => {
  let exp = {
    UpdateExpression: 'set',
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };
  Object.entries(fields).forEach(([key, item]) => {
    exp.UpdateExpression += ` #${key} = :${key},`;
    exp.ExpressionAttributeNames[`#${key}`] = key;
    exp.ExpressionAttributeValues[`:${key}`] = item;
  });
  exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
  return exp;
};

exports.batchGetFromDynamo = async (table, query) => {
  const params = {
    RequestItems: {},
  };

  params.RequestItems[table] = {
    Keys: query,
  };

  const result = await ddb.rawClient.batchGetItem(params).promise();

  if (result.Responses) {
    return result.Responses[table];
  }

  return null;
};

exports.getFromDynamo = async (table, query) => {
  const params = {
    Key: query,
    TableName: table,
  };

  const result = await ddb.rawClient.getItem(params).promise();

  if (result && Object.keys(result).length > 0) {
    return result;
  }

  return null;
};

exports.putInDynamo = async (table, data) => {
  const params = {
    Item: data,
    TableName: table,
    ConditionExpression: 'attribute_not_exists(cardcode)',
  };

  return await ddb.rawClient.putItem(params).promise();
};

exports.scanDynamo = async (table, key, value) => {
  const params = {
    TableName: table,
    FilterExpression: `${key} = :value`,
    ExpressionAttributeValues: {
      ':value': value,
    },
  };

  const result = await ddb.rawClient.scan(params).promise();
  if (result.Count > 0) {
    return result.Items;
  }
  return null;
};

exports.deleteRecordFromDynamo = async (table, query) => {
  const params = {
    TableName: table,
    Key: query,
  };
  return await ddb.rawClient.deleteItem(params).promise();
};

exports.updateOneItemDynamo = (table, key, attribute, value) => {
  const params = {
    TableName: table,
    Key: key,
    UpdateExpression: 'set #attribute = :value',
    ExpressionAttributeNames: {
      '#attribute': attribute,
    },
    ExpressionAttributeValues: {
      ':value': value,
    },
  };

  return ddb.rawClient.updateItem(params).promise();
};

exports.updateItemDynamo = (table, key, params) => {
  params = generateUpdateQuery(params);
  params = {
    TableName: table,
    Key: key,
    ...params,
  };
  return ddb.rawClient.updateItem(params).promise();
};

exports.formatDynamoResult = (result) => {

  if (typeof result.Item != 'undefined') {
    result = result.Item;
  }

  let data = {};
  for (const i in result) {

    if (typeof result[i].S != 'undefined') {
      data[i] = result[i].S;
      continue;
    }
    if (typeof result[i].N != 'undefined') {
      data[i] = parseInt(result[i].N);
      continue;
    }
    if (typeof result[i].BOOL != 'undefined') {
      data[i] = result[i].BOOL
      continue;
    }

  }

  return data;

}

exports.multipleScanDynamo = async (table, data) => {
  let exp;
  let vals = {};
  for (const key of Object.keys(data)) {
    if (Object.keys(data)[0] == key) {
      exp = `${key} = :${key}`;
    } else {
      exp += ` AND ${key} = :${key}`;
    }

    vals[':' + key] = { S: '' + data[key] };
  }

  const params = {
    TableName: table,
    FilterExpression: exp,
    ExpressionAttributeValues: vals,
  };
console.log(params)
  const result = await ddb.rawClient.scan(params).promise();

  if (result.Count > 0) {
    return result.Items;
  }

  return null;
};