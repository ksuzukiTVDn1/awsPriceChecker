import moment from 'moment';
import { double } from 'aws-sdk/clients/storagegateway';

export class CERequester {
  private ce: AWS.CostExplorer;

  constructor(ce: AWS.CostExplorer) {
    this.ce = ce;
  }

  getDimensionPrice(slack_ctx: any) {

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

    this.ce.getCostAndUsage(params, (err: any , data: any) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        var attachments: any[] = [];
        var cost: double = 0;

        for (const result of data.ResultsByTime) {
          for (const service of result.Groups) {
            const today = moment().format("DD");
            const lastDay = moment().endOf('month').format("DD");
            cost += parseFloat(service.Metrics.BlendedCost.Amount);

            const fields = {
              "color": "#B2B228",
              "fields": [{
                "title": "サービス",
                "value": service.Keys[0],
                "short": true
              }, {
                "title": "料金",
                "value": service.Metrics.BlendedCost.Amount + service.Metrics.BlendedCost.Unit,
                "short": true
              }]
            };
            attachments.push(fields);
          }
        }

        const fields = {
          "color": "#B2B228",
          "fields": [{
            "title": "合計",
            "value": cost,
            "short": false
          }]
        };
        attachments.push(fields);

        slack_ctx.send(attachments);
      }
    });
  }
}
