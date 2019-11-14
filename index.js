var AWS = require('aws-sdk');
var request = require('request');
var moment = require('moment');

// EC2 Instance Check
function ec2_status() {
  const ec2 = new AWS.EC2({ region: 'ap-northeast-1' });
  var attachments = [];

  ec2.describeInstances({}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return false;
    }
    else {
      data.Reservations.forEach((key, value) => {
        for (const instance of key.Instances) {
          var name_tag;
          for (const tag of instance.Tags) {
            if (tag['Key'] == 'Name') {
              name_tag = tag['Value'];
            }
          }

          const tmp = {
            "color": (instance.State.Name == "running") ? "#28B228" : "B22828",
            "fields": [{
              "title": "マシン名",
              "value": name_tag,
              "short": true
            }, {
              "title": "ネットワーク",
              "value": "WAN :" + instance.PublicIpAddress + "\nLAN:" + instance.PrivateIpAddress,
              "short": true
            }, {
              "title": "インスタンスタイプ",
              "value": instance.InstanceType,
              "short": true
            }, {
              "title": "動作状態",
              "value": instance.State.Name,
              "short": true
            }]
          }
          attachments.push(tmp);
        }
      });

      const payload = {
        "channel": "#ec2_price",
        "username": "ec2bot",
        "attachments": attachments
      };

      const options = {
        url: 'https://<your slack hook address>',
        form: 'payload=' + JSON.stringify(payload),
        json: true
      };

      request.post(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body.name);
        }
        else {
          console.log('error: ' + response.statusCode + body);
        }
      });
    }
    return true;
  });
}

// aws Price
function costExplorer_status() {
  const costexplorer = new AWS.CostExplorer({ region: 'us-east-1' });

  const params = {
    "TimePeriod": {
      "Start": moment().startOf('month').format("YYYY-MM-DD"),
      "End": moment().endOf('month').format("YYYY-MM-DD")
    },
    "Metrics": ["BlendedCost"],
    "Granularity": "MONTHLY",
    "GroupBy": [{
      "Key": "SERVICE",
      "Type": "DIMENSION"
    }]
  };

  costexplorer.getCostAndUsage(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return false;
    }
    else {
      for (const result of data.ResultsByTime) {　　
        var attachments = [];
        for (const service of result.Groups) {
          const today = moment().format("DD");
          const lastDay = moment().endOf('month').format("DD");

          const fields = {
            "color": "#B2B228",
            "fields": [{
              "title": "サービス",
              "value": service["Keys"][0],
              "short": true
            }, {
              "title": "料金",
              "value": service["Metrics"]["BlendedCost"]["Amount"] + service["Metrics"]["BlendedCost"]["Unit"],
              "short": true
            }, {
              "title": "予想料金",
              "value": (service["Metrics"]["BlendedCost"]["Amount"] / today) * lastDay + service["Metrics"]["BlendedCost"]["Unit"],
              "short": true
            }]
          };
          attachments.push(fields);
        }
      }

      var payload = {
        "channel": "#ec2_price",
        "username": "ec2bot",
        "attachments": attachments
      };

      var options = {
        url: 'https://<your slack hook address>',
        form: 'payload=' + JSON.stringify(payload),
        json: true
      };

      request.post(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body.name);
        }
        else {
          console.log('error: ' + response.statusCode + body);
        }
      });
    }
    return true;
  });
}

exports.handler = (event, context, callback) => {
  var r_str = '';
  var result = true;

  result = ec2_status();
  r_str += (result) ? 'ec2: Success, ' : 'ec2: Failed, ';

  result = costExplorer_status();
  r_str += (result) ? 'ce: Success, ' : 'ce: Failed, ';

  callback(null, r_str);
}

