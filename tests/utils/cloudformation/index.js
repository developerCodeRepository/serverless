const AWS = require('aws-sdk');
const _ = require('lodash');
const region = require('../misc').testRegion;

function findStacks(name, status) {
  const CF = new AWS.CloudFormation({ region });

  const params = {};
  if (status) {
    params.StackStatusFilter = status;
  }

  function recursiveFind(found, token) {
    if (token) params.NextToken = token;
    return CF.listStacks(params).promise().then(result => {
      const matches = result.StackSummaries.filter(stack => stack.StackName.match(name));
      if (matches.length) {
        _.merge(found, matches);
      }
      if (result.NextToken) return recursiveFind(found, result.NextToken);
      return found;
    });
  }

  return recursiveFind([]);
}

function deleteStack(stack) {
  const CF = new AWS.CloudFormation({ region });

  const params = {
    StackName: stack,
  };

  return CF.deleteStack(params).promise();
}

function listStackResources(stack) {
  const CF = new AWS.CloudFormation({ region });

  const params = {
    StackName: stack,
  };

  function recursiveFind(resources, token) {
    if (token) params.NextToken = token;
    return CF.listStackResources(params).promise().then(result => {
      _.merge(resources, result.StackResourceSummaries);
      if (result.NextToken) return recursiveFind(resources, result.NextToken);
      return resources;
    });
  }

  return recursiveFind([]);
}

function listStacks(status) {
  const CF = new AWS.CloudFormation({ region });

  const params = {};
  if (status) {
    params.StackStatusFilter = status;
  }

  return CF.listStacks(params).promise();
}

module.exports = {
  findStacks,
  deleteStack,
  listStackResources,
  listStacks,
};
