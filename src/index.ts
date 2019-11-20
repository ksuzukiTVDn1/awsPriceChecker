import * as AWS from 'aws-sdk';
import {EC2Requester} from './ec2';
import {CERequester} from './ce';
import {SlackRequester} from './slack';

// AWS Initialize
const accessKeyId: string  = <your accesskey here>;
const secretAccessKey: string  = <your secret accesskey here>;
const cred = new AWS.Credentials(accessKeyId, secretAccessKey);

// Slack Initialize
const hook_url: string  = <your slack hook url here>;
const channel: string = <your slack channel name here>;
const bot_name: string = <slack bot name here>;
const slack_ctx = new SlackRequester(hook_url, channel, bot_name);

// EC2 Instance Check
const ec2 = new AWS.EC2({region: <your region here>});
const ec2req = new EC2Requester(ec2);
//ec2req.getDescInstance(slack_ctx);


// AWS Price Check
const costexplorer = new AWS.CostExplorer({region: <your region here>});
const cereq = new CERequester(costexplorer);
cereq.getDimensionPrice(slack_ctx);



