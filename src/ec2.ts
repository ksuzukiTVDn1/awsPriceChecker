export class EC2Requester{
  private ec2: AWS.EC2;

  constructor(ec2: AWS.EC2){  
    this.ec2 = ec2;
  }

  getDescInstance(slack_ctx: any){
    var attachments: any[] = [];

    this.ec2.describeInstances({}, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        const resevations: AWS.EC2.ReservationList | undefined = data.Reservations;
        for(const r of resevations || [] ) {
          const instance: AWS.EC2.InstanceList | undefined = r.Instances;
          for (const i of instance || []) {
            var name_tag: string | undefined;
              for (const tag of i.Tags || []) {
                if(tag.Key == 'Name'){
                  name_tag = tag.Value;
                }
              }
  
              const s = i.State || { 'Name': 'undefined'};
              const tmp = {
                "color": (s.Name == "running") ? "#28B228" : "B22828",
                "fields": [{
                  "title": "マシン名",
                  "value": name_tag,
                  "short": true
                }, {
                  "title": "ネットワーク",
                  "value": "WAN :" + i.PublicIpAddress + "\nLAN:" + i.PrivateIpAddress,
                  "short": true
                }, {
                  "title": "インスタンスタイプ",
                  "value": i.InstanceType,
                  "short": true
                }, {
                  "title": "動作状態",
                  "value": s.Name,
                  "short": true
                }]
              }
              attachments.push(tmp);
            }
          }
          slack_ctx.send(attachments);
        }
    });
  }
}

