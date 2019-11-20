const request = require('request');

export class SlackRequester{
  private hook_url: string;
  private channel: string;
  private bot_name: string;

  constructor(hook_url: string, channel: string, bot_name: string){
    this.hook_url = hook_url;
    this.channel = channel;
    this.bot_name = bot_name;
  }

  send(post_data: any[]){
    const payload = {
        "channel": this.channel,
        "username": this.bot_name,
        "attachments": post_data
    };

    const options = {
        url: this.hook_url,
        form: 'payload=' + JSON.stringify(payload),
        json: true
    };
    
    request.post(options, (error: any, response: any, body:any) => {
        if (!error && response.statusCode == 200) {
          console.log('message sended.');
        }
        else {
          console.log('error: ' + response.statusCode + body);
        }
    });
  }
}

